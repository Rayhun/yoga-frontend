'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import { addNewExpert, updateExistingExpert } from '@/services/private/lms/experts';
import { toastApiError } from '@/utils/helpers';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import queryKeys from '@/utils/query-keys';

const ExpertForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });
  const { mutateAsync: updateExpert } = useMutation({
    mutationFn: updateExistingExpert,
  });

  const initialValues = {
    name: selected?.name || '',
    email: selected?.email || '',
    title: selected?.title || '',
    description: selected?.description || '',
    file: null,
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    email: Yup.string().email('Invalid email format').required('Required!'),
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    file: Yup.mixed().nullable(),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateExpert({ payload: { id: selected.id, ...values } });
        toast.success('Expert updated successfully');
      } else {
        await addExpert({ payload: { ...values } });
        toast.success('Expert added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsExperts, selected.id] : [queryKeys.lmsExperts] },
      ]);
      router.push('/portal/lms/experts');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Expert Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="name" label="Name" placeholder="Name" required />
              </div>

              <div className="w-full xl:w-1/2">
                <FormikField type="email" name="email" label="Email" placeholder="Email" required />
              </div>
            </div>
            <FormikField name="title" label="Title" placeholder="Title" required />
            <FormikField name="description" label="Description" placeholder="Description" rows={5} required />
            <CategoriesField name="categories" label="Categories" placeholder="Categories" required />
            <TagsField name="tags" label="Tags" placeholder="Tags" required />
            <FormikField
              type="file"
              name="file"
              label="File"
              accept="image/*"
              value={null}
              className="transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:px-2.5 file:py-1 file:text-sm focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30 dark:file:text-white"
              onChange={e => setFieldValue(e.target.name, e.target.files[0])}
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

export default ExpertForm;
