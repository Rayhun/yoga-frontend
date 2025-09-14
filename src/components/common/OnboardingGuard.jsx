'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuthContext from '@/hooks/useAuthContext';

const OnboardingGuard = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    // Only check onboarding for customers, not admins
    if (user?.isCustomer && !user?.isAdmin) {
      // Check if on_boarding_quiz is false
      if (user?.profile?.on_boarding_quiz === false) {
        router.push('/onboarding');
      }
    }
  }, [user, router]);

  // If user is admin or onboarding is completed, render children
  if (user?.isAdmin || user?.profile?.on_boarding_quiz === true) {
    return children;
  }

  // If user is customer and onboarding is not completed, show loading
  if (user?.isCustomer && user?.profile?.on_boarding_quiz === false) {
    return null; // Will redirect in useEffect
  }

  // Default case - render children
  return children;
};

export default OnboardingGuard;
