'use client';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import OTPVerificationForm from './OTPVerificationForm';
import { verifyEmail, resendEmailOTPCode } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';
import SignupStepper from '../common/SignupStepper';
import Cookies from 'js-cookie';

const AffiliatesAccountVerificationForm = () => {
  const router = useRouter();
  // Read email from sessionStorage for security (not from URL)
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('pendingAffiliateVerificationEmail') : null;

  const { mutateAsync: verifyEmailOTP, isSuccess: emailVerfied } = useMutation({
    mutationFn: verifyEmail,
  });
  const { mutateAsync: resendEmailOTP } = useMutation({
    mutationFn: resendEmailOTPCode,
  });

  // Redirect to signup if email is missing (security check)
  useEffect(() => {
    if (typeof window !== 'undefined' && !email) {
      router.replace('/affiliate-program');
    }
  }, [email, router]);

  useEffect(() => {
    if (emailVerfied) {
      const pendingToken = sessionStorage.getItem('pendingVerificationToken');
      if (pendingToken) {
        Cookies.set('token', pendingToken);
        // Clean up all verification-related sessionStorage items
        sessionStorage.removeItem('pendingVerificationToken');
        sessionStorage.removeItem('pendingAffiliateVerificationEmail');
        router.replace('/auth/login');
      } else {
        // Clean up verification data even if no token
        sessionStorage.removeItem('pendingAffiliateVerificationEmail');
        router.replace('/auth/login');
      }
    }
  }, [emailVerfied, router]);

  const handleResendEmailOTP = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      router.replace('/affiliate-program');
      return;
    }
    try {
      await resendEmailOTP({ payload: { email } });
      toast.success('OTP resent to your email');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleSubmitEmailOTP = async (values, { setSubmitting }) => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      router.replace('/affiliate-program');
      setSubmitting(false);
      return;
    }
    try {
      const res = await verifyEmailOTP({ payload: { email, email_otp: values.otp } });
      setSubmitting(false);
      toast.success('Email verified successfully');
    } catch (error) {
      toastApiError(error);
      setSubmitting(false);
    }
  };

  const steps = [
    { label: 'Sign Up' },
    { label: 'Verify Email' },
  ];

  return (
    <React.Fragment>
      <SignupStepper activeStep={2} formSteps={steps} />
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 text-center">
            If you do not receive the OTP in 10 seconds, please check your spam folder or click on resend OTP
          </p>
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
