'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/services/private/user';
import queryKeys from '@/utils/query-keys';
import { PageHeader } from '@/components/common/page';
import UserPermissionManager from '@/components/entities/users/UserPermissionManager';
import PermissionGuard from '@/components/common/PermissionGuard';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

const UserPermissionsPage = () => {
  const params = useParams();
  const userId = params.id;

  // Fetch user details
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: [queryKeys.users, userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });

  const user = userResponse?.data;
  const userName = user ? `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || user.email : 'Unknown User';

  if (userLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">User not found</h3>
        <p className="text-gray-500">The requested user could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/portal/admin/entities/users"
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft className="h-5 w-5 mr-2" />
          Back to Users
        </Link>
      </div>

      <PageHeader
        title={`Manage Permissions - ${userName}`}
        description={`Configure roles and permissions for ${userName}`}
      />

      <PermissionGuard permission="manage_user_permissions">
        <UserPermissionManager userId={userId} userName={userName} />
      </PermissionGuard>
    </div>
  );
};

export default UserPermissionsPage;
