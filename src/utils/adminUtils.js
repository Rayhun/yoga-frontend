/**
 * Admin utility functions for checking admin access
 */

/**
 * Check if user is admin
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return user?.isAdmin || user?.profile?.role === 'Admin';
};

/**
 * Check if user has admin access (admin or staff)
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user is admin or staff
 */
export const hasAdminAccess = (user) => {
  return isAdmin(user) || user?.profile?.role === 'Staff';
};

/**
 * Check if user can manage another user based on role hierarchy
 * @param {Object} currentUser - Current user object
 * @param {Object} targetUser - Target user object
 * @returns {boolean} - True if current user can manage target user
 */
export const canManageUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // Admin can manage everyone
  if (isAdmin(currentUser)) return true;
  
  // Staff can manage customers, teachers, community, affiliates
  if (currentUser.profile?.role === 'Staff') {
    return ['Customer', 'Teacher', 'Community', 'Affiliate'].includes(targetUser.profile?.role);
  }
  
  // Teachers can only manage their own profile and customers in their programs
  if (currentUser.profile?.role === 'Teacher') {
    return targetUser.profile?.id === currentUser.profile?.id;
  }
  
  // Others can only manage themselves
  return targetUser.profile?.id === currentUser.profile?.id;
};

/**
 * Get user role display name with styling
 * @param {string} role - User role
 * @returns {Object} - Object with display name and CSS classes
 */
export const getRoleDisplay = (role) => {
  const roleConfig = {
    Admin: {
      name: 'Admin',
      classes: 'bg-red-100 text-red-800',
      icon: '👑'
    },
    Staff: {
      name: 'Staff',
      classes: 'bg-blue-100 text-blue-800',
      icon: '👨‍💼'
    },
    Teacher: {
      name: 'Teacher',
      classes: 'bg-green-100 text-green-800',
      icon: '👨‍🏫'
    },
    Customer: {
      name: 'Customer',
      classes: 'bg-gray-100 text-gray-800',
      icon: '👤'
    },
    Community: {
      name: 'Community',
      classes: 'bg-purple-100 text-purple-800',
      icon: '👥'
    },
    Affiliate: {
      name: 'Affiliate',
      classes: 'bg-yellow-100 text-yellow-800',
      icon: '🤝'
    }
  };
  
  return roleConfig[role] || {
    name: role || 'Unknown',
    classes: 'bg-gray-100 text-gray-800',
    icon: '❓'
  };
};

/**
 * Get permission category display info
 * @param {string} category - Permission category
 * @returns {Object} - Object with display name and description
 */
export const getPermissionCategoryDisplay = (category) => {
  const categoryConfig = {
    content: {
      name: 'Content Management',
      description: 'Manage programs, modules, and content',
      icon: '📝'
    },
    user: {
      name: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: '👥'
    },
    financial: {
      name: 'Financial/Subscription',
      description: 'Manage subscriptions and payments',
      icon: '💰'
    },
    expert: {
      name: 'Expert/Teacher',
      description: 'Manage expert applications and content',
      icon: '🎓'
    },
    affiliate: {
      name: 'Affiliate Management',
      description: 'Manage affiliate programs and commissions',
      icon: '🤝'
    },
    chat: {
      name: 'Chat/Communication',
      description: 'Manage chat groups and moderation',
      icon: '💬'
    },
    analytics: {
      name: 'Analytics & Reporting',
      description: 'View analytics and generate reports',
      icon: '📊'
    },
    system: {
      name: 'System Administration',
      description: 'Manage system settings and maintenance',
      icon: '⚙️'
    }
  };
  
  return categoryConfig[category] || {
    name: category || 'Unknown',
    description: 'Unknown category',
    icon: '❓'
  };
};
