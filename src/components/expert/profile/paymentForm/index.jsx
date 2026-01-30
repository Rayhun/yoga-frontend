'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { savePaymentInfo } from '@/services/private/expert/program';
import FormikField from '@/components/common/form/formik/FormikField';
import { getSingleExpert } from '@/services/private/lms/expert';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';
import { FiMail, FiInfo, FiCheckCircle } from 'react-icons/fi';

const ExpertPaymentForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch expert data to get existing PayPal email
  const {
    data: expertResponse,
    isLoading: isLoadingExpert,
  } = useQuery({
    queryFn: () => getSingleExpert({ id: user?.profile?.expert }),
    queryKey: [queryKeys.teacherProfile, user?.profile?.expert],
    enabled: !!user?.profile?.expert,
  });

  const expertData = expertResponse?.data?.data;

  const { mutateAsync: upload } = useMutation({
    mutationFn: savePaymentInfo,
  });

  const initialValues = {
    paypal_email: expertData?.paypal_email || '',
  };

  const validationSchema = Yup.object({
    paypal_email: Yup.string().trim()
    .lowercase()
    .email('Please enter a valid PayPal email')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email must be in the format user@example.com'
    )
    .required('PayPal Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await upload({ payload: { ...values } });
      toast.success('Payment info updated successfully');
      // Invalidate expert profile query to refresh the data
      await queryClient.invalidateQueries([{ queryKey: [queryKeys.teacherProfile, user?.profile?.expert] }]);
      await queryClient.invalidateQueries([{ queryKey: [queryKeys.expertCustomerPrograms] }]);
      router.push('/portal/teacher/profile?active_tab=about');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingExpert) {
    return <PageLoader />;
  }

  const isPayPalConfigured = !!expertData?.paypal_email;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
      {/* Status Banner */}
      {isPayPalConfigured && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-200/50 dark:border-emerald-800/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">PayPal Account Configured</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your PayPal email: <span className="font-medium">{expertData?.paypal_email}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Info Card */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center mt-0.5">
              <FiInfo className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">PayPal Payment Setup</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Enter your PayPal email address to receive payments. Make sure this email is associated with an active PayPal account. 
                You can update this information at any time.
              </p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => {
            return (
              <Form className="flex flex-col gap-6">
                <div className="space-y-6">
                  <div>
                    <FormikField 
                      name="paypal_email" 
                      label="PayPal Email Address" 
                      placeholder="your.email@example.com" 
                      Icon={FiMail} 
                      required 
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      This email will be used to receive payments from your students
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={handleCancel}
                      className="w-full sm:w-auto min-w-[120px]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      isLoading={isSubmitting}
                      className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSubmitting ? 'Saving...' : isPayPalConfigured ? 'Update PayPal Email' : 'Save PayPal Email'}
                    </Button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default ExpertPaymentForm;
