'use client';
import React, { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import OTPVerificationForm from './OTPVerificationForm';
import { verifyEmail, resendEmailOTPCode } from '@/services/public/auth';
// Mobile OTP verification disabled — backend currently uses email-only account verification.
// import { verifyPhone, resendPhoneOTPCode } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';
import Cookies from 'js-cookie';

const AccountVerificationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  // Read email from sessionStorage for security (not from URL)
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null;
  // const phone = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationPhone') : null;
  const step = searchParams.get('step');
  const email_verify = searchParams.get('email_verify') === 'true';
  // const mobile_verify = searchParams.get('mobile_verify') === 'true';
  const isEmailVerification = step === 'email' || step === 'phone';
  // const isPhoneVerification = step === 'phone';

  const { mutateAsync: verifyEmailOTP, isSuccess: emailVerfied } = useMutation({
    mutationFn: verifyEmail,
  });
  const { mutateAsync: resendEmailOTP } = useMutation({
    mutationFn: resendEmailOTPCode,
  });
  // const { mutateAsync: verifyPhoneOTP, isSuccess: phoneVerfied } = useMutation({
  //   mutationFn: verifyPhone,
  // });
  // const { mutateAsync: resendPhoneOTP } = useMutation({
  //   mutationFn: resendPhoneOTPCode,
  // });

  const isEmailVerified = useMemo(() => {
    return Boolean(email_verify) || emailVerfied;
  }, [emailVerfied, email_verify]);

  // const isPhoneVerified = useMemo(() => {
  //   return mobile_verify || phoneVerfied;
  // }, [phoneVerfied, mobile_verify]);

  // Redirect to signup only if email is missing (e.g. direct URL access).
  // When coming from login with "email not verify", we have email but may not have phone.
  useEffect(() => {
    if (typeof window !== 'undefined' && step && !email) {
      router.replace('/auth/signup');
    }
  }, [email, step, router]);

  useEffect(() => {
    if (isEmailVerified) {
      const pendingToken = sessionStorage.getItem('pendingVerificationToken');
      if (pendingToken) {
        Cookies.set('token', pendingToken);
        // Clean up all verification-related sessionStorage items
        sessionStorage.removeItem('pendingVerificationToken');
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationPhone');
        router.replace('/portal/teacher/profile?active_tab=about');
      } else {
        // Clean up verification data even if no token
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationPhone');
        router.replace('/auth/login');
      }
    }
  }, [isEmailVerified, router]);

  const handleResendEmailOTP = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      router.replace('/auth/signup');
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
      router.replace('/auth/signup');
      setSubmitting(false);
      return;
    }
    try {
      await verifyEmailOTP({ payload: { email, email_otp: values.otp } });
      setSubmitting(false);
      toast.success('Email verified successfully');
      // nextStep('phone'); // mobile verification step disabled
    } catch (error) {
      toastApiError(error);
      setSubmitting(false);
    }
  };

  // const handleResendPhoneOTP = async () => {
  //   if (!phone) {
  //     toast.error('Phone number not found. Please sign up again.');
  //     router.replace('/auth/signup');
  //     return;
  //   }
  //   try {
  //     await resendPhoneOTP({ payload: { phone: phone.replace(' ', '+') } });
  //     toast.success('OTP resent to your phone');
  //   } catch (error) {
  //     toastApiError(error);
  //   }
  // };

  // const handleSubmitPhoneOTP = async (values, { setSubmitting }) => {
  //   if (!email) {
  //     toast.error('Email not found. Please sign up again.');
  //     router.replace('/auth/signup');
  //     setSubmitting(false);
  //     return;
  //   }
  //   try {
  //     await verifyPhoneOTP({ payload: { email, number_otp: values.otp } });
  //     setSubmitting(false);
  //     toast.success('Phone verified successfully');
  //   } catch (error) {
  //     toastApiError(error);
  //     setSubmitting(false);
  //   }
  // };

  // const nextStep = value => {
  //   router.replace(`${pathname}?step=${value}`);
  // };

  return (
    <div className="space-y-6">
      {isEmailVerification && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 text-center">
              If you do not receive the OTP in 10 seconds, please check your spam folder or click on resend OTP
            </p>
          </div>
          <OTPVerificationForm
            label="Email OTP"
            btnText="Verify Email"
            isVerified={isEmailVerified}
            onSubmit={handleSubmitEmailOTP}
            onResendOTP={handleResendEmailOTP}
            otpDuration={120}
          />
        </>
      )}
      {/* Phone OTP UI removed — see commented handlers/imports at top of file to restore */}
    </div>
  );
};

export default AccountVerificationForm;
