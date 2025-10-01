import axios from '@/lib/axios';

// Group Permissions CRUD operations
export const getGroupPermissionsList = async () => {
  try {
    const response = await axios.get('/permissions/group-permissions/');
    console.log('Raw API Response:', response);
    console.log('Response Data:', response.data);
    
    // Handle different response structures
    if (response.data && response.data.data) {
      // Structure: { status: "success", message: "...", data: [...] }
      return {
        data: response.data.data
      };
    } else if (Array.isArray(response.data)) {
      // Structure: [...]
      return {
        data: response.data
      };
    } else {
      // Fallback: return empty array
      console.warn('Unexpected API response structure:', response.data);
      return {
        data: []
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    // Return mock data for testing
    return {
      data: [
        {
          id: 1,
          group_name: "admin group5",
          permissions: ["home_access"],
          created_at: "2025-09-30T22:01:41.449810Z",
          updated_at: "2025-09-30T22:01:41.449826Z"
        }
      ]
    };
  }
};

export const getGroupPermissionDetails = async ({ id }) => {
  return axios.get(`/permissions/group-permissions/${id}/`);
};

export const createGroupPermission = async ({ payload }) => {
  return axios.post('/permissions/group-permissions/', payload);
};

export const updateGroupPermission = async ({ id, payload }) => {
  return axios.put(`/permissions/group-permissions/${id}/`, payload);
};

export const patchGroupPermission = async ({ id, payload }) => {
  return axios.patch(`/permissions/group-permissions/${id}/`, payload);
};

export const deleteGroupPermission = async ({ id }) => {
  return axios.delete(`/permissions/group-permissions/${id}/`);
};

// Legacy permission functions (if needed for existing functionality)
export const getPermissions = async () => {
  return axios.get('/permissions/');
};

export const getRoles = async () => {
  return axios.get('/permissions/roles/');
};

export const getUserRoles = async () => {
  return axios.get('/permissions/user-roles/');
};

export const getUserPermissions = async () => {
  return axios.get('/permissions/user-permissions/');
};

export const grantPermission = async ({ userId, permissionId }) => {
  return axios.post('/permissions/grant/', {
    user_id: userId,
    permission_id: permissionId
  });
};

export const revokePermission = async ({ userId, permissionId }) => {
  return axios.post('/permissions/revoke/', {
    user_id: userId,
    permission_id: permissionId
  });
};

export const assignRoleToUser = async ({ userId, roleId }) => {
  return axios.post('/permissions/assign-role/', {
    user_id: userId,
    role_id: roleId
  });
};

export const removeRoleFromUser = async ({ userId, roleId }) => {
  return axios.post('/permissions/remove-role/', {
    user_id: userId,
    role_id: roleId
  });
};

export const bulkPermissionOperations = async ({ payload }) => {
  return axios.post('/permissions/bulk-operations/', payload);
};

// Role CRUD operations
export const createRole = async ({ payload }) => {
  return axios.post('/permissions/roles/', payload);
};

export const updateRole = async ({ id, payload }) => {
  return axios.put(`/permissions/roles/${id}/`, payload);
};

export const deleteRole = async ({ id }) => {
  return axios.delete(`/permissions/roles/${id}/`);
};

// User-specific permission operations
export const getUserPermissionsByUserId = async ({ userId }) => {
  return axios.get(`/permissions/users/${userId}/permissions/`);
};
