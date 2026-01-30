'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { addNewLookupItem, updateExistingLookupItem } from '@/services/private/lms/lookup-item';

const CATEGORY_OPTIONS = [
  { label: 'Certifications', value: 'Certifications' },
  { label: 'Coaching Areas', value: 'Coaching Areas' },
];

const LookupItemForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addLookupItem } = useMutation({
    mutationFn: addNewLookupItem,
  });
  const { mutateAsync: updateLookupItem } = useMutation({
    mutationFn: updateExistingLookupItem,
  });

  const initialValues = {
    title: selected?.title || '',
    category: selected?.category || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    category: Yup.string().required('Category is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateLookupItem({ payload: { id: selected.id, ...values } });
        toast.success('Lookup item updated successfully');
      } else {
        await addLookupItem({ payload: { ...values } });
        toast.success('Lookup item added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.lookupItems, selected.id]
            : [queryKeys.lookupItems],
        },
      ]);
      router.push('/portal/admin/lookup');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Lookup Item Form" description="Add or edit a lookup item">
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
                <FormikField name="title" label="Title" placeholder="Enter title" required />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="category"
                  label="Category"
                  placeholder="Select category"
                  options={CATEGORY_OPTIONS}
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

export default LookupItemForm;

