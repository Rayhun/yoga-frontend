'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useAuthContext from '@/hooks/useAuthContext';

const RENEW_PATH = '/portal/customer/subscriptions';

const SubscriptionGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext();

  const needsRenewal =
    user?.isCustomer &&
    !user?.isEmployee &&
    user?.profile?.has_active_subscription === false;

  const isOnRenewPath = pathname?.startsWith(RENEW_PATH);

  useEffect(() => {
    if (needsRenewal && !isOnRenewPath) {
      router.replace(RENEW_PATH);
    }
  }, [needsRenewal, isOnRenewPath, router]);

  if (needsRenewal && !isOnRenewPath) {
    return null;
  }

  return children;
};

export default SubscriptionGuard;
