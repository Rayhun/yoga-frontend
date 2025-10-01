'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdOutlineRemoveRedEye, MdOutlineEdit, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getStaffUsersList } from '@/services/private/user/staff';
import queryKeys from '@/utils/query-keys';
import PermissionGuard from '@/components/common/PermissionGuard';
import useAuthContext from '@/hooks/useAuthContext';

const StaffUsersList = () => {
  const router = useRouter();
  const { user } = useAuthContext();


  // Check if user is admin
  if (!user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need admin permissions to access staff management.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Current role: {user.profile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  const tableColumns = useMemo(
    () => [
      {
        header: 'First Name',
        accessorKey: 'first_name',
      },
      {
        header: 'Last Name',
        accessorKey: 'last_name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Mobile Number',
        accessorKey: 'mobile_number',
      },
      {
        header: 'Role',
        accessorKey: 'role',
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ getValue }) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions = useMemo(() => [
    {
      id: 'view',
      Icon: MdOutlineRemoveRedEye,
      onClick: (row) => router.push(`/portal/admin/staff/${row.original.id}/details`),
    },
    {
      id: 'edit',
      Icon: MdOutlineEdit,
      onClick: (row) => router.push(`/portal/admin/staff/${row.original.id}/edit`),
    },
    {
      id: 'delete',
      Icon: MdDeleteOutline,
      onClick: (row) => {
        if (confirm('Are you sure you want to delete this staff user?')) {
          // Handle delete action
          console.log('Delete staff user:', row.original.id);
        }
      },
    },
  ], [router]);

  const headerQuickActions = useMemo(() => [
    {
      id: 'add',
      Icon: MdOutlineAdd,
      label: 'Add Staff User',
      onClick: () => router.push('/portal/admin/staff/add'),
    },
  ], [router]);

  const {
    isLoading,
    columns,
    data: response,
  } = useTable({
    columns: tableColumns,
    queryFn: getStaffUsersList,
    queryKey: [queryKeys.staffUsers],
    rowActions,
    removeActionColumn: false,
  });

  return (
    <div>
      <PageHeader title="Staff Users">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>
      
      <div className="mt-6">
        <BasicTable
          columns={columns}
          data={response?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default StaffUsersList;
