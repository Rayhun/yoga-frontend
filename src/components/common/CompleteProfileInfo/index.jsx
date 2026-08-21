import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import useAuthContext from '@/hooks/useAuthContext';

const InfoNote = ({ expertData }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const isChatGroup = Boolean(user?.profile?.is_chat_group);

  const handlePayPalSetup = () => {
    if (!expertData?.is_profile_complete) {
      setShowProfilePopup(true);
      return;
    }

    router.push('/portal/teacher/payments');
  };

  const handleRequiresProfile = path => {
    if (!expertData?.is_profile_complete) {
      setShowProfilePopup(true);
      return;
    }
    router.push(path);
  };

  const steps = useMemo(() => {
    const items = [];

    if (!expertData?.is_profile_complete) {
      items.push({
        id: 'profile',
        text: 'Complete your profile to continue working on the app.',
      });
    }

    if (!expertData?.stripe_onboarded) {
      items.push({
        id: 'paypal',
        text: 'Set up your PayPal account to receive payments.',
        buttonText: 'Link Account',
        onClick: handlePayPalSetup,
      });
    }

    if (!expertData?.has_event_or_consult) {
      items.push({
        id: 'guided-experiences',
        text: 'Add Guided Experiences (workshops, bootcamps, masterclasses, live events)',
        buttonText: 'Add Guided Experiences',
        onClick: () => handleRequiresProfile('/portal/teacher/group_coaching/add'),
      });
    }

    if (!isChatGroup) {
      items.push({
        id: 'private-circle',
        text: 'Create your private circle to connect with your community.',
        buttonText: 'Create Private Circle',
        onClick: () => handleRequiresProfile('/portal/teacher/community/create'),
      });
    }

    return items;
  }, [
    expertData?.is_profile_complete,
    expertData?.stripe_onboarded,
    expertData?.has_event_or_consult,
    isChatGroup,
  ]);

  if (!steps.length) return null;

  return (
    <div className="mx-auto my-8">
      <div className="bg-white shadow rounded-lg border border-primary/20 p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <HiOutlineInformationCircle className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold text-primary">Quick Steps to Get Started</h2>
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
              {index + 1}
            </div>
            <div className="flex-1 text-gray-800 font-medium">{step.text}</div>
            {step.buttonText ? (
              <div className="flex-shrink-0">
                <button
                  onClick={step.onClick}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {step.buttonText}
                </button>
              </div>
            ) : null}
          </div>
        ))}

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
