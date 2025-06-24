import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { Modal, CircularProgress } from '@mui/material';
import { getCommisionTypesList } from '@/services/private/affiliates/commission';
import { useMemo } from 'react';

const ApproveAffiliateForm = ({ show = false, onClose, handleSubmit }) => {
  const {
    data: commissionTypes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: getCommisionTypesList,
    queryKey: [queryKeys.commissionTypeList],
  });

  const DURATION_OPTIONS = [
    { label: '1-month', value: '1' },
    { label: '3-month', value: '3' },
    { label: '6-month', value: '6' },
    { label: '12-month', value: '12' },
    { label: 'Forever', value: '0' },
  ];

  const initialValues = {
    commission_type: '',
    payout_duration: '',
    status: 'Approved',
  };

  const validationSchema = Yup.object({
    commission_type: Yup.string().required('Commission type is required'),
    payout_duration: Yup.string().required('Duration is required'),
  });

  const commissionTypeOptions = useMemo(
    () =>
      commissionTypes?.data?.map(commissionType => ({
        label: commissionType.title,
        value: commissionType.id,
      })) || [],
    [commissionTypes]
  );

  return (
    <Modal
      open={show}
      onClose={onClose}
      aria-labelledby="approve-affiliate-form-title"
      aria-describedby="approve-affiliate-form-description"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
          {/* Title */}
          <h2 id="approve-affiliate-form-title" className="text-center text-2xl font-semibold mb-6">
            Approve Affiliate
          </h2>

          {isLoading && (
            <div className="flex justify-center mb-4">
              <CircularProgress />
            </div>
          )}
          {isError && (
            <div className="text-red-500 mb-4 text-center">
              <span>Error: {error?.message}</span>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <FormikSelect
                  name="commission_type"
                  label="Commission Type"
                  placeholder="Select Commission Type"
                  options={commissionTypeOptions}
                  required
                />

                <FormikSelect
                  name="payout_duration"
                  label="Payout Duration"
                  placeholder="Select Duration"
                  options={DURATION_OPTIONS}
                  required
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    size="2xl"
                    className="self-start mt-4"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" className="self-start mt-4" isLoading={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            <span className="text-xl font-semibold">&times;</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveAffiliateForm;
