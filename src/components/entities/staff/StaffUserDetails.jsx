'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { getStaffUser } from '@/services/private/user/staff';
import queryKeys from '@/utils/query-keys';
import useAuthContext from '@/hooks/useAuthContext';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';

const StaffUserDetails = ({ staffUserId }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const {
    data: staffUserResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: [queryKeys.staffUsers, staffUserId],
    queryFn: () => getStaffUser({ id: staffUserId }),
    enabled: !!staffUserId && staffUserId !== 'undefined',
  });

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

  // Check if staffUserId is valid
  if (!staffUserId || staffUserId === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Invalid Staff User ID
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The staff user ID is missing or invalid.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Staff User ID: {staffUserId}
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Staff User
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.response?.status === 401 
              ? 'You are not authorized to view this staff user. Please check your permissions.'
              : error?.response?.status === 404
              ? 'Staff user not found.'
              : 'An error occurred while loading the staff user details.'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Error: {error?.response?.status} - {error?.message}
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const staffUser = staffUserResponse?.data?.data;

  // Debug: Log the staff user data
  console.log('StaffUserDetails - API Response:', staffUserResponse);
  console.log('StaffUserDetails - Staff User Data:', staffUser);

  // If no staff user data, show error
  if (!staffUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            No Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load staff user details.
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const headerQuickActions = [
    {
      label: 'Edit Staff User',
      action: () => router.push(`/portal/admin/staff/${staffUser.id}/edit`),
      permission: 'staff_user_edit',
      variant: 'primary',
    },
  ];

  return (
    <div>
      <PageHeader title="Staff User Details">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>
      
      <div className="mt-6">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.first_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.last_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.mobile_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Image
                    </label>
                    <div className="mt-1">
                      {staffUser.profile_image ? (
                        <img 
                          src={staffUser.profile_image} 
                          alt="Profile" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {staffUser.role || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      staffUser.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {staffUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.created_at ? new Date(staffUser.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Updated
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {staffUser.updated_at ? new Date(staffUser.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
              <div className="flex gap-3">
                <PermissionGuard permission="staff_user_edit">
                  <Button 
                    variant="primary"
                    onClick={() => router.push(`/portal/admin/staff/${staffUser.id}/edit`)}
                  >
                    Edit Staff User
                  </Button>
                </PermissionGuard>
                <Button 
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Back to List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffUserDetails;
