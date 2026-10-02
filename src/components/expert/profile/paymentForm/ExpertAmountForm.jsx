'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { savePaymentInfo } from '@/services/private/expert/program';
import FormikField from '@/components/common/form/formik/FormikField';
import useAuthContext from '@/hooks/useAuthContext';
import { FiDollarSign, FiInfo, FiCheckCircle } from 'react-icons/fi';

const validationSchema = Yup.object({
  expert_amount: Yup.number()
    .typeError('Please enter a valid amount')
    .integer('Amount must be a whole number')
    .min(2, 'Monthly rate must be $2 or greater')
    .required('Monthly rate is required'),
});

const ExpertAmountForm = ({ expertData }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { mutateAsync: saveAmount } = useMutation({
    mutationFn: savePaymentInfo,
  });

  const initialValues = {
    expert_amount: expertData?.expert_amount ?? '',
  };

  const isExpertAmountConfigured =
    expertData?.expert_amount != null && expertData?.expert_amount !== '';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await saveAmount({ payload: { expert_amount: values.expert_amount } });
      toast.success('Membership rate updated successfully');
      await queryClient.invalidateQueries([
        { queryKey: [queryKeys.teacherProfile, user?.profile?.expert] },
      ]);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
      {isExpertAmountConfigured && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">Membership Investment Set</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Monthly Rate: <span className="font-medium">${expertData?.expert_amount}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center mt-0.5">
              <FiInfo className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1">Membership Pricing</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Set the monthly investment for your guidance, content, and coaching services. This
                amount will be displayed to clients when they join your membership.
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
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-6">
              <div>
                <FormikField
                  name="expert_amount"
                  label="Monthly Rate ($)"
                  placeholder="e.g. 50"
                  type="number"
                  min={2}
                  step={1}
                  Icon={FiDollarSign}
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Must be $2 or greater — USD whole dollars, update anytime
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px] bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Saving...' : 'Save Membership Rate'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExpertAmountForm;
