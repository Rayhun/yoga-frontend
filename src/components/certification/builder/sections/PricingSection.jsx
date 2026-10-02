'use client';
import React, { useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'free', label: 'Free' },
];

const validationSchema = Yup.object({
  payment_type: Yup.string().oneOf(['one_time', 'free']),
  price: Yup.number().min(0, 'Price cannot be negative').nullable(),
  seat_limit: Yup.number().min(0, 'Seat limit cannot be negative').nullable(),
});

// FormikField type="number" leaves an empty field as '' (Formik doesn't coerce), and DRF's
// PositiveIntegerField/DecimalField reject '' outright ("A valid integer is required.") rather
// than treating it as null — caught by live verification, not the empty-value case slipping
// through client-side Yup validation (`.nullable()` allows null, but '' !== null).
const toPayload = values => ({
  payment_type: values.payment_type,
  price: values.price === '' ? null : values.price,
  seat_limit: values.seat_limit === '' ? null : values.seat_limit,
});

/**
 * Only the fields confirmed by the mockup's Pricing section (Payment Type, Price, Seat Limit).
 * A real Stripe product is created server-side the first time this saves with
 * payment_type='one_time' and price > 0 (backend pass 3) — nothing shown here for that, it's
 * transparent to the creator.
 */
const PricingSection = ({ initialValues, onSave, disabled = false }) => {
  const { notifyBlur, markSaved, status } = useSectionAutosave(onSave);

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleBlur = useCallback(values => notifyBlur(toPayload(values)), [notifyBlur]);

  return (
    <SectionCard title="Pricing" status={status}>
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values }) => (
          <Form className="flex flex-col gap-3" onBlur={() => handleBlur(values)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelect name="payment_type" label="Payment Type" options={PAYMENT_TYPE_OPTIONS} disabled={disabled} />
              {values.payment_type === 'one_time' ? (
                <FormikField type="number" name="price" label="Price" placeholder="299" disabled={disabled} />
              ) : null}
            </div>
            <FormikField
              type="number"
              name="seat_limit"
              label="Seat Limit (optional)"
              placeholder="Leave blank for unlimited"
              disabled={disabled}
            />
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default PricingSection;
