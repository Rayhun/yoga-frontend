'use client';
import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSingleExpert } from '@/services/private/lms/expert';
import useAuthContext from '@/hooks/useAuthContext';
import queryKeys from '@/utils/query-keys';

export const ExpertContext = createContext();

export function ExpertProvider({ children }) {
  const {
    user: { profile: userProfile },
  } = useAuthContext();

  const {
    data: expertData,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleExpert({ id: userProfile.expert }),
    queryKey: [queryKeys.lmsExperts, userProfile.expert],
    enabled: !!userProfile?.expert, // Only fetch if expert ID exists
  });

  const value = {
    expertData: expertData?.data?.data,
    isLoading,
    failureReason,
  };

  return <ExpertContext.Provider value={value}>{children}</ExpertContext.Provider>;
}
