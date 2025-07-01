import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { Modal, CircularProgress } from '@mui/material';
import { getCommisionTypesList } from '@/services/private/affiliates/commission';
import { useMemo } from 'react';
import { getSubscriptionPagesList } from '@/services/private/subscription/page';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';

const ApproveAffiliateForm = ({ show = false, onClose, selected, handleSubmit }) => {
  const {
    data: commissionTypes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: getCommisionTypesList,
    queryKey: [queryKeys.commissionTypeList],
  });

  const { isLoading: isLoadingPages, data: subscriptions } = useQuery({
    queryFn: getSubscriptionPagesList,
    queryKey: [queryKeys.subscriptionPages],
  });

  const initialValues = {
    commission_type: selected?.commission_type || '',
    referral_link: selected?.referral_link?.map(link => link.split('?')[0]) || [],
    status: 'Approved',
  };

  const validationSchema = Yup.object({
    commission_type: Yup.string().required('Commission type is required'),
    referral_link: Yup.array().required('Referral link is required'),
  });

  const commissionTypeOptions = useMemo(
    () =>
      commissionTypes?.data?.map(commissionType => ({
        label: commissionType.title,
        value: commissionType.id,
      })) || [],
    [commissionTypes]
  );

  const subscriptionsOptions = useMemo(
    () => 
      subscriptions?.data?.map(page => ({
        label: page.title,
        value: page.url,
      })) || [],
    [subscriptions]
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
                  disabled={!!selected}
                />

                <FormikMultiSelect
                  name="referral_link"
                  label="Refferal Link"
                  placeholder="Select Referral Link"
                  options={subscriptionsOptions}
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
