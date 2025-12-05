'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  getPermissions, 
  getRoles,
  getUserPermissionsByUserId,
  grantPermission, 
  revokePermission,
  assignRoleToUser,
  removeRoleFromUser
} from '@/services/private/permissions';
import queryKeys from '@/utils/query-keys';
import useAuthContext from '@/hooks/useAuthContext';
import { BasicTable } from '@/components/common/table';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { FiCheck, FiX, FiSave, FiRefreshCw, FiUser, FiShield } from 'react-icons/fi';

const UserPermissionManager = ({ userId, userName }) => {
  const { hasPermission } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [selectedRoles, setSelectedRoles] = useState(new Set());

  // Fetch all available permissions
  const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery({
    queryKey: [queryKeys.permissions],
    queryFn: getPermissions,
  });

  // Fetch all available roles
  const { data: rolesResponse, isLoading: rolesLoading } = useQuery({
    queryKey: [queryKeys.roles],
    queryFn: getRoles,
  });

  // Fetch user's current permissions and roles
  const { data: userPermissionsResponse, isLoading: userPermissionsLoading } = useQuery({
    queryKey: [queryKeys.userPermissions, userId],
    queryFn: () => getUserPermissionsByUserId(userId),
    enabled: !!userId,
  });

  const permissions = permissionsResponse?.data || [];
  const roles = rolesResponse?.data || [];
  const userData = userPermissionsResponse?.data || {};
  const userRoles = userData.user_roles || [];
  const userPermissions = userData.user_permissions || [];
  const allUserPermissions = userData.all_permissions || [];

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  }, [permissions]);

  // Check if user has a specific permission
  const userHasPermission = (permissionId) => {
    return allUserPermissions.some(perm => perm.id === permissionId);
  };

  // Check if user has a specific role
  const userHasRole = (roleId) => {
    return userRoles.some(userRole => userRole.role.id === roleId && userRole.is_active);
  };

  // Toggle permission selection
  const togglePermission = (permissionId) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Toggle role selection
  const toggleRole = (roleId) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  // Grant permission mutation
  const { mutateAsync: grantPermissionMutation } = useMutation({
    mutationFn: grantPermission,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.userPermissions, userId]);
      toast.success('Permission granted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to grant permission');
    },
  });

  // Revoke permission mutation
  const { mutateAsync: revokePermissionMutation } = useMutation({
    mutationFn: revokePermission,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.userPermissions, userId]);
      toast.success('Permission revoked successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to revoke permission');
    },
  });

  // Assign role mutation
  const { mutateAsync: assignRoleMutation } = useMutation({
    mutationFn: ({ roleId, data }) => assignRoleToUser(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.userPermissions, userId]);
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to assign role');
    },
  });

  // Remove role mutation
  const { mutateAsync: removeRoleMutation } = useMutation({
    mutationFn: ({ roleId, data }) => removeRoleFromUser(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.userPermissions, userId]);
      toast.success('Role removed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove role');
    },
  });

  // Handle individual permission toggle
  const handlePermissionToggle = async (permission) => {
    if (userHasPermission(permission.id)) {
      await revokePermissionMutation({
        user: userId,
        permission: permission.id
      });
    } else {
      await grantPermissionMutation({
        user: userId,
        permission: permission.id
      });
    }
  };

  // Handle individual role toggle
  const handleRoleToggle = async (role) => {
    if (userHasRole(role.id)) {
      await removeRoleMutation({
        roleId: role.id,
        data: { user: userId }
      });
    } else {
      await assignRoleMutation({
        roleId: role.id,
        data: { user: userId }
      });
    }
  };

  // Handle bulk permission operations
  const handleBulkPermissionOperation = async (operation) => {
    if (selectedPermissions.size === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    const permissionIds = Array.from(selectedPermissions);
    
    if (operation === 'grant') {
      for (const permissionId of permissionIds) {
        await grantPermissionMutation({
          user: userId,
          permission: permissionId
        });
      }
    } else if (operation === 'revoke') {
      for (const permissionId of permissionIds) {
        await revokePermissionMutation({
          user: userId,
          permission: permissionId
        });
      }
    }
    
    setSelectedPermissions(new Set());
  };

  // Handle bulk role operations
  const handleBulkRoleOperation = async (operation) => {
    if (selectedRoles.size === 0) {
      toast.error('Please select at least one role');
      return;
    }

    const roleIds = Array.from(selectedRoles);
    
    if (operation === 'assign') {
      for (const roleId of roleIds) {
        await assignRoleMutation({
          roleId,
          data: { user: userId }
        });
      }
    } else if (operation === 'remove') {
      for (const roleId of roleIds) {
        await removeRoleMutation({
          roleId,
          data: { user: userId }
        });
      }
    }
    
    setSelectedRoles(new Set());
  };

  if (permissionsLoading || rolesLoading || userPermissionsLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <FiUser className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{userName}</h3>
            <p className="text-sm text-gray-500">User ID: {userId}</p>
          </div>
        </div>
      </div>

      {/* Current Roles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <FiShield className="h-5 w-5 mr-2" />
            Current Roles
          </h4>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkRoleOperation('assign')}
              disabled={selectedRoles.size === 0}
            >
              Assign Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkRoleOperation('remove')}
              disabled={selectedRoles.size === 0}
            >
              Remove Selected
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                userHasRole(role.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${selectedRoles.has(role.id) ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => toggleRole(role.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{role.display_name}</h5>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {userHasRole(role.id) && (
                    <FiCheck className="h-5 w-5 text-green-500" />
                  )}
                  {selectedRoles.has(role.id) && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <div key={category} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 capitalize">
                {category.replace('_', ' ')} Permissions
              </h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPermissionOperation('grant')}
                  disabled={selectedPermissions.size === 0}
                >
                  Grant Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPermissionOperation('revoke')}
                  disabled={selectedPermissions.size === 0}
                >
                  Revoke Selected
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    userHasPermission(permission.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${selectedPermissions.has(permission.id) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => togglePermission(permission.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{permission.name}</h5>
                      <p className="text-sm text-gray-500">{permission.codename}</p>
                      {permission.description && (
                        <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {userHasPermission(permission.id) && (
                        <FiCheck className="h-5 w-5 text-green-500" />
                      )}
                      {selectedPermissions.has(permission.id) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPermissionManager;
