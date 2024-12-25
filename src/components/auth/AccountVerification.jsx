'use client';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import OTPVerificationForm from './OTPVerificationForm';
import { verifyEmail, verifyPhone, resendEmailOTPCode, resendPhoneOTPCode } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const AccountVerificationForm = () => {
  const searchParams = useSearchParamUtils();
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  const { mutateAsync: verifyEmailOTP, isSuccess: isEmailVerified } = useMutation({
    mutationFn: verifyEmail,
  });
  const { mutateAsync: resendEmailOTP } = useMutation({
    mutationFn: resendEmailOTPCode,
  });
  const { mutateAsync: verifyPhoneOTP, isSuccess: isPhoneVerified } = useMutation({
    mutationFn: verifyPhone,
  });
  const { mutateAsync: resendPhoneOTP } = useMutation({
    mutationFn: resendPhoneOTPCode,
  });

  const handleResendEmailOTP = async () => {
    try {
      await resendEmailOTP({ payload: { email } });
      toast.success('OTP resent to your email');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleSubmitEmailOTP = async (values, { setSubmitting }) => {
    try {
      await verifyEmailOTP({ payload: { email, email_otp: values.otp } });
      setSubmitting(false);
      toast.success('Email verified successfully');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleResendPhoneOTP = async () => {
    try {
      await resendPhoneOTP({ payload: { phone } });
      toast.success('OTP resent to your phone');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleSubmitPhoneOTP = async (values, { setSubmitting }) => {
    try {
      await verifyPhoneOTP({ payload: { email, number_otp: values.otp } });
      setSubmitting(false);
      toast.success('Phone verified successfully');
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <OTPVerificationForm
        label="Email OTP"
        btnText="Verify Email"
        isVerified={isEmailVerified}
        onSubmit={handleSubmitEmailOTP}
        onResendOTP={handleResendEmailOTP}
        otpDuration={60}
      />
      <hr className="my-5 w-1/2 self-center" />
      <OTPVerificationForm
        label="Phone OTP"
        btnText="Verify Phone"
        isVerified={isPhoneVerified}
        onSubmit={handleSubmitPhoneOTP}
        onResendOTP={handleResendPhoneOTP}
        otpDuration={120}
      />
    </div>
  );
};

export default AccountVerificationForm;
