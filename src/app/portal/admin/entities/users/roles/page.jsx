'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getRoles, createRole, updateRole, deleteRole } from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import useAuthContext from '@/hooks/useAuthContext';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { FiPlus, FiEdit, FiTrash2, FiShield, FiUsers } from 'react-icons/fi';

const RoleManagementPage = () => {
  const { hasPermission } = useAuthContext();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Fetch roles
  const { data: rolesResponse, isLoading: rolesLoading } = useQuery({
    queryKey: [queryKeys.roles],
    queryFn: getRoles,
  });

  const roles = rolesResponse?.data || [];

  // Create role mutation
  const { mutateAsync: createRoleMutation, isPending: createLoading } = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.roles]);
      setShowCreateModal(false);
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create role');
    },
  });

  // Update role mutation
  const { mutateAsync: updateRoleMutation, isPending: updateLoading } = useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.roles]);
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update role');
    },
  });

  // Delete role mutation
  const { mutateAsync: deleteRoleMutation } = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.roles]);
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete role');
    },
  });

  const handleCreateRole = async (roleData) => {
    await createRoleMutation(roleData);
  };

  const handleUpdateRole = async (roleData) => {
    await updateRoleMutation({ id: editingRole.id, data: roleData });
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      await deleteRoleMutation(roleId);
    }
  };

  const columns = [
    {
      key: 'display_name',
      label: 'Role Name',
      render: (role) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <FiShield className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{role.display_name}</div>
            <div className="text-sm text-gray-500">{role.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (role) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {role.description || 'No description'}
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (role) => (
        <div className="text-sm text-gray-900">
          {role.permissions?.length || 0} permissions
        </div>
      ),
    },
    {
      key: 'user_count',
      label: 'Users',
      render: (role) => (
        <div className="flex items-center text-sm text-gray-900">
          <FiUsers className="h-4 w-4 mr-1" />
          {role.user_count || 0}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (role) => (
        <div className="flex items-center space-x-2">
          {role.is_system_role && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              System
            </span>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            role.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {role.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (role) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard permission="manage_system_roles">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingRole(role)}
            >
              <FiEdit className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          {!role.is_system_role && (
            <PermissionGuard permission="manage_system_roles">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteRole(role.id)}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </PermissionGuard>
          )}
        </div>
      ),
    },
  ];

  if (rolesLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Create and manage system roles and their permissions"
      >
        <PageHeaderQuickActions>
          <PermissionGuard permission="manage_system_roles">
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </PermissionGuard>
        </PageHeaderQuickActions>
      </PageHeader>

      {/* Roles Table */}
      <div className="bg-white shadow rounded-lg">
        <BasicTable
          data={roles}
          columns={columns}
          loading={rolesLoading}
          emptyMessage="No roles found"
        />
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateModal || editingRole) && (
        <RoleFormModal
          role={editingRole}
          onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
          loading={createLoading || updateLoading}
        />
      )}
    </div>
  );
};

// Role Form Modal Component
const RoleFormModal = ({ role, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    display_name: role?.display_name || '',
    description: role?.description || '',
    is_active: role?.is_active ?? true,
    permission_ids: role?.permissions?.map(p => p.id) || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {role ? 'Edit Role' : 'Create New Role'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., content_manager"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Content Manager"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Describe the role's purpose..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (role ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
