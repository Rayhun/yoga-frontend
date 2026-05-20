'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegFileVideo, FaRegFileAudio, FaRegFileImage } from 'react-icons/fa6';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import {
  AccessSettingField,
  DifficultyField,
  IntensityField,
  VisibilitySettingField,
  CatalogTagsField,
  EquipmentsField,
  ExpertField,
} from '@/components/lms/general/fields';
import {
  SESSION_CATALOG_FIELDS,
  SESSION_CATALOG_FIELD_NAMESPACES,
  mapSessionFieldTagIds,
  mapContentCultureExperienceIds,
  seedCatalogRowsFromTags,
  seedCultureExperienceRows,
} from '@/utils/sessionCatalogTags';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { addNewSession, updateExistingSession } from '@/services/private/lms/session';
import { toastApiError } from '@/utils/helpers';
import { LMS_DOC_STATUS_OPTIONS } from '@/utils/options';
import queryKeys from '@/utils/query-keys';
import { SESSION_TYPE } from '@/utils/enums';
import { ONE_MB } from '@/utils/general';
import { normalizeEquipmentsForForm } from '@/utils/sessionQuizInitialValues';

const VideoSession = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addVideoSession } = useMutation({
    mutationFn: addNewSession,
  });
  const { mutateAsync: updateVideoSession } = useMutation({
    mutationFn: updateExistingSession,
  });

  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    duration: selected?.duration || '',
    status: selected?.status || '',
    expert: selected?.expert || '',
    difficulty: selected?.difficulty || '',
    intensity: selected?.intensity || '',
    access_setting: selected?.access_setting || '',
    visibility_setting: selected?.visibility_setting || '',
    focus_areas: mapSessionFieldTagIds(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.focus_areas),
    equipments: normalizeEquipmentsForForm(selected?.equipments),
    culture_experience: mapContentCultureExperienceIds(selected),
    languages: mapSessionFieldTagIds(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.languages),
    categories: mapSessionFieldTagIds(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.categories),
    file: null,
    relief_index: Boolean(selected?.relief_index),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    duration: Yup.string()
      .required('Required!')
      .matches(/^([0-5]?[0-9]):([0-5][0-9])$/, 'Please enter duration in MM:SS format (e.g., 03:40)'),
    status: Yup.string().required('Required!'),
    expert: Yup.string(),
    difficulty: Yup.string().required('Required!'),
    intensity: Yup.string().required('Required!'),
    access_setting: Yup.string().required('Required!'),
    visibility_setting: Yup.string().required('Required!'),
    focus_areas: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least 1 focus & approach is required'),
    equipments: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 equipment is required'),
    culture_experience: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one culture experience is required'),
    languages: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least 1 language is required'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    file: Yup.mixed()
      .required('Required!')
      .test(
        'fileType',
        'Unsupported file format. Only videos are allowed.',
        value => value && value.type.includes('video')
      )
      .test('fileSize', 'File size must be less than 10 MB', value => value && value.size <= 10 * ONE_MB),
    audio_file: Yup.mixed()
      .required('Required!')
      .test(
        'fileType',
        'Unsupported file format. Only audios are allowed.',
        value => value && value.type.includes('audio')
      )
      .test('fileSize', 'File size must be less than 5 MB', value => value && value.size <= 5 * ONE_MB),
    thumbnail: Yup.mixed()
      .required('Required!')
      .test(
        'fileType',
        'Unsupported file format. Only images are allowed.',
        value => value && value.type.includes('image')
      )
      .test('fileSize', 'File size must be less than 1 MB', value => value && value.size <= 1 * ONE_MB),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values, content_type: SESSION_TYPE.video };
      if (isEditMode) {
        await updateVideoSession({ payload: { id: selected.id, ...payload } });
        toast.success('Video Session updated successfully');
      } else {
        await addVideoSession({ payload });
        toast.success('Video Session added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsVideoSessions, selected.id] : [queryKeys.lmsVideoSessions] },
      ]);
      router.push('/portal/admin/lms/session/video');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Video Session Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikField 
                  type="text" 
                  name="duration" 
                  label="Duration (MM:SS)" 
                  placeholder="03:40" 
                  required 
                />
              </div>
            </div>
            <FormikRichTextEditor name="description" label="Description" placeholder="Description" rows={5} required />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={LMS_DOC_STATUS_OPTIONS}
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <DifficultyField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <IntensityField required />
              </div>
              <div className="w-full md:w-1/2">
                <AccessSettingField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <VisibilitySettingField required />
              </div>
              <div className="w-full md:w-1/2">
                <CatalogTagsField
                  context="session"
                  seedRows={seedCatalogRowsFromTags(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.focus_areas)}
                  name="focus_areas"
                  field={SESSION_CATALOG_FIELDS.focus_areas.field}
                  label={SESSION_CATALOG_FIELDS.focus_areas.label}
                  modalTitle={SESSION_CATALOG_FIELDS.focus_areas.modalTitle}
                  triggerPlaceholder={SESSION_CATALOG_FIELDS.focus_areas.triggerPlaceholder}
                  required
                />
              </div>
            </div>
            <FormikSwitch
              name="relief_index"
              variant="card"
              label="Relief index"
              description="Turn on to surface this session in the Relief index."
            />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <EquipmentsField required />
              </div>
              <div className="w-full md:w-1/2">
                <CatalogTagsField
                  context="session"
                  seedRows={seedCatalogRowsFromTags(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.languages)}
                  name="languages"
                  field={SESSION_CATALOG_FIELDS.languages.field}
                  label={SESSION_CATALOG_FIELDS.languages.label}
                  modalTitle={SESSION_CATALOG_FIELDS.languages.modalTitle}
                  triggerPlaceholder={SESSION_CATALOG_FIELDS.languages.triggerPlaceholder}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <CatalogTagsField
                context="session"
                seedRows={seedCatalogRowsFromTags(selected?.tags, SESSION_CATALOG_FIELD_NAMESPACES.categories)}
                name="categories"
                field={SESSION_CATALOG_FIELDS.categories.field}
                label={SESSION_CATALOG_FIELDS.categories.label}
                modalTitle={SESSION_CATALOG_FIELDS.categories.modalTitle}
                triggerPlaceholder={SESSION_CATALOG_FIELDS.categories.triggerPlaceholder}
                required
              />
              <CatalogTagsField
                context="session"
                seedRows={seedCultureExperienceRows(selected)}
                name="culture_experience"
                field={SESSION_CATALOG_FIELDS.culture_experience.field}
                label={SESSION_CATALOG_FIELDS.culture_experience.label}
                modalTitle={SESSION_CATALOG_FIELDS.culture_experience.modalTitle}
                triggerPlaceholder={SESSION_CATALOG_FIELDS.culture_experience.triggerPlaceholder}
                required
              />
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <ExpertField />
              </div>
              <div className="md:w-1/2">
                <FormikDropzone
                  name="file"
                  label="Video File"
                  fileURLs={selected?.content_file ? [selected?.content_file] : []}
                  Icon={FaRegFileVideo}
                  accept={{
                    'video/mp4': [],
                  }}
                  supportedFilesText="mp4 files are supported."
                  maxSize={10 * ONE_MB}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <FormikDropzone
                  name="audio_file"
                  label="Audio File"
                  fileURLs={selected?.audio_file ? [selected?.audio_file] : []}
                  Icon={FaRegFileAudio}
                  accept={{
                    'audio/wav': [],
                    'audio/mp3': [],
                    'audio/mpeg': [],
                  }}
                  supportedFilesText="wav, mp3 and mpeg files are supported."
                  maxSize={5 * ONE_MB}
                  required
                />
              </div>
              <div className="md:w-1/2">
                <FormikDropzone
                  name="thumbnail"
                  label="Thumbnail"
                  fileURLs={selected?.thumbnail_image ? [selected?.thumbnail_image] : []}
                  Icon={FaRegFileImage}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default VideoSession;
