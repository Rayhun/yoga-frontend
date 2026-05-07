'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikFileField from '@/components/common/form/formik/FormikFileField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikTimePicker from '@/components/common/form/formik/FormikTimePicker';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  createAIChatPromptType,
  updateAIChatPrompt,
  getTrackers,
  getScheduleOptions,
} from '@/services/private/ai-prompts';

const CHAT_TYPE_OPTIONS = [
  { label: 'FAQs', value: 'faqs' },
  { label: 'Coach', value: 'coach' },
  { label: 'Agent', value: 'agent' },
];

const DAY_OPTIONS = [
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
];

const INSIGHT_OPTIONS = [
  { label: 'Habit', value: 'habit' },
  { label: 'Cycle', value: 'cycle' },
];

const AIChatPromptsForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const [selectedChatType, setSelectedChatType] = useState(selected?.chat_type || '');
  const [selectedInsight, setSelectedInsight] = useState(selected?.insights || '');

  const { data: trackersData, isLoading: trackersLoading } = useQuery({
    queryKey: ['trackers', selectedInsight],
    queryFn: () => getTrackers(selectedInsight),
    enabled: !!selectedInsight,
    select: response => {
      return (
        response?.data?.data?.map(tracker => ({
          label: tracker.title || tracker.name,
          value: tracker.id,
        })) || []
      );
    },
  });

  const { data: scheduleOptionsData, isLoading: scheduleOptionsLoading } = useQuery({
    queryKey: 'scheduleOptions',
    queryFn: getScheduleOptions,
    select: response => {
      return (
        response?.data?.data?.map(option => ({
          label: option.label,
          value: option.value,
        })) || []
      );
    },
  });

  const { mutateAsync: addPrompt } = useMutation({
    mutationFn: createAIChatPromptType,
  });
  const { mutateAsync: updatePrompt } = useMutation({
    mutationFn: updateAIChatPrompt,
  });

  const initialValues = {
    title: selected?.title || '',
    prompt: selected?.prompt || '',
    chat_type: selected?.chat_type || '',
    gpt_model: selected?.gpt_model || '',
    temprature: selected?.temprature || '',
    max_tokens: selected?.max_tokens || '',
    insights: selected?.insights || '',
    all_trackers: selected?.all_trackers || [],
    schedule_frequency: selected?.schedule_frequency || '',
    day_of_week: selected?.day_of_week || '',
    schedule_time: selected?.schedule_time || '08:00',
    file: null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    prompt: Yup.string().required('Prompt is required'),
    chat_type: Yup.string().required('Chat Type is required'),
    gpt_model: Yup.string().required('GPT Model is required'),
    temprature: Yup.string().required('Temprature is required'),
    max_tokens: Yup.string().required('Maximum Token is required'),
    insights: Yup.string().when('chat_type', {
      is: 'agent',
      then: schema => schema.required('Insight is required'),
      otherwise: schema => schema.notRequired(),
    }),
    all_trackers: Yup.array().when('chat_type', {
      is: 'agent',
      then: schema => schema.min(1, 'At least one tracker is required'),
      otherwise: schema => schema.notRequired(),
    }),
    schedule_frequency: Yup.string().when('chat_type', {
      is: 'agent',
      then: schema => schema.required('Schedule Frequency is required'),
      otherwise: schema => schema.notRequired(),
    }),
    day_of_week: Yup.string().when(['chat_type', 'schedule_frequency'], {
      is: (chatType, scheduleFrequency) => chatType === 'agent' && scheduleFrequency === 'weekly',
      then: schema => schema.required('Day of week is required when schedule is weekly'),
      otherwise: schema => schema.notRequired(),
    }),
    schedule_time: Yup.string().when('chat_type', {
      is: 'agent',
      then: schema => schema.required('Time is required'),
      otherwise: schema => schema.notRequired(),
    }),
    file: Yup.mixed()
      .nullable()
      .when('chat_type', {
        is: 'faqs',
        then: schema =>
          schema.test('file-required', 'File is required when chat type is FAQs', value => {
            if (isEditMode && selected?.faq_file) return true;
            return !!value;
          }),
        otherwise: schema => schema.notRequired(),
      })
      .test('fileSize', 'File is too large (max 10MB)', value => {
        if (!value) return true;
        return value.size <= 10 * 1024 * 1024;
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      const isAgent = values.chat_type === 'agent';
      const agentOnlyFields = [
        'insights',
        'all_trackers',
        'schedule_frequency',
        'day_of_week',
        'schedule_time',
      ];

      Object.keys(values).forEach(key => {
        if (!isAgent && agentOnlyFields.includes(key)) {
          return;
        }
        if (key === 'file' && values[key]) {
          formData.append('faq_file', values[key]);
        } else if (key === 'all_trackers' && Array.isArray(values[key])) {
          values[key].forEach(trackerId => {
            formData.append('all_trackers', trackerId);
          });
        } else if (values[key] !== undefined && values[key] !== '' && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const submitData = formData;

      const config = {
        headers: {
          'Content-Type': null,
        },
      };

      if (isEditMode) {
        submitData.append('id', selected.id);
        await updatePrompt({ payload: submitData, config });
        toast.success('AI Chat prompt updated successfully');
      } else {
        await addPrompt({ payload: submitData, config });
        toast.success('AI Chat prompt added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode ? [queryKeys.aiPromptsList, selected.id] : [queryKeys.aiPromptsList],
        },
      ]);
      router.push('/portal/admin/ai-prompts');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="AI Chat Prompt Form" description="Add or edit a AI Chat Prompt">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="flex flex-col gap-3">
            <FormikField name="title" label="Title" placeholder="Title" required />

            <div className="grid grid-cols-2 gap-4">
              <FormikSelect
                name="chat_type"
                label="Chat Type"
                options={CHAT_TYPE_OPTIONS}
                onChange={value => {
                  setSelectedChatType(value);
                  setFieldValue('chat_type', value);
                  if (value !== 'agent') {
                    setSelectedInsight('');
                    setFieldValue('insights', '');
                    setFieldValue('all_trackers', []);
                    setFieldValue('schedule_frequency', '');
                    setFieldValue('day_of_week', '');
                    setFieldValue('schedule_time', '08:00');
                  }
                }}
                required
              />

              <FormikField name="gpt_model" label="GPT Model" placeholder="GPT Model" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormikField name="temprature" label="Temprature" required />
              <FormikField name="max_tokens" label="Maximum Token" required />
            </div>

            {values.chat_type === 'agent' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormikSelect
                    name="insights"
                    label="Insight"
                    options={INSIGHT_OPTIONS}
                    placeholder="Select insight..."
                    onChange={value => {
                      setSelectedInsight(value);
                      setFieldValue('insights', value);
                      setFieldValue('all_trackers', []);
                    }}
                    required
                  />

                  <div className="flex flex-col gap-1">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block font-medium text-black dark:text-white required">
                        Trackers
                      </label>
                      <label className="flex cursor-pointer select-none items-center text-sm">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={
                              trackersData?.length > 0 && values.all_trackers?.length === trackersData.length
                            }
                            onChange={e => {
                              if (e.target.checked) {
                                setFieldValue('all_trackers', trackersData?.map(t => t.value) || []);
                              } else {
                                setFieldValue('all_trackers', []);
                              }
                            }}
                            disabled={!values.insights}
                          />
                          <div
                            className={`mr-2 flex h-5 w-5 items-center justify-center rounded border-2 ${
                              trackersData?.length > 0 && values.all_trackers?.length === trackersData.length
                                ? 'border-primary bg-gray dark:bg-transparent'
                                : 'border-gray-400 dark:border-gray-500'
                            }`}
                          >
                            <span
                              className={`opacity-0 ${
                                trackersData?.length > 0 &&
                                values.all_trackers?.length === trackersData.length
                                  ? '!opacity-100'
                                  : ''
                              }`}
                            >
                              <svg
                                width="11"
                                height="8"
                                viewBox="0 0 11 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                  fill="#3056D3"
                                  stroke="#3056D3"
                                  strokeWidth="0.4"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                        All
                      </label>
                    </div>
                    <FormikMultiSelect
                      name="all_trackers"
                      options={trackersData || []}
                      placeholder={values.insights ? 'Select trackers...' : 'Select insight first...'}
                      loading={trackersLoading}
                      disabled={trackersLoading || !values.insights}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormikSelect
                    name="schedule_frequency"
                    label="Schedule Frequency"
                    options={scheduleOptionsData || []}
                    placeholder="Select schedule frequency..."
                    loading={scheduleOptionsLoading}
                    disabled={scheduleOptionsLoading}
                    onChange={value => {
                      setFieldValue('schedule_frequency', value);
                      if (value !== 'weekly') {
                        setFieldValue('day_of_week', '');
                      }
                    }}
                    required
                  />

                  <FormikTimePicker name="schedule_time" label="Time" required />
                </div>

                {values.schedule_frequency === 'weekly' && (
                  <FormikSelect
                    name="day_of_week"
                    label="Day of Week"
                    options={DAY_OPTIONS}
                    placeholder="Select a day..."
                    required
                  />
                )}
              </>
            )}

            <FormikField name="prompt" label="Prompt" placeholder="Enter prompt..." required rows={4} />

            <FormikFileField
              name="file"
              label={selectedChatType === 'faqs' ? 'Upload FAQs File' : 'Upload File (Optional)'}
              accept={['.pdf', '.doc', '.docx', '.txt', '.csv']}
              maxSize={10 * 1024 * 1024}
              required={selectedChatType === 'faqs' && !(isEditMode && selected?.faq_file)}
              fileURL={selected?.faq_file || selected?.file_info?.url || ''}
            />

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default AIChatPromptsForm;
