'use client';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import OTPVerificationForm from './OTPVerificationForm';
import { verifyEmail, resendEmailOTPCode } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';
import { Alert } from '@mui/material';
import SignupStepper from '../common/SignupStepper';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';

const AffiliatesAccountVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const email = searchParams.get('email');

  const { mutateAsync: verifyEmailOTP, isSuccess: emailVerfied } = useMutation({
    mutationFn: verifyEmail,
  });
  const { mutateAsync: resendEmailOTP } = useMutation({
    mutationFn: resendEmailOTPCode,
  });

  useEffect(() => {
    if (emailVerfied) {
      router.replace('/auth/login');
    }
  }, [router, emailVerfied]);

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
      const res = await verifyEmailOTP({ payload: { email, email_otp: values.otp } });
      setSubmitting(false);
      toast.success('Email verified successfully');
    } catch (error) {
      toastApiError(error);
    }
  };

  const steps = [
    { label: 'Sign Up' },
    { label: 'Verify Email' },
  ];

  return (
    <React.Fragment>
      <SignupStepper activeStep={2} formSteps={steps} />
      <div className="w-full flex flex-col gap-5">
        <div className="text-center">
          <Alert variant="filled" severity="info" className="text-xs">
            If you do not recieve the OTP in 10 seconds, please check your spam folder or click on resend OTP
          </Alert>
        </div>
        <OTPVerificationForm
          label="Email OTP"
          btnText="Verify Email"
          isVerified={emailVerfied}
          onSubmit={handleSubmitEmailOTP}
          onResendOTP={handleResendEmailOTP}
          otpDuration={120}
        />
      </div>
    </React.Fragment>
  );
};

export default AffiliatesAccountVerificationForm;
