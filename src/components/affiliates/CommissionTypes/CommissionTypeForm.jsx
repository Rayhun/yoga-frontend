'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { createNewCommissionType, updateCommissionType } from '@/services/private/affiliates/commission';
import FormikSelect from '@/components/common/form/formik/FormikSelect';

const DURATION_OPTIONS = [
  { label: '1-month', value: '1' },
  { label: '3-month', value: '3' },
  { label: '6-month', value: '6' },
  { label: '12-month', value: '12' },
  { label: 'Forever', value: '0' },
];

const CommissionTypeForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addCommissionType } = useMutation({
    mutationFn: createNewCommissionType,
  });
  const { mutateAsync: update } = useMutation({
    mutationFn: updateCommissionType,
  });

  const initialValues = {
    title: selected?.title || '',
    percentage: selected?.percentage || '',
    payout_duration: String(selected?.payout_duration) || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    percentage: Yup.string().required('Perecentage is required').max(100, 'Percentage must be less than 100'),
    payout_duration: Yup.string().required('Payout Duration is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await update({ payload: { id: selected.id, ...values } });
        toast.success('Commission type updated successfully');
      } else {
        await addCommissionType({ payload: { ...values } });
        toast.success('Commission type added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode ? [queryKeys.commissionTypeList, selected.id] : [queryKeys.commissionTypeList],
        },
      ]);
      router.push('/portal/admin/affiliates/commission_type');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Commission Type Form" description="Add or edit a commission type">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <FormikField name="title" label="Title" placeholder="Title" required />
            <FormikField
              name="percentage"
              label="Percentage(%)"
              placeholder="Percentage"
              required
              type="number"
            />

            <FormikSelect
              name="payout_duration"
              label="Payout Duration"
              placeholder="Select Duration"
              options={DURATION_OPTIONS}
              required
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

export default CommissionTypeForm;
