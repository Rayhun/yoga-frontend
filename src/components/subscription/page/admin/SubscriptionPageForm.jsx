'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { getSubscriptionPlansList } from '@/services/private/subscription/plan';
import { addNewSubscriptionPage, updateExistingSubscriptionPage } from '@/services/private/subscription/page';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { useMemo } from 'react';

const SubscriptionPageForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { data: subscriptionPlansResponse } = useQuery({
    queryFn: getSubscriptionPlansList,
    queryKey: [queryKeys.subscriptionPlans],
  });
  const { mutateAsync: addSubscriptionPage } = useMutation({
    mutationFn: addNewSubscriptionPage,
  });
  const { mutateAsync: updateSubscriptionPage } = useMutation({
    mutationFn: updateExistingSubscriptionPage,
  });

  const initialValues = {
    title: selected?.title || '',
    slug: selected?.slug || '',
    plans: (selected?.plans || []).map(i => i.id),
    description: selected?.description || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    slug: Yup.string().required('Required!'),
    plans: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least one category is required'),
    description: Yup.string().required('Required!'),
  });

  const subscriptionPlansOptions = useMemo(
    () => (subscriptionPlansResponse?.data || [])?.map(plan => ({ label: plan.title, value: plan.id })),
    [subscriptionPlansResponse?.data]
  );

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
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField name="slug" label="Slug" placeholder="Slug" required />
              </div>
            </div>
            <FormikMultiSelect
              name="plans"
              label="Plans"
              placeholder="Plans"
              options={subscriptionPlansOptions}
            />
            <FormikRichTextEditor name="description" label="Description" placeholder="Description" rows={5} required />
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
