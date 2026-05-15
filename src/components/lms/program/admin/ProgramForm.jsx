'use client';
import { useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import { FiType, FiFileText, FiDollarSign } from 'react-icons/fi';
import {
  AccessSettingField,
  VisibilitySettingField,
  CategoriesField,
  ContentCatalogTagsField,
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
  const [isFileChanged, setIsFileChanged] = useState(false);
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
    // Map "open" from backend to "free" in the form
    access_setting: selected?.access_setting === ACCESS_SETTING.open ? ACCESS_SETTING.free : (selected?.access_setting || ''),
    visibility_setting: selected?.visibility_setting || '',
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    linked_program: selected?.linked_program || '',
    program_content: (selected?.program || [{ content_id: '', content_type: '', drip: '', order: '' }]).map(
      ({ content_id, content_type, drip, order, order_by, title }) => ({
        content_id,
        content_type,
        drip,
        order: order_by || order || '', // Prioritize order_by from API response (edit mode)
        title: title || '', // Preserve the title from API response for display
      })
    ),
    price: selected?.price || 0,
    relife_index: Boolean(selected?.relife_index),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    file: Yup.mixed()
      .required('Required!')
      .test(
        'fileType',
        'Unsupported file format. Only images are allowed.',
        value => value && value.type && value.type.includes('image')
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
          drip: Yup.number('Must be a number').min(0, 'Must be a non-negative number').required('Required!'),
          order: Yup.number('Must be a number').min(1, 'Must be a positive number').required('Required!'),
        })
      )
      .min(1, 'At least 1 option is required.')
      .test('uniqueOrder', 'Order numbers must be unique', function(value) {
        if (!value) return true;
        const orders = value.map(item => item.order).filter(order => order !== '');
        const uniqueOrders = new Set(orders);
        return orders.length === uniqueOrders.size;
      }),
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
      const { file, linked_program, program_content, ...payload } = values;

      // Transform program_content to remove title and change order to order_by
      const transformedProgramContent = program_content.map(({ title, order, ...content }) => ({
        ...content,
        order_by: order,
      }));

      payload.program_content = transformedProgramContent;
      
      // Debug: Log the transformed payload to confirm order_by is included
      console.log('Transformed program_content payload:', transformedProgramContent);

      // Only include linked_program in payload if it's not empty
      if (linked_program && linked_program !== '') {
        payload.linked_program = linked_program;
      }

      let fileUrl = null;

      // Only upload file if user actually selected a new file
      if (isEditMode && !isFileChanged) {
        // Edit mode and file was NOT changed by user - keep existing image URL
        fileUrl = selected?.image || null;
      } else if (file) {
        // New file was selected (create mode, or edit mode with file changed)
        const { data: uploadedFile } = await uploadLMSFile({ file });
        fileUrl = uploadedFile?.file_link;
      }

      if (isEditMode) {
        await updateProgram({ payload: { id: selected.id, ...payload, file: fileUrl } });
        toast.success('Program updated successfully');
      } else {
        await addProgram({ payload: { ...payload, file: fileUrl } });
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
                <FormikField name="title" label="Title" placeholder="Title" Icon={FiType} required />
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
            <FormikRichTextEditor name="description" label="Description" placeholder="Description" rows={5} required />
            <FormikField name="benefits" label="Benefits" placeholder="Benefits" rows={5} Icon={FiFileText} required />

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
                    Icon={FiDollarSign}
                    required
                  />
                </div>
              )}
              <div className="w-full md:w-1/2">
                <VisibilitySettingField required />
              </div>
              <div className="flex w-full items-center md:w-1/2">
                <FormikCheckbox name="relife_index" label="Relife index" />
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <CategoriesField required />
              <ContentCatalogTagsField context="program" required />
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
                  onDrop={() => setIsFileChanged(true)}
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
