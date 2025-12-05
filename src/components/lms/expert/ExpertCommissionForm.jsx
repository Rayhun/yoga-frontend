'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import Button from '@/components/common/Button';
import { 
  createExpertCommission, 
  updateExpertCommission 
} from '@/services/private/lms/expert-commission';
import queryKeys from '@/utils/query-keys';

const ExpertCommissionForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addCommission } = useMutation({
    mutationFn: createExpertCommission,
  });

  const { mutateAsync: updateCommission } = useMutation({
    mutationFn: updateExpertCommission,
  });

  const commissionTypeOptions = [
    { value: 'Program', label: 'Program' },
    { value: 'Consultation', label: 'Consultation' },
    { value: 'Group Coaching', label: 'Group Coaching' },
  ];

  const commissionValueTypeOptions = [
    { value: 'percent', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
  ];

  const initialValues = {
    commission_type: selected?.commission_type || '',
    commission_value_type: selected?.commission_value_type || '',
    commission_value: selected?.commission_value || '',
    is_active: selected?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    commission_type: Yup.string().required('Commission type is required'),
    commission_value_type: Yup.string().required('Commission value type is required'),
    commission_value: Yup.string()
      .required('Commission value is required')
      .test('valid-value', 'Please enter a valid value', function(value) {
        const valueType = this.parent.commission_value_type;
        if (!value) return false;
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        if (valueType === 'percent') {
          return numValue >= 0 && numValue <= 100;
        } else {
          return numValue >= 0;
        }
      }),
    is_active: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateCommission({ id: selected.id, ...values });
        toast.success('Commission updated successfully');
      } else {
        await addCommission(values);
        toast.success('Commission created successfully');
      }

      await queryClient.invalidateQueries([queryKeys.expertCommissions]);
      router.push('/portal/admin/lms/expert/commission');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <FormLayoutWrapper>
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
                <FormikSelect
                  name="commission_type"
                  label="Commission Type"
                  placeholder="Select commission type"
                  options={commissionTypeOptions}
                  required
                />
              </div>

              <div className="w-full xl:w-1/2">
                <FormikSelect
                  name="commission_value_type"
                  label="Commission Value Type"
                  placeholder="Select value type"
                  options={commissionValueTypeOptions}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField
                  name="commission_value"
                  label="Commission Value"
                  placeholder={initialValues.commission_value_type === 'percent' ? 'Enter percentage (0-100)' : 'Enter amount'}
                  type="number"
                  step="0.01"
                  required
                />
              </div>

              <div className="w-full xl:w-1/2 flex items-center">
                <FormikSwitch
                  name="is_active"
                  label="Active Status"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button 
                type="button" 
                variant="outlined" 
                size="2xl" 
                className="self-start" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ExpertCommissionForm;
