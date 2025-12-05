'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiCalendar, FiMessageCircle, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { PiUserSquareFill } from 'react-icons/pi';
import { MdOutlineEventNote } from 'react-icons/md';
import useAuthContext from '@/hooks/useAuthContext';
import { createStripeOnboardingLink } from '@/services/private/expert/stripe';

const ExpertQuickSteps = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  
  const isProfileComplete = user?.profile?.is_profile_complete ?? false;
  const hasEventOrConsult = user?.profile?.has_event_or_consult ?? false;
  const stripeOnboarded = user?.profile?.stripe_onboarded ?? false;
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  const handleStripeOnboarding = async () => {
    try {
      setIsStripeLoading(true);
      const response = await createStripeOnboardingLink();
      
      if (response.data.status === 'success' && response.data.data) {
        // Redirect to the Stripe onboarding link
        if (typeof window !== 'undefined') {
          window.location.href = response.data.data;
        }
      }
    } catch (error) {
      console.error('Error creating Stripe onboarding link:', error);
    } finally {
      setIsStripeLoading(false);
    }
  };

  const allSteps = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, expertise, and professional information to attract students.',
      icon: FiUser,
      completed: isProfileComplete,
      action: () => router.push('/portal/teacher/profile?active_tab=about'),
      buttonText: isProfileComplete ? 'View Profile' : 'Complete Profile',
      color: isProfileComplete ? 'text-green-600' : 'text-blue-600',
      bgColor: isProfileComplete ? 'bg-green-50' : 'bg-blue-50',
    },
    {
      id: 'stripe',
      title: 'Link Stripe Account',
      description: 'Connect your Stripe account to receive payments from students.',
      icon: FiCreditCard,
      completed: stripeOnboarded,
      action: handleStripeOnboarding,
      buttonText: stripeOnboarded ? 'Account Linked' : (isStripeLoading ? 'Loading...' : 'Link Account'),
      color: stripeOnboarded ? 'text-green-600' : 'text-orange-600',
      bgColor: stripeOnboarded ? 'bg-green-50' : 'bg-orange-50',
      disabled: isStripeLoading,
    },
    {
      id: 'events',
      title: 'Create Your First Event',
      description: 'Set up group coaching sessions or workshops to start earning.',
      icon: MdOutlineEventNote,
      completed: hasEventOrConsult,
      action: () => router.push('/portal/teacher/profile?active_tab=group_coaching'),
      buttonText: hasEventOrConsult ? 'Manage Events' : 'Create Event',
      color: hasEventOrConsult ? 'text-green-600' : 'text-purple-600',
      bgColor: hasEventOrConsult ? 'bg-green-50' : 'bg-purple-50',
      showWhen: !hasEventOrConsult, // Only show when has_event_or_consult is false
    },
    {
      id: 'consultations',
      title: 'Set Up Consultations',
      description: 'Offer one-on-one consultations to provide personalized guidance.',
      icon: PiUserSquareFill,
      completed: hasEventOrConsult,
      action: () => router.push('/portal/teacher/profile?active_tab=consult'),
      buttonText: hasEventOrConsult ? 'Manage Consultations' : 'Set Up Consultations',
      color: hasEventOrConsult ? 'text-green-600' : 'text-orange-600',
      bgColor: hasEventOrConsult ? 'bg-green-50' : 'bg-orange-50',
      showWhen: !hasEventOrConsult, // Only show when has_event_or_consult is false
    },
  ];

  // Filter steps based on showWhen condition
  const steps = allSteps.filter(step => step.showWhen !== false);

  const allStepsComplete = isProfileComplete && hasEventOrConsult && stripeOnboarded;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Expert Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {allStepsComplete 
              ? "🎉 Congratulations! You're all set up and ready to start teaching."
              : hasEventOrConsult
              ? "Complete your profile to unlock your dashboard and start teaching."
              : "Complete these quick steps to get started and unlock your dashboard."
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Setup Progress
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {steps.filter(step => step.completed).length} of {steps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(steps.filter(step => step.completed).length / steps.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className={`grid gap-6 ${
          steps.length === 1 
            ? 'md:grid-cols-1 max-w-md mx-auto' 
            : steps.length === 2 
            ? 'md:grid-cols-2 max-w-4xl mx-auto' 
            : 'md:grid-cols-1 lg:grid-cols-3'
        }`}>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                  step.completed
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-primary hover:shadow-md'
                }`}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {step.completed ? (
                      <FiCheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${step.bgColor} flex items-center justify-center mb-4`}>
                  <IconComponent className={`w-6 h-6 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {step.description}
                </p>

                {/* Action Button */}
                <button
                  onClick={step.action}
                  disabled={step.disabled}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    step.completed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700'
                      : step.disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {step.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {allStepsComplete && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg dark:bg-green-900 dark:text-green-200">
              <FiCheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                All steps completed! You can now access your full dashboard.
              </span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push('/portal/teacher/dashboard')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {/* <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Need Help Getting Started?
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <FiMessageCircle className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Contact Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our team is here to help you get started.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCalendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Schedule a Call</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Book a one-on-one session with our onboarding team.
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ExpertQuickSteps;
