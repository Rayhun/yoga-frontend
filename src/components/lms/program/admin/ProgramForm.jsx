'use client';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import {
  AccessSettingField,
  VisibilitySettingField,
  CategoriesField,
  TagsField,
} from '@/components/lms/general/fields';
import Button from '@/components/common/Button';
import ProgramFormContentOptions from './ProgramFormContentOptions';
import { addNewProgram, updateExistingProgram } from '@/services/private/lms/program';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { LMS_DOC_STATUS_OPTIONS } from '@/utils/options';
import { ONE_MB } from '@/utils/general';
import queryKeys from '@/utils/query-keys';
import { ACCESS_SETTING } from '@/utils/enums';
import useLMSProgramOptions from '@/hooks/useLMSProgramOptions';

const ProgramForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { options: programOptions } = useLMSProgramOptions();
  const { mutateAsync: addProgram } = useMutation({
    mutationFn: addNewProgram,
  });
  const { mutateAsync: updateProgram } = useMutation({
    mutationFn: updateExistingProgram,
  });

  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    benefits: selected?.benefits || '',
    file: null,
    status: selected?.status || '',
    access_setting: selected?.access_setting || '',
    visibility_setting: selected?.visibility_setting || '',
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    linked_program: selected?.linked_program || '',
    program_content: (selected?.program || [{ content_id: '', content_type: '', drip: '' }]).map(
      ({ content_id, content_type, drip, title }) => ({
        content_id,
        content_type,
        drip,
        title: title || '', // Preserve the title from API response
      })
    ),
    price: selected?.price || 0,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    file: Yup.mixed()
      .required('Required!')
      .test(
        'fileType',
        'Unsupported file format. Only images are allowed.',
        value => value && value.type.includes('image')
      )
      .test('fileSize', 'File size must be less than 1 MB', value => value && value.size <= 1 * ONE_MB),
    status: Yup.string().required('Required!'),
    access_setting: Yup.string().required('Required!'),
    visibility_setting: Yup.string().required('Required!'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    program_content: Yup.array()
      .of(
        Yup.object({
          content_id: Yup.string().trim().required('Required!'),
          content_type: Yup.string().trim().required('Required!'),
          drip: Yup.number('Must be a number').min(1, 'Must be a positive number').required('Required!'),
        })
      )
      .min(1, 'At least 1 option is required.'),
    price: Yup.number().when('access_setting', {
      is: ACCESS_SETTING.buy_now,
      then: schema =>
        schema
          .required('Price is required when buying now')
          .typeError('Must be a number')
          .min(0, 'Price must be at least $0'),
      otherwise: schema => schema.notRequired(),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { file, ...payload } = values;

      const { data: uploadedFile } = await uploadLMSFile({ file });

      if (isEditMode) {
        await updateProgram({ payload: { id: selected.id, ...payload, file: uploadedFile?.file_link } });
        toast.success('Program updated successfully');
      } else {
        await addProgram({ payload: { ...payload, file: uploadedFile?.file_link } });
        toast.success('Program added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsPrograms, selected.id] : [queryKeys.lmsPrograms] },
      ]);
      router.push('/portal/admin/lms/program');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Program Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={LMS_DOC_STATUS_OPTIONS}
                  required
                />
              </div>
            </div>
            <FormikField name="description" label="Description" placeholder="Description" rows={5} required />
            <FormikField name="benefits" label="Benefits" placeholder="Benefits" rows={5} required />

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <AccessSettingField required />
              </div>
              {values.access_setting === ACCESS_SETTING.buy_now && (
                <div className="w-full md:w-1/2">
                  <FormikField
                    name="price"
                    label="Price"
                    placeholder="Price"
                    type="number"
                    min={0}
                    required
                  />
                </div>
              )}
              <div className="w-full md:w-1/2">
                <VisibilitySettingField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <CategoriesField required />
              </div>
              <div className="md:w-1/2">
                <TagsField required />
              </div>
            </div>
            <div className="w-full xl:w-1/2">
              <FormikSelect
                name="linked_program"
                label="Linked Program"
                placeholder="Select Linked Program"
                options={programOptions}
              />
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikDropzone
                  name="file"
                  label="File"
                  fileURLs={selected?.image ? [selected.image] : []}
                  Icon={FaRegFileImage}
                  required
                />
              </div>
            </div>

            <div className="my-5 flex flex-col gap-3">
              <h3 className="font-bold text-2xl text-black dark:text-white">Program Content</h3>
              <FieldArray
                name="program_content"
                render={helpers => <ProgramFormContentOptions {...helpers} />}
              />
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

export default ProgramForm;
