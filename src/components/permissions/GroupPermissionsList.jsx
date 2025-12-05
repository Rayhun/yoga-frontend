'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { FiShield } from 'react-icons/fi';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { 
  getGroupPermissionsList, 
  deleteGroupPermission
} from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { useQueryClient } from '@tanstack/react-query';
import PermissionGuard from '@/components/common/PermissionGuard';

const GroupPermissionsList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Delete hook
  const { handleDelete: handleDeletePermission, isDeleting } = useDelete({
    deleteFn: deleteGroupPermission,
    queryKey: [queryKeys.groupPermissions],
    successMessage: 'Group permission deleted successfully',
  });


  const handleDelete = useCallback(async (permission) => {
    await confirm({ 
      message: `Are you sure you want to delete "${permission.group_name}"? This action cannot be undone.` 
    });
    await handleDeletePermission({ id: permission.id });
  }, [confirm, handleDeletePermission]);

  const tableColumns = useMemo(
    () => [
      {
        header: 'Group Name',
        accessorKey: 'group_name',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FiShield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{row.original.group_name}</div>
            </div>
          </div>
        ),
      },
      {
        header: 'Permissions',
        accessorKey: 'permissions',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {row.original.permissions?.length || 0} permissions
            </span>
          </div>
        ),
      },
      {
        header: 'Permission List',
        accessorKey: 'permissions_list',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 max-w-xs">
            {row.original.permissions && row.original.permissions.length > 0 ? (
              <>
                {row.original.permissions.slice(0, 3).map((permission, index) => (
                  <span key={index} className="block truncate font-mono text-xs">
                    {permission}
                  </span>
                ))}
                {row.original.permissions.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{row.original.permissions.length - 3} more...
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No permissions assigned</span>
            )}
          </div>
        ),
      }
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/permissions/${row.original.id}`),
        permission: 'group_permissions_view',
      },
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/permissions/${row.original.id}/edit`),
        permission: 'group_permissions_edit',
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDelete(row.original),
        isLoading: isDeleting,
        permission: 'group_permissions_delete',
      },
    ],
    [router, handleDelete, isDeleting]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add Group Permission',
        onClick: () => router.push('/portal/admin/permissions/add'),
        permission: 'group_permissions_add',
      },
    ],
    [router]
  );

  const {
    isLoading,
    columns,
    data,
  } = useTable({
    columns: tableColumns,
    queryFn: getGroupPermissionsList,
    queryKey: [queryKeys.groupPermissions],
    rowActions,
  });

  return (
    <PermissionGuard permission="group_permissions_view">
      <div>
        <PageHeader title="Group Permissions">
          <PageHeaderQuickActions actions={headerQuickActions} />
        </PageHeader>

        <BasicTable isLoading={isLoading} columns={columns} data={data} />
      </div>
    </PermissionGuard>
  );
};

export default GroupPermissionsList;
