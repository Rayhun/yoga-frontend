'use client';
import { useMemo } from 'react';
import { FaHome } from 'react-icons/fa';
import { AiOutlineDashboard } from 'react-icons/ai';

const APP_BREADCRUMB = {
  label: 'Home',
  href: '/app',
  Icon: FaHome,
};

const PORTAL_BREADCRUMB = {
  label: 'Dashboard',
  href: '/portal',
  Icon: AiOutlineDashboard,
};

function useBreadcrumbs({ data = [], isAppBreadcrumb, isPortalBreadcrumb }) {
  const breadcrumbsData = useMemo(
    () => [
      ...(isAppBreadcrumb ? [APP_BREADCRUMB] : []),
      ...(isPortalBreadcrumb ? [PORTAL_BREADCRUMB] : []),
      ...data,
    ],
    [data, isAppBreadcrumb, isPortalBreadcrumb]
  );

  return breadcrumbsData;
}

export default useBreadcrumbs;
