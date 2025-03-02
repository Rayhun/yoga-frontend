'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsersList } from '@/services/private/user';
import queryKeys from '@/utils/query-keys';

function useUserOptions() {
  const { isLoading, data: usersResponse } = useQuery({
    queryFn: getUsersList,
    queryKey: [queryKeys.users],
  });

  const userOptions = useMemo(
    () =>
      usersResponse?.data?.data?.map(option => ({
        label: option.profile.first_name + ' ' + (option.profile.last_name || ''),
        value: option.profile.id,
      })),
    [usersResponse]
  );

  return {
    isLoading,
    options: userOptions,
  };
}

export default useUserOptions;
