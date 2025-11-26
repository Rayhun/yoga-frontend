import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { createStripeOnboardingLink } from '@/services/private/expert/stripe';

const InfoNote = ({expertData}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const handleStripeOnboarding = async () => {
    // Check if profile is complete before allowing Stripe onboarding
    if (!expertData?.is_profile_complete) {
      setShowProfilePopup(true);
      return;
    }

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

  const handleAddCoachingOrConsultation = (path) => {
    // Check if profile is complete before allowing coaching/consultation creation
    if (!expertData?.is_profile_complete) {
      setShowProfilePopup(true);
      return;
    }
    router.push(path);
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
            <div className="flex-shrink-0 flex gap-3">
              <button
                onClick={() => handleAddCoachingOrConsultation('/portal/teacher/group_coaching/add')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Add Coaching
              </button>
              <button
                onClick={() => handleAddCoachingOrConsultation('/portal/teacher/consultation/add')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Add Consultation
              </button>
            </div>
          </div>
        )}

        {/* Profile Completion Popup */}
        {showProfilePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineInformationCircle className="text-primary text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-6">
                  Please complete your profile to get started with this feature.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowProfilePopup(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowProfilePopup(false);
                      router.push('/portal/teacher/editProfile');
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InfoNote;
