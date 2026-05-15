'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegFileImage } from 'react-icons/fa6';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import {
  AccessSettingField,
  DifficultyField,
  IntensityField,
  VisibilitySettingField,
  FocusAreasField,
  CategoriesField,
  ContentCatalogTagsField,
  ExpertField,
} from '@/components/lms/general/fields';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { addNewSession, updateExistingSession } from '@/services/private/lms/session';
import { toastApiError } from '@/utils/helpers';
import { LMS_DOC_STATUS_OPTIONS } from '@/utils/options';
import queryKeys from '@/utils/query-keys';
import { SESSION_TYPE } from '@/utils/enums';
import { ONE_MB } from '@/utils/general';

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
    description: selected?.description || '',
    duration: selected?.duration || '',
    status: selected?.status || '',
    expert: selected?.expert || '',
    difficulty: selected?.difficulty || '',
    intensity: selected?.intensity || '',
    access_setting: selected?.access_setting || '',
    visibility_setting: selected?.visibility_setting || '',
    focus_areas: selected?.focus_areas || [],
    equipments: selected?.equipments || [],
    languages: selected?.languages || [],
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    file: null,
    relife_index: Boolean(selected?.relife_index),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    duration: Yup.string().required('Required!'),
    status: Yup.string().required('Required!'),
    expert: Yup.string(),
    difficulty: Yup.string().required('Required!'),
    intensity: Yup.string().required('Required!'),
    access_setting: Yup.string().required('Required!'),
    visibility_setting: Yup.string().required('Required!'),
    focus_areas: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 focus area is required'),
    equipments: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 equipment is required'),
    languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    file: Yup.mixed()
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
      const payload = { ...values, content_type: SESSION_TYPE.image };
      if (isEditMode) {
        await updateImageSession({ payload: { id: selected.id, ...payload } });
        toast.success('Image Session updated successfully');
      } else {
        await addImageSession({ payload });
        toast.success('Image Session added successfully');
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
    <FormLayoutWrapper title="Image Session Form">
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
              <div className="md:w-1/2">
                <ExpertField />
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
                <FocusAreasField required />
              </div>
            </div>
            <FormikCheckbox name="relife_index" label="Relife index" />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <FormikSubmittableField
                  name="equipments"
                  label="Equipments"
                  placeholder="Equipments"
                  required
                />
              </div>
              <div className="md:w-1/2">
                <FormikSubmittableField name="languages" label="Languages" placeholder="Languages" required />
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                <CategoriesField required />
                <ContentCatalogTagsField context="session" required />
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
            <FormikDropzone
                  name="file"
                  label="File"
                  fileURLs={selected?.content_file ? [selected?.content_file] : []}
                  Icon={FaRegFileImage}
                  required
                />
              <div className="md:w-1/2">
                
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
