'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getGroupPermissionDetails, updateGroupPermission } from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { MdOutlineArrowBack } from 'react-icons/md';
import Link from 'next/link';
import GroupPermissionForm from '@/components/permissions/GroupPermissionForm';

const EditGroupPermissionPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissionId = params.id;

  // Fetch permission details
  const { data: permissionResponse, isLoading: permissionLoading } = useQuery({
    queryKey: [queryKeys.groupPermissions, permissionId],
    queryFn: () => getGroupPermissionDetails({ id: permissionId }),
    enabled: !!permissionId,
  });

  // Update mutation
  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateGroupPermission,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.groupPermissions]);
      queryClient.invalidateQueries([queryKeys.groupPermissions, permissionId]);
      toast.success('Group permission updated successfully');
      router.push(`/portal/admin/permissions/${permissionId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update group permission');
    },
  });

  const handleSubmit = async (formData) => {
    await updateMutation({
      id: permissionId,
      payload: formData
    });
  };

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
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back to Permissions
          </button>
        </Link>
      </div>
    );
  }

  const headerActions = [
    {
      id: 'back',
      variant: 'outlined',
      onClick: () => router.back(),
      label: 'Back',
      Icon: MdOutlineArrowBack,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title={`Edit ${permission.group_name}`}>
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>

      {/* Permission Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Permission Information</h3>
        </div>
        
        <div className="px-6 py-6">
          <GroupPermissionForm
            initialData={permission}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            submitButtonText="Update Permission"
          />
        </div>
      </div>
    </div>
  );
};

export default EditGroupPermissionPage;
