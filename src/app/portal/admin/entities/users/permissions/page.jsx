'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  getPermissions, 
  getRoles, 
  getUserRoles,
  getUserPermissions,
  grantPermission, 
  revokePermission,
  assignRoleToUser,
  removeRoleFromUser,
  bulkPermissionOperations
} from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import useAuthContext from '@/hooks/useAuthContext';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { FiCheck, FiX, FiSave, FiRefreshCw, FiUsers, FiShield, FiSettings } from 'react-icons/fi';

const PermissionManagementPage = () => {
  const { hasPermission } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('permissions');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Fetch permissions
  const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery({
    queryKey: [queryKeys.permissions],
    queryFn: getPermissions,
  });

  // Fetch roles
  const { data: rolesResponse, isLoading: rolesLoading } = useQuery({
    queryKey: [queryKeys.roles],
    queryFn: getRoles,
  });

  // Fetch user roles
  const { data: userRolesResponse, isLoading: userRolesLoading } = useQuery({
    queryKey: [queryKeys.userRoles],
    queryFn: getUserRoles,
  });

  // Fetch user permissions
  const { data: userPermissionsResponse, isLoading: userPermissionsLoading } = useQuery({
    queryKey: [queryKeys.userPermissions],
    queryFn: getUserPermissions,
  });

  const permissions = permissionsResponse?.data || [];
  const roles = rolesResponse?.data || [];
  const userRoles = userRolesResponse?.data || [];
  const userPermissions = userPermissionsResponse?.data || [];

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Bulk operations mutation
  const { mutateAsync: bulkOperationsMutation, isPending: bulkLoading } = useMutation({
    mutationFn: bulkPermissionOperations,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.userPermissions]);
      queryClient.invalidateQueries([queryKeys.userRoles]);
      setSelectedUsers([]);
      setSelectedPermissions([]);
      setSelectedRoles([]);
      toast.success('Bulk operation completed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to perform bulk operation');
    },
  });

  const handleBulkOperation = async (operation) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    let data = {
      operation,
      user_ids: selectedUsers,
    };

    if (operation.includes('permission')) {
      if (selectedPermissions.length === 0) {
        toast.error('Please select at least one permission');
        return;
      }
      data.permission_ids = selectedPermissions;
    }

    if (operation.includes('role')) {
      if (selectedRoles.length === 0) {
        toast.error('Please select at least one role');
        return;
      }
      data.role_ids = selectedRoles;
    }

    await bulkOperationsMutation(data);
  };

  const tabs = [
    { id: 'permissions', label: 'Permissions', icon: FiShield },
    { id: 'roles', label: 'Roles', icon: FiUsers },
    { id: 'assignments', label: 'User Assignments', icon: FiSettings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Management"
        description="Manage system permissions, roles, and user assignments"
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">System Permissions</h3>
            <PermissionGuard permission="manage_permissions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {/* Add new permission modal */}}
              >
                Add Permission
              </Button>
            </PermissionGuard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="space-y-2">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                        <p className="text-xs text-gray-500">{permission.codename}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        permission.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {permission.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">System Roles</h3>
            <PermissionGuard permission="manage_system_roles">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {/* Add new role modal */}}
              >
                Add Role
              </Button>
            </PermissionGuard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{role.display_name}</h4>
                  <div className="flex items-center space-x-2">
                    {role.is_system_role && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        System
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      role.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Permissions ({role.permissions?.length || 0})
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    {role.permissions?.slice(0, 5).map((permission) => (
                      <div key={permission.id} className="text-xs text-gray-500 py-1">
                        {permission.name}
                      </div>
                    ))}
                    {role.permissions?.length > 5 && (
                      <div className="text-xs text-gray-400 py-1">
                        +{role.permissions.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {role.user_count} users
                  </span>
                  <PermissionGuard permission="manage_system_roles">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">User Assignments</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('grant_permissions')}
                disabled={bulkLoading}
              >
                Grant Permissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('assign_roles')}
                disabled={bulkLoading}
              >
                Assign Roles
              </Button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <select
                  multiple
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedUsers}
                  onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {/* Add user options here */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Permissions
                </label>
                <select
                  multiple
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedPermissions}
                  onChange={(e) => setSelectedPermissions(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Roles
                </label>
                <select
                  multiple
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedRoles}
                  onChange={(e) => setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Assignments Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">User Role & Permission Assignments</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direct Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Add user assignment rows here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagementPage;
