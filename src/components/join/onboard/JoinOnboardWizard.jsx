'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from '@/lib/axios';
import { executeCommunityAction, resolveActionUrl } from '@/services/private/expert/community';
import { toastApiError } from '@/utils/helpers';
import JoinOnboardLayout from './JoinOnboardLayout';
import JoinOnboardStep1 from './JoinOnboardStep1';
import JoinOnboardStep2 from './JoinOnboardStep2';
import JoinOnboardStep3 from './JoinOnboardStep3';

const JoinOnboardWizard = ({ wizardData, inviteData, slug }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [contactValue, setContactValue] = useState('');

  const steps = wizardData?.steps || {};
  const step1 = steps.step_1;
  const step2 = steps.step_2;
  const step3 = steps.step_3;

  const handleStep1Submit = async ({ values, activeTab: selectedTab }) => {
    const primaryButton = step1?.footer_actions?.primary_button;
    const submitUrl =
      selectedTab === 'phone' ? primaryButton?.number_url : primaryButton?.email_url;

    if (!submitUrl) {
      toast.error('Unable to continue. Submission URL is missing.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await executeCommunityAction({
        url: submitUrl,
        method: primaryButton?.method || 'post',
        payload: values,
      });

      const token = response?.data?.data?.token || response?.data?.token;
      if (token) {
        sessionStorage.setItem('pendingVerificationToken', token);
      }

      if (selectedTab === 'phone') {
        setContactValue(values.user_phone_number || '');
        sessionStorage.setItem('pendingVerificationPhone', values.user_phone_number || '');
      } else {
        setContactValue(values.user_email_address || '');
        sessionStorage.setItem('pendingVerificationEmail', values.user_email_address || '');
      }

      setActiveTab(selectedTab);
      setCurrentStep(2);
      toast.success('Verification code sent');
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const resendUrl = step2?.resend_handler?.url;
    if (!resendUrl) return;

    const payload =
      activeTab === 'phone'
        ? { phone: (contactValue || '').replace(' ', '') }
        : { email: contactValue };

    try {
      await axios.post(resolveActionUrl(resendUrl), payload);
      toast.success('Verification code resent');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleStep2Submit = async ({ otp }) => {
    const primaryButton = step2?.footer_actions?.primary_button;
    const verifyUrl =
      activeTab === 'phone' ? primaryButton?.number_url : primaryButton?.email_url;

    if (!verifyUrl) {
      toast.error('Unable to verify. Verification URL is missing.');
      return;
    }

    const payload =
      activeTab === 'phone'
        ? {
            phone: contactValue.replace(/\s/g, ''),
            number_otp: otp,
          }
        : {
            email: contactValue,
            email_otp: otp,
          };

    try {
      setIsSubmitting(true);
      const response = await axios.post(resolveActionUrl(verifyUrl), payload);
      const token =
        response?.data?.data?.token ||
        response?.data?.token ||
        sessionStorage.getItem('pendingVerificationToken');

      if (token) {
        Cookies.set('token', token);
        sessionStorage.removeItem('pendingVerificationToken');
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationPhone');
      }

      setCurrentStep(3);
      toast.success('Account verified successfully');
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterCircle = () => {
    router.push('/portal/inbox');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push(`/join/${slug}`);
    }
  };

  const canGoBack =
    currentStep === 1
      ? step1?.navigation?.can_go_back !== false
      : currentStep === 2
        ? step2?.navigation?.can_go_back !== false
        : false;

  return (
    <JoinOnboardLayout
      activeStep={currentStep}
      canGoBack={canGoBack}
      inviteData={inviteData}
      onBack={handleBack}
    >
      {currentStep === 1 ? (
        <JoinOnboardStep1
          stepData={step1}
          onSubmit={handleStep1Submit}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {currentStep === 2 ? (
        <JoinOnboardStep2
          stepData={step2}
          activeTab={activeTab}
          contactValue={contactValue}
          onSubmit={handleStep2Submit}
          onResend={handleResendOtp}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {currentStep === 3 ? (
        <JoinOnboardStep3
          stepData={step3}
          onEnterCircle={handleEnterCircle}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </JoinOnboardLayout>
  );
};

export default JoinOnboardWizard;
