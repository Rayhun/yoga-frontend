'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikOTP from '@/components/common/form/formik/FormikOTP';
import Button from '@/components/common/Button';
import ResendOTP from './ResendOTP';

const AccountVerificationForm = ({
  label,
  btnText = 'Verify',
  isVerified = false,
  otpDuration = 120,
  onSubmit,
  onResendOTP,
}) => {
  const initialValues = {
    otp: '',
  };

  const validationSchema = Yup.object({
    otp: Yup.string().required('Required!'),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <FormikOTP name="otp" label={label} numberOfDigits={6} required />
            <ResendOTP duration={otpDuration} onResend={onResendOTP} />
          </div>
          <Button 
            type="submit" 
            size="5xl" 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            isLoading={isSubmitting} 
            disabled={isVerified}
          >
            <div className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>{isSubmitting ? 'Verifying...' : btnText}</span>
            </div>
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default AccountVerificationForm;
