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
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import { addNewSubscriptionPlan, updateExistingSubscriptionPlan } from '@/services/private/subscription/plan';
import { toastApiError } from '@/utils/helpers';
import {
  SUBSCRIPTION_PAGE_STATUS_OPTIONS,
  SUBSCRIPTION_PAGE_TENURE_OPTIONS,
  SUBSCRIPTION_PAGE_TYPE_OPTIONS,
  SUBSCRIPTION_FREE_TRIAL_OPTIONS,
} from '@/utils/options';
import queryKeys from '@/utils/query-keys';
import useLMSProgramOptions from '@/hooks/useLMSProgramOptions';
import DiscountedVolumeManager from './DiscountedVolumeManager';

const SubscriptionPlanForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { options: programOptions } = useLMSProgramOptions();

  const { mutateAsync: addSubscriptionPlan } = useMutation({
    mutationFn: addNewSubscriptionPlan,
  });
  const { mutateAsync: updateSubscriptionPlan } = useMutation({
    mutationFn: updateExistingSubscriptionPlan,
  });

  const initialValues = {
    title: selected?.title || '',
    status: selected?.status || '',
    subscription_type: selected?.subscription_type || '',
    subscription_tenure: selected?.subscription_tenure || '',
    price: selected?.price || '',
    discounted_price: selected?.discounted_price || '',
    discounted_volume: selected?.discounted_volume || [],
    features: selected?.features?.join('\n') || '',
    programs: selected?.programs?.map(program => program.id) || [],
    x_days_trial: selected?.x_days_trial ?? 7,
    is_default: selected?.is_default ?? false,
    stripe_product_id: selected?.stripe_product_id || '',
    price_id: selected?.price_id || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    status: Yup.string().required('Required!'),
    subscription_type: Yup.string().required('Required!'),
    subscription_tenure: Yup.string().required('Required!'),
    price: Yup.number().required('Required!').min(0, 'Price must be at least 0'),
    discounted_price: Yup.number().when('subscription_type', {
      is: 'Individual',
      then: schema => schema.min(0, 'Discounted Price must be at least 0'),
      otherwise: schema => schema.min(0, 'Discounted Price must be at least 0'),
    }),
    discounted_volume: Yup.array().when('subscription_type', {
      is: 'Business',
      then: schema =>
        schema.of(
          Yup.object({
            volume: Yup.number().required('Volume is required').min(1, 'Volume must be at least 1'),
            type: Yup.string().required('Type is required'),
            discount: Yup.number().required('Discount is required').min(0, 'Discount must be at least 0'),
          })
        ),
      otherwise: schema => schema,
    }),
    features: Yup.string().required('Required!'),
    programs: Yup.array(),
    x_days_trial: Yup.number(),
    is_default: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Filter out empty fields from payload
      const payload = { ...values };
      if (!payload.discounted_price || payload.discounted_price === '') {
        delete payload.discounted_price;
      }
      if (!payload.discounted_volume || payload.discounted_volume.length === 0) {
        delete payload.discounted_volume;
      }

      if (isEditMode) {
        await updateSubscriptionPlan({ payload: { id: selected.id, ...payload } });
        toast.success('Subscription plan updated successfully');
      } else {
        await addSubscriptionPlan({ payload });
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
        {({ isSubmitting, values }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
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
                  placeholder="Subscription Tenure"
                  options={SUBSCRIPTION_PAGE_TENURE_OPTIONS}
                  required
                />
              </div>
            </div>

            {/* Conditional fields based on subscription type */}
            {values.subscription_type === 'Individual' && (
              <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                <div className="w-full xl:w-1/2">
                  <FormikField
                    type="number"
                    name="price"
                    min={0}
                    label="Price"
                    placeholder="Price"
                    required
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <FormikField
                    type="number"
                    name="discounted_price"
                    label="Discounted Price"
                    placeholder="Discounted Price"
                    min={0}
                  />
                </div>
              </div>
            )}

            {values.subscription_type === 'Business' && (
              <>
                <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
                  <div className="w-full xl:w-1/2">
                    <FormikField
                      type="number"
                      name="price"
                      min={0}
                      label="Per Volume Price"
                      placeholder="Per Volume Price"
                      required
                    />
                  </div>
                </div>
                <DiscountedVolumeManager />
              </>
            )}

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikMultiSelect
                  name="programs"
                  label="Programs"
                  placeholder="Select Programs"
                  options={programOptions || []}
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="x_days_trial"
                  label="Free Trial"
                  placeholder="Select Free Trial"
                  options={SUBSCRIPTION_FREE_TRIAL_OPTIONS}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="stripe_product_id" label="Stripe Product ID" placeholder="Stripe Product ID" />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField name="price_id" label="Price ID" placeholder="Price ID" />
              </div>
            </div>
            <FormikField name="features" label="Features" placeholder="Features" rows={5} required />
            <div className="flex items-center gap-3">
              <FormikSwitch name="is_default"  label="Set as Default Plan"/>
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

export default SubscriptionPlanForm;