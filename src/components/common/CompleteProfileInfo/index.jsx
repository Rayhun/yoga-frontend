import React, { useState } from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { createStripeOnboardingLink } from '@/services/private/expert/stripe';

const InfoNote = ({expertData}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStripeOnboarding = async () => {
    try {
      setIsLoading(true);
      const response = await createStripeOnboardingLink();
      
      if (response.data.status === 'success' && response.data.data) {
        // Redirect to the Stripe onboarding link
        window.location.href = response.data.data;
      }
    } catch (error) {
      console.error('Error creating Stripe onboarding link:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="mx-auto my-8">
      <div className="bg-white shadow rounded-lg border border-primary/20 p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <HiOutlineInformationCircle className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold text-primary">Quick Steps to Get Started</h2>
        </div>

        {/* Step 1 */}
        {!expertData?.is_profile_complete && <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
            1
          </div>
          <div className="flex-1 text-gray-800 font-medium">
            Complete your profile to continue working on the app.
          </div>
        </div>}

        {/* Stripe Onboarding Step */}
        {!expertData?.stripe_onboarded && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
              {expertData?.is_profile_complete ? 1 : 2}
            </div>
            <div className="flex-1 text-gray-800 font-medium">
              Link your Stripe account to receive payments.
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleStripeOnboarding}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Link Account'}
              </button>
            </div>
          </div>
        )}

        {/* Final Step - Only show when has_event_or_consult is false */}
        {!expertData?.has_event_or_consult && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
              {expertData?.stripe_onboarded ? (expertData?.is_profile_complete ? 2 : 3) : (expertData?.is_profile_complete ? 1 : 2)}
            </div>
            <div className="flex-1 text-gray-800 font-medium">
              Add a group coaching or consultation to get started.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InfoNote;
