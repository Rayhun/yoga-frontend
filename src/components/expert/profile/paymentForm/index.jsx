'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { savePaymentInfo } from '@/services/private/expert/program';
import FormikField from '@/components/common/form/formik/FormikField';

const ExpertPaymentForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: upload } = useMutation({
    mutationFn: savePaymentInfo,
  });

  const initialValues = {
    paypal_email: '',
  };

  const validationSchema = Yup.object({
    paypal_email: Yup.string().required('Paypal Email is required').email('Invalid email address'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await upload({ payload: { ...values } });
      toast.success('Payment info updated successfully');
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
                  <FormikField name="paypal_email" label="Payment Details" placeholder="Enter Paypal email for payments" required />
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
