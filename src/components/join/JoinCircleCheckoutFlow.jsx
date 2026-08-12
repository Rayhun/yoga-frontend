'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarLayout from '@/components/layouts/NavbarLayout';
import OnboardingJoinDetailsStep from '@/components/onboarding/customer/OnboardingJoinDetailsStep';
import OnboardingJoinPaymentStep from '@/components/onboarding/customer/OnboardingJoinPaymentStep';
import { setCircleJoinGuest } from '@/utils/circle-join-guest';

const splitFullName = fullName => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

const JoinCircleCheckoutFlow = ({ slug, content, onBackToInvite }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [joinFormData, setJoinFormData] = useState({ full_name: '', email: '' });

  const handleDetailsContinue = values => {
    setJoinFormData({
      full_name: values.full_name.trim(),
      email: values.email.trim().toLowerCase(),
    });
    setStep(2);
  };

  const handlePay = () => {
    setCircleJoinGuest(slug, joinFormData);
    router.push(`/payment/join/${slug}`);
  };

  const { firstName } = splitFullName(joinFormData.full_name);

  return (
    <NavbarLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {step === 1 ? (
          <OnboardingJoinDetailsStep
            content={content}
            initialValues={joinFormData}
            onContinue={handleDetailsContinue}
            onBack={onBackToInvite}
            canGoBack
          />
        ) : (
          <OnboardingJoinPaymentStep
            content={content}
            firstName={firstName}
            onBack={() => setStep(1)}
            onPay={handlePay}
          />
        )}
      </div>
    </NavbarLayout>
  );
};

export default JoinCircleCheckoutFlow;
