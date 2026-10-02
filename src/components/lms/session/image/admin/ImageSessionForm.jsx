'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegFileImage, FaRegFileAudio } from 'react-icons/fa6';
import { MdOutlineDescription } from 'react-icons/md';
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

const GUIDE_DOCUMENT_ACCEPT = {
  'image/png': [],
  'image/jpeg': [],
  'image/jpg': [],
  'application/pdf': [],
  'application/msword': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
};

const stripHtml = value =>
  (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();

const GUIDE_CONTENT_FORMAT = {
  richText: 'rich_text',
  document: 'document',
};

const GUIDE_CONTENT_FORMAT_OPTIONS = [
  { label: 'Rich Text', value: GUIDE_CONTENT_FORMAT.richText },
  { label: 'Document (PDF / Word / Image)', value: GUIDE_CONTENT_FORMAT.document },
];

const getInitialContentFormat = selected => {
  if (!selected) return '';
  if (selected.content_file) return GUIDE_CONTENT_FORMAT.document;
  if (stripHtml(selected.description).length > 0) return GUIDE_CONTENT_FORMAT.richText;
  return '';
};

const isAllowedGuideDocument = file => {
  if (!file?.type) return false;
  return (
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
};

const parseReliefIndexValue = value =>
  value === true || value === 'yes' || value === 1 || value === '1';

const ImageSession = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addImageSession } = useMutation({
    mutationFn: addNewSession,
  });
  const { mutateAsync: updateImageSession } = useMutation({
    mutationFn: updateExistingSession,
  });

  const initialValues = {
    title: selected?.title || '',
    content_format: getInitialContentFormat(selected),
    description: selected?.description || '',
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
    thumbnail: null,
    audio_file: null,
    relief_index: parseReliefIndexValue(selected?.relief_index),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    content_format: Yup.string().required('Select a content type'),
    description: Yup.string().when('content_format', {
      is: GUIDE_CONTENT_FORMAT.richText,
      then: schema =>
        schema.test('rich-text-content', 'Rich text content is required.', value => stripHtml(value).length > 0),
      otherwise: schema => schema.notRequired(),
    }),
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
      .nullable()
      .when('content_format', {
        is: GUIDE_CONTENT_FORMAT.document,
        then: schema =>
          schema
            .test('fileRequired', 'Document is required.', function validateFile(value) {
              const hasUploadedFile = Boolean(value);
              const hasExistingFile = isEditMode && Boolean(selected?.content_file);
              return hasUploadedFile || hasExistingFile;
            })
            .test('fileType', 'Unsupported file format. Use PDF, Word, or image files.', value => {
              if (!value) return true;
              return isAllowedGuideDocument(value);
            })
            .test('fileSize', 'File size must be less than 10 MB', value => {
              if (!value) return true;
              return value.size <= 10 * ONE_MB;
            }),
        otherwise: schema => schema.notRequired(),
      }),
    thumbnail: Yup.mixed()
      .nullable()
      .test('fileType', 'Unsupported file format. Only images are allowed.', value => {
        if (!value) return true;
        return value.type?.includes('image');
      })
      .test('fileSize', 'File size must be less than 1 MB', value => {
        if (!value) return true;
        return value.size <= 1 * ONE_MB;
      }),
    audio_file: Yup.mixed()
      .nullable()
      .test('fileType', 'Unsupported file format. Only audio files are allowed.', value => {
        if (!value) return true;
        return value.type?.includes('audio');
      })
      .test('fileSize', 'File size must be less than 5 MB', value => {
        if (!value) return true;
        return value.size <= 5 * ONE_MB;
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        content_type: SESSION_TYPE.image,
        ...(values.content_format === GUIDE_CONTENT_FORMAT.richText ? { file: null } : { description: '' }),
      };
      delete payload.content_format;
      if (isEditMode) {
        await updateImageSession({ payload: { id: selected.id, ...payload } });
        toast.success('Guide updated successfully');
      } else {
        await addImageSession({ payload });
        toast.success('Guide added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsImageSessions, selected.id] : [queryKeys.lmsImageSessions] },
      ]);
      router.push('/portal/admin/lms/session/image');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Guide / Lesson Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="md:w-1/2">
                <ExpertField />
              </div>
            </div>

            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4/20">
              <h4 className="mb-1 text-sm font-semibold text-black dark:text-white">Guide Content</h4>
              <p className="mb-4 text-xs text-body dark:text-bodydark">
                Choose a content type, then add your lesson. Cover image and audio are optional.
              </p>
              <div className="flex flex-col gap-4">
                <FormikSelect
                  name="content_format"
                  label="Content Type"
                  placeholder="Select content type"
                  options={GUIDE_CONTENT_FORMAT_OPTIONS}
                  required
                  onChange={value => {
                    if (value === GUIDE_CONTENT_FORMAT.richText) {
                      setFieldValue('file', null);
                    } else if (value === GUIDE_CONTENT_FORMAT.document) {
                      setFieldValue('description', '');
                    }
                  }}
                />

                {values.content_format === GUIDE_CONTENT_FORMAT.richText ? (
                  <FormikRichTextEditor
                    name="description"
                    label="Content (Rich Text)"
                    placeholder="Write lesson content..."
                    rows={5}
                    required
                  />
                ) : null}

                {values.content_format === GUIDE_CONTENT_FORMAT.document ? (
                  <FormikDropzone
                    name="file"
                    label="Document (PDF / Word / Image)"
                    fileURLs={selected?.content_file ? [selected.content_file] : []}
                    Icon={MdOutlineDescription}
                    accept={GUIDE_DOCUMENT_ACCEPT}
                    supportedFilesText="PDF, Word (.doc/.docx), and image files are supported."
                    maxSize={10 * ONE_MB}
                    required
                  />
                ) : null}
              </div>
            </div>

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

            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4/20">
              <h4 className="mb-4 text-sm font-semibold text-black dark:text-white">Optional Media</h4>
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full md:w-1/2">
                  <FormikDropzone
                    name="thumbnail"
                    label="Cover Image / Infographic"
                    fileURLs={selected?.thumbnail_image ? [selected.thumbnail_image] : []}
                    Icon={FaRegFileImage}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <FormikDropzone
                    name="audio_file"
                    label="Audio File"
                    fileURLs={selected?.content_audio ? [selected.content_audio] : []}
                    Icon={FaRegFileAudio}
                    accept={{
                      'audio/wav': [],
                      'audio/mp3': [],
                      'audio/mpeg': [],
                    }}
                    supportedFilesText="wav, mp3 and mpeg files are supported."
                    maxSize={5 * ONE_MB}
                  />
                </div>
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

export default ImageSession;
