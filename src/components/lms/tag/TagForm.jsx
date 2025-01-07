'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import { CategoriesField } from '../general/fields';
import { addNewTag, updateExistingTag } from '@/services/private/lms/tag';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

const TagForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addTag } = useMutation({
    mutationFn: addNewTag,
  });
  const { mutateAsync: updateTag } = useMutation({
    mutationFn: updateExistingTag,
  });

  const initialValues = {
    name: selected?.name || '',
    categories: selected?.category.map(i => i.id) || [],
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateTag({ payload: { id: selected.id, ...values } });
        toast.success('Tag updated successfully');
      } else {
        await addTag({ payload: { ...values } });
        toast.success('Tag added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsTags, selected.id] : [queryKeys.lmsTags] },
      ]);
      router.push('/portal/lms/tag');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Tag Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="name" label="Name" placeholder="Name" required />
              </div>

              <div className="w-full xl:w-1/2">
                <CategoriesField name="categories" label="Categories" placeholder="Categories" required />
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

export default TagForm;
