'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getGroupPermissionDetails } from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import { PageHeader } from '@/components/common/page';
import { FiArrowLeft, FiShield, FiEdit, FiCalendar, FiTag } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';

const GroupPermissionDetails = () => {
  const params = useParams();
  const permissionId = params.id;

  // Fetch permission details
  const { data: permissionResponse, isLoading: permissionLoading } = useQuery({
    queryKey: [queryKeys.groupPermissions, permissionId],
    queryFn: () => getGroupPermissionDetails({ id: permissionId }),
    enabled: !!permissionId,
  });

  const permission = permissionResponse?.data?.data;

  if (permissionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Permission not found</h3>
        <p className="text-gray-500">The requested permission could not be found.</p>
        <Link href="/portal/admin/permissions" className="mt-4 inline-block">
          <Button variant="outline">Back to Permissions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/portal/admin/permissions"
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft className="h-5 w-5 mr-2" />
          Back to Permissions
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title={permission.group_name}
        description={`View details for ${permission.group_name} group`}
      >
        <PermissionGuard permission="edit_group_permissions">
          <Link href={`/portal/admin/permissions/${permissionId}/edit`}>
            <Button variant="primary" size="sm">
              <FiEdit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </Link>
        </PermissionGuard>
      </PageHeader>

      {/* Permission Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Permission Details</h3>
        </div>
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiShield className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Group Name</h4>
                  <p className="text-sm text-gray-600">{permission.group_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiTag className="h-5 w-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Total Permissions</h4>
                  <p className="text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {permission.permissions?.length || 0} permissions
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions List */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Permissions</h4>
                {permission.permissions && permission.permissions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {permission.permissions.map((permissionCodename, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 font-mono">{permissionCodename}</span>
                        <FiShield className="h-4 w-4 text-blue-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No permissions assigned to this group</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPermissionDetails;
