'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import { addNewSubscriptionPage, updateExistingSubscriptionPage } from '@/services/private/subscription/page';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

const SubscriptionPageForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addSubscriptionPage } = useMutation({
    mutationFn: addNewSubscriptionPage,
  });
  const { mutateAsync: updateSubscriptionPage } = useMutation({
    mutationFn: updateExistingSubscriptionPage,
  });

  const initialValues = {
    name: selected?.name || '',
    slug: selected?.slug || '',
    description: selected?.description || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    slug: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateSubscriptionPage({ payload: { id: selected.id, ...values } });
        toast.success('Subscription page updated successfully');
      } else {
        await addSubscriptionPage({ payload: { ...values } });
        toast.success('Subscription page added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.subscriptionPages, selected.id] : [queryKeys.subscriptionPages] },
      ]);
      router.push('/portal/admin/subscription/page');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Subscription Page">
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
                <FormikField name="slug" label="Slug" placeholder="Slug" required />
              </div>
            </div>
            <FormikField name="description" label="Description" placeholder="Description" rows={5} required />
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default SubscriptionPageForm;
