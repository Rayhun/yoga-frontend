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
import { FiMail } from 'react-icons/fi';

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

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => {
            return (
              <Form className="flex flex-col gap-3">
                <div className="flex flex-col gap-6">
                  <FormikField name="paypal_email" label="Payment Details" placeholder="Enter Paypal email for payments" Icon={FiMail} required />
                  <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
                    <Button
                      type="button"
                      variant="secondary"
                      size="2xl"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="2xl" isLoading={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit My Paypal Email'}
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
