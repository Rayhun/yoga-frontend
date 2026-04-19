'use client';
import { useField } from 'formik';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Popup from '@/components/common/popup';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import { addNewCoupon, updateExistingCoupon, getPaymentPlanOptions } from '@/services/private/subscription/coupon';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

const COUPON_TYPE_OPTIONS = [
  { label: 'Platform', value: 'platform' },
  { label: 'Regular Coupon', value: 'regular_coupon' },
  { label: 'Others', value: 'others' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percentage', value: 'percent' },
  { label: 'Fixed Amount', value: 'fixed' },
];

const CURRENCY_OPTIONS = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'BDT (৳)', value: 'BDT' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'CAD ($)', value: 'CAD' },
  { label: 'AUD ($)', value: 'AUD' },
];

const FormikDateField = ({ name, label }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = e => {
    helpers.setValue(e.target.value ? new Date(e.target.value).toISOString() : '');
  };

  const inputValue = field.value ? new Date(field.value).toISOString().slice(0, 16) : '';
  const isError = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <input
        type="datetime-local"
        value={inputValue}
        onChange={handleChange}
        onBlur={() => helpers.setTouched(true)}
        className={`w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:focus:border-green-400 ${
          isError ? 'border-red-400 focus:border-red-500' : 'border-gray-200'
        }`}
      />
      {isError && (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-fadeIn">
          <span>⚠️</span>
          <span>{meta.error}</span>
        </div>
      )}
    </div>
  );
};

const CouponForm = ({ open, onClose, selected }) => {
  const isEditMode = Boolean(selected);
  const queryClient = useQueryClient();

  const { data: plansResponse } = useQuery({
    queryFn: getPaymentPlanOptions,
    queryKey: [queryKeys.coupons, 'planOptions'],
    enabled: open,
  });

  const plans = plansResponse?.data || [];

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().required('Required!'),
        promotion_code: Yup.string(),
        coupon_type: Yup.string().required('Required!'),
        discount_type: Yup.string().required('Required!'),
        product: Yup.string().when('coupon_type', {
          is: 'platform',
          then: schema => schema.required('Plan is required for Platform coupons'),
        }),
        discount_value: Yup.number()
          .typeError('Must be a number')
          .required('Required!')
          .positive('Must be greater than 0')
          .when('discount_type', {
            is: 'percent',
            then: schema => schema.max(100, 'Percentage must be ≤ 100'),
          })
          .test(
            'platform-price-limit',
            'Discount value cannot be greater than or equal to the plan price',
            function (value) {
              const { coupon_type, product } = this.parent;
              if (coupon_type !== 'platform' || !product || !value) return true;
              const plan = plans.find(p => p.id === product);
              if (!plan?.price) return true;
              return Number(value) < Number(plan.price);
            }
          ),
        valid_to: Yup.string().test('after-valid-from', 'Must be after Valid From', function (value) {
          const { valid_from } = this.parent;
          if (!value || !valid_from) return true;
          return new Date(value) > new Date(valid_from);
        }),
      }),
    [plans]
  );

  const planOptions = [
    { label: 'No specific plan', value: '' },
    ...(plansResponse?.data || []).map(plan => ({
      label: `${plan.title}${plan.price ? ` — $${plan.price}` : ''}`,
      value: plan.id,
    })),
  ];

  const { mutateAsync: addCoupon } = useMutation({ mutationFn: addNewCoupon });
  const { mutateAsync: updateCoupon } = useMutation({ mutationFn: updateExistingCoupon });

  const initialValues = {
    name: selected?.name || '',
    promotion_code: selected?.promotion_code || '',
    coupon_type: selected?.coupon_type || '',
    description: selected?.description || '',
    discount_type: selected?.discount_type || '',
    discount_value: selected?.discount_value || '',
    currency: selected?.currency || 'USD',
    product: selected?.product || '',
    valid_from: selected?.valid_from || '',
    valid_to: selected?.valid_to || '',
    active: selected?.active ?? true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values };
      if (!payload.product) delete payload.product;
      if (!payload.valid_from) delete payload.valid_from;
      if (!payload.valid_to) delete payload.valid_to;
      if (!payload.description) delete payload.description;
      if (payload.discount_type !== 'fixed') delete payload.currency;

      if (isEditMode) {
        await updateCoupon({ payload: { id: selected.id, ...payload } });
        toast.success('Coupon updated successfully');
      } else {
        await addCoupon({ payload });
        toast.success('Coupon created successfully');
      }
      await queryClient.invalidateQueries([{ queryKey: [queryKeys.coupons] }]);
      onClose();
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      size="md"
      heading={isEditMode ? 'Edit Coupon' : 'Create Coupon'}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values }) => (
          <Form className="flex flex-col gap-4 text-left mt-2">
            <div className="flex flex-col gap-x-6 gap-y-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="name" label="Name" placeholder="Coupon name" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikField name="promotion_code" label="Promotion Code" placeholder="e.g. SUMMER20" />
              </div>
            </div>

            <div className="flex flex-col gap-x-6 gap-y-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="coupon_type"
                  label="Coupon Type"
                  placeholder="Select coupon type"
                  options={COUPON_TYPE_OPTIONS}
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="discount_type"
                  label="Discount Type"
                  placeholder="Select type"
                  options={DISCOUNT_TYPE_OPTIONS}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-x-6 gap-y-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField
                  type="number"
                  name="discount_value"
                  label="Discount Value"
                  placeholder={values.discount_type === 'percent' ? 'e.g. 20' : 'e.g. 10'}
                  step="any"
                  min={0}
                  required
                />
              </div>
              {values.discount_type === 'fixed' && (
                <div className="w-full md:w-1/2">
                  <FormikSelect
                    name="currency"
                    label="Currency"
                    placeholder="Select currency"
                    options={CURRENCY_OPTIONS}
                  />
                </div>
              )}
            </div>

            <FormikField
              name="description"
              label="Description"
              placeholder="Optional description"
              rows={2}
            />

            <FormikSelect
              name="product"
              label="Plan"
              placeholder="Select a plan (or leave for all plans)"
              options={planOptions}
            />

            <div className="flex flex-col gap-x-6 gap-y-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikDateField name="valid_from" label="Valid From" />
              </div>
              <div className="w-full md:w-1/2">
                <FormikDateField name="valid_to" label="Valid Until" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FormikSwitch name="active" label="Active" />
            </div>

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

export default CouponForm;
