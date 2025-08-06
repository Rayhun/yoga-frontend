'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createNewConsultation, updateExistingConsultation } from '@/services/private/expert/consultation';
import { toastApiError } from '@/utils/helpers';
import FormikMultiSelect from '../form/formik/FormikMultiSelect';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import queryKeys from '@/utils/query-keys';
import { CONSULTATION_TYPES } from '@/utils/constants';
import { ONE_MB } from '@/utils/general';
import FormikSubmittable from '../form/formik/FormikSubmittable';

const ConsultationForm = ({ initialData = {}, isEditMode = false, consultationId = null }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for consent form option selection
  const [consentOption, setConsentOption] = useState(
    initialData?.consent_file?.length > 0 ? 'upload' : 
    initialData?.consent_file_urls?.length > 0 ? 'link' : 'upload'
  );

  // Function to handle consent option change and clear the other field
  const handleConsentOptionChange = (option, setFieldValue) => {
    setConsentOption(option);
    
    // Clear the other field when switching options
    if (option === 'upload') {
      setFieldValue('consent_file_urls', []);
    } else if (option === 'link') {
      setFieldValue('consent_file', []);
    }
  };

  const { mutateAsync: createConsultation } = useMutation({
    mutationFn: createNewConsultation,
  });

  const { mutateAsync: updateConsultation } = useMutation({
    mutationFn: updateExistingConsultation,
  });

  const initialValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 0,
    price: initialData?.price || 0,
    calender_link: initialData?.calender_link || '',
    consultation_type: initialData?.consultation_type?.split(',') || [],
    followup_support: initialData?.followup_support || [],
    followup_duration: initialData?.followup_duration || '',
    categories: initialData?.categories?.map(i => i.id) || [],
    tags: initialData?.tags?.map(i => i.id) || [],
    image: initialData?.image || null,
    consent_file: initialData?.consent_file || [],
    consent_file_urls: initialData?.consent_file_urls || [],
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    duration: Yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
    price: Yup.number().required('Price is required').min(0, 'Price must be at least $0'),
    calender_link: Yup.string().required('Calender Link is required'),
    consultation_type: Yup.array().min(1, 'At least one consultation type is required').required(),
    followup_support: Yup.array().min(1, 'At least one consultation type is required').required(),
    followup_duration: Yup.number()
      .required('Follow up Duration is required')
      .min(1, 'Duration must be at least 1 minute'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
    image: Yup.mixed().required('Image is required'),
    consent_file: Yup.array()
      .of(Yup.mixed())
      .max(5, 'Maximum 5 consent files allowed')
      .optional(),
    consent_file_urls: Yup.array()
      .of(Yup.string())
      .max(5, 'Maximum 5 consent file URLs allowed')
      .optional(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateConsultation({ payload: { ...values }, id: consultationId });
        toast.success('Personal Consultation updated successfully');
      } else {
        await createConsultation({ payload: { ...values } });
        toast.success('Personal Consultation added successfully');
      }

      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.expertConsultationDetails, selected.id]
            : [queryKeys.expertConsultations],
        },
      ]);
      router.push('/portal/teacher/profile?active_tab=consult');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => {
            return (
              <Form className="flex flex-col gap-4">
                <FormikField name="title" label="Title" required />
                <FormikField name="description" label="Description" rows={4} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikField name="duration" label="Duration (mins)" type="number" min={1} required />
                  <FormikField name="price" label="Price ($)" type="number" min={0} required />

                  <FormikField name="calender_link" label="Calendar Link" required />

                  <FormikMultiSelect
                    name="consultation_type"
                    label="Consultation Type"
                    options={CONSULTATION_TYPES}
                    required
                  />
                  <FormikMultiSelect
                    name="followup_support"
                    label="Follow-up Support"
                    options={CONSULTATION_TYPES}
                    required
                  />

                  <FormikField
                    name="followup_duration"
                    label="Followup Duration (mins)"
                    type="number"
                    min={1}
                    required
                  />
                  <CategoriesField required />
                  <TagsField required />
                </div>
                <FormikDropzone
                  name="image"
                  label="Image"
                  fileURLs={initialData?.image ? [initialData.image] : []}
                  maxSize={10 * ONE_MB}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Consent or Intake Forms (Optional)</h3>
                    <p className="text-sm text-gray-600 mb-4">Provide a link or upload a file if this consultation requires any pre-session forms. Max of 5.</p>
                    
                    <div className="space-y-4">
                      {/* Upload File Option */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <input
                            type="radio"
                            name="consent_option"
                            value="upload"
                            className="mr-3 w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                            checked={consentOption === 'upload'}
                            onChange={(e) => handleConsentOptionChange(e.target.value, setFieldValue)}
                          />
                          <label className="font-medium text-gray-700 cursor-pointer">Upload File</label>
                        </div>
                        <div className="ml-6">
                          {consentOption === 'upload' && (
                            <FormikDropzone
                              name="consent_file"
                              label=""
                              fileURLs={initialData?.consent_file ? [initialData.consent_file] : []}
                              maxSize={10 * ONE_MB}
                              accept={{
                                'application/pdf': ['.pdf', '.doc', '.docx'],
                                'application/msword': ['.doc', '.docx'],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                'application/vnd.ms-excel': ['.xls', '.xlsx'],
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                                'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
                                'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                                'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
                              }}
                              supportedFilesText="PDF, DOC, JPG"
                              multiple
                            />
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      {/* Provide Link Option */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <input
                            type="radio"
                            name="consent_option"
                            value="link"
                            className="mr-3 w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                            checked={consentOption === 'link'}
                            onChange={(e) => handleConsentOptionChange(e.target.value, setFieldValue)}
                          />
                          <label className="font-medium text-gray-700 cursor-pointer">Provide Link:</label>
                        </div>
                        <div className="ml-6">
                          {consentOption === 'link' && (
                            <FormikSubmittable 
                              name="consent_file_urls" 
                              label="" 
                              placeholder="Paste forms URL here"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
                  <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" isLoading={isSubmitting}>
                    {isSubmitting
                      ? isEditMode
                        ? 'Updating...'
                        : 'Submitting...'
                      : isEditMode
                      ? 'Update Consultation'
                      : 'Submit My Consultation'}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default ConsultationForm;
