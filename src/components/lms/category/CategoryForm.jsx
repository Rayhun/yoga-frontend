'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import { addNewCategory, updateExistingCategory } from '@/services/private/lms/category';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

const CategoryForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { options: categoriesOptions } = useLMSCategoryOptions();
  const { mutateAsync: addCategory } = useMutation({
    mutationFn: addNewCategory,
  });
  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: updateExistingCategory,
  });

  const initialValues = {
    name: selected?.name || '',
    parent: selected?.parent?.id || '',
    is_feature: selected?.is_feature || false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    parent: Yup.number(),
    is_feature: Yup.bool(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateCategory({ payload: { id: selected.id, ...values } });
        toast.success('Category updated successfully');
      } else {
        await addCategory({ payload: { ...values } });
        toast.success('Category added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsCategories, selected.id] : [queryKeys.lmsCategories] },
      ]);
      router.push('/portal/admin/lms/category');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Category Form">
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
                <FormikSelect name="parent" label="Parent" placeholder="Parent" options={categoriesOptions} />
              </div>
            </div>
            <FormikCheckbox name="is_feature" label="Featured" />
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default CategoryForm;
