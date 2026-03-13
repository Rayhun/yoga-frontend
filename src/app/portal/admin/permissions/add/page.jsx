'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createGroupPermission } from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import { PageHeader } from '@/components/common/page';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import GroupPermissionForm from '@/components/permissions/GroupPermissionForm';

const AddGroupPermissionPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Create mutation
  const { mutateAsync: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createGroupPermission,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.groupPermissions]);
      toast.success('Group permission created successfully');
      router.push('/portal/admin/permissions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create group permission');
    },
  });

  const handleSubmit = async (formData) => {
    await createMutation({ payload: formData });
  };

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
        title="Add Group Permission"
        description="Create a new group permission for the system"
      />

      {/* Permission Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Permission Information</h3>
        </div>
        
        <div className="px-6 py-6">
          <GroupPermissionForm
            onSubmit={handleSubmit}
            isLoading={isCreating}
            submitButtonText="Create Permission"
          />
        </div>
      </div>
    </div>
  );
};

export default AddGroupPermissionPage;
