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
import { addNewSubscriptionPlan, updateExistingSubscriptionPlan } from '@/services/private/subscription/plan';
import { toastApiError } from '@/utils/helpers';
import {
  SUBSCRIPTION_PAGE_STATUS_OPTIONS,
  SUBSCRIPTION_PAGE_TENURE_OPTIONS,
  SUBSCRIPTION_PAGE_TYPE_OPTIONS,
} from '@/utils/options';
import queryKeys from '@/utils/query-keys';

const SubscriptionPlanForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addSubscriptionPlan } = useMutation({
    mutationFn: addNewSubscriptionPlan,
  });
  const { mutateAsync: updateSubscriptionPlan } = useMutation({
    mutationFn: updateExistingSubscriptionPlan,
  });

  const initialValues = {
    name: selected?.name || '',
    status: selected?.status || '',
    subscription_type: selected?.subscription_type || '',
    subscription_tenure: selected?.subscription_tenure || '',
    price: selected?.price || '',
    discounted_price: selected?.discounted_price || '',
    features: selected?.features || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    status: Yup.string().required('Required!'),
    subscription_type: Yup.string().required('Required!'),
    subscription_tenure: Yup.string().required('Required!'),
    price: Yup.number().required('Required!'),
    discounted_price: Yup.number().required('Required!'),
    features: Yup.string().required('Required!'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateSubscriptionPlan({ payload: { id: selected.id, ...values } });
        toast.success('Subscription plan updated successfully');
      } else {
        await addSubscriptionPlan({ payload: { ...values } });
        toast.success('Subscription plan added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.subscriptionPlans, selected.id] : [queryKeys.subscriptionPlans] },
      ]);
      router.push('/portal/admin/subscription/plan');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Subscription Plan">
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
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={SUBSCRIPTION_PAGE_STATUS_OPTIONS}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="subscription_type"
                  label="Subscription Type"
                  placeholder="Subscription Type"
                  options={SUBSCRIPTION_PAGE_TYPE_OPTIONS}
                  required
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="subscription_tenure"
                  label="Subscription Tenure"
                  placeholder="Subacription Tenure"
                  options={SUBSCRIPTION_PAGE_TENURE_OPTIONS}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField type="number" name="price" label="Price" placeholder="Price" required />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField
                  type="number"
                  name="discounted_price"
                  label="Discounted Price"
                  placeholder="Discounted Price"
                  required
                />
              </div>
            </div>
            <FormikField name="features" label="Features" placeholder="Features" rows={5} required />
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default SubscriptionPlanForm;
