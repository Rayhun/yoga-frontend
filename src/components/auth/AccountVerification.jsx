'use client';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import OTPVerificationForm from './OTPVerificationForm';
import { verifyEmail, verifyPhone, resendEmailOTPCode, resendPhoneOTPCode } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';
import { Alert } from '@mui/material';

const AccountVerificationForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParamUtils();
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const step = searchParams.get('step');
  const isEmailVerification = step === 'email';
  const isPhoneVerification = step === 'phone';


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

  useEffect(() => {
    if (isEmailVerified && isPhoneVerified) {
      router.replace('/auth/login');
    }
  }, [isEmailVerified, isPhoneVerified, router]);

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
      nextStep('phone');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleResendPhoneOTP = async () => {
    try {
      await resendPhoneOTP({ payload: { phone: phone.replace(' ', '+') } });
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

  const nextStep = value => {
    router.replace(`${pathname}?email=${email}&phone=${phone}&step=${value}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {isEmailVerification && (
        <>
          <div className="text-center">
            <Alert variant="filled" severity="info" className="text-xs">
              If you do not recieve the OTP in 10 seconds, please check your spam folder or click on resend
              OTP
            </Alert>
          </div>
          <OTPVerificationForm
            label="Email OTP"
            btnText="Verify Email"
            isVerified={isEmailVerified}
            onSubmit={handleSubmitEmailOTP}
            onResendOTP={handleResendEmailOTP}
            otpDuration={60}
          />
        </>
      )}
      {isPhoneVerification && (
        <OTPVerificationForm
          label="Phone OTP"
          btnText="Verify Phone"
          isVerified={isPhoneVerified}
          onSubmit={handleSubmitPhoneOTP}
          onResendOTP={handleResendPhoneOTP}
          otpDuration={60}
        />
      )}
    </div>
  );
};

export default AccountVerificationForm;
