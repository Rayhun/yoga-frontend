'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import { FiShield, FiCheck } from 'react-icons/fi';
import { PORTAL_PERMISSIONS } from '@/utils/portal-permissions';

const GroupPermissionForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false, 
  submitButtonText = 'Save' 
}) => {
  const [formData, setFormData] = useState({
    group_name: '',
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Use comprehensive portal permissions covering every UI element
  const allPermissions = PORTAL_PERMISSIONS;

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        group_name: initialData.group_name || '',
        permissions: Array.isArray(initialData.permissions) ? initialData.permissions : [],
      });
    }
    setErrors({});
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePermissionToggle = (permissionCodename) => {
    setFormData(prev => {
      const currentPermissions = Array.isArray(prev.permissions) ? prev.permissions : [];
      const newPermissions = currentPermissions.includes(permissionCodename)
        ? currentPermissions.filter(p => p !== permissionCodename)
        : [...currentPermissions, permissionCodename];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleSelectAllInCategory = (categoryPermissions) => {
    const categoryCodenames = categoryPermissions
      .filter(p => p && p.codename)
      .map(p => p.codename);
    
    setFormData(prev => {
      const currentPermissions = Array.isArray(prev.permissions) ? prev.permissions : [];
      const newPermissions = [...new Set([...currentPermissions, ...categoryCodenames])];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleDeselectAllInCategory = (categoryPermissions) => {
    const categoryCodenames = categoryPermissions
      .filter(p => p && p.codename)
      .map(p => p.codename);
    
    setFormData(prev => {
      const currentPermissions = Array.isArray(prev.permissions) ? prev.permissions : [];
      const newPermissions = currentPermissions.filter(p => !categoryCodenames.includes(p));
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleClearAll = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.group_name.trim()) {
      newErrors.group_name = 'Group name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const isFormValid = formData.group_name.trim();

  // Filter permissions based on search term
  const filteredPermissions = allPermissions.filter(permission => {
    if (!permission || !permission.codename) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (permission.name && permission.name.toLowerCase().includes(searchLower)) ||
      (permission.codename && permission.codename.toLowerCase().includes(searchLower)) ||
      (permission.description && permission.description.toLowerCase().includes(searchLower))
    );
  });

  // Group filtered permissions by category for better organization
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (permission && typeof permission === 'object') {
      const category = permission.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
    }
    return acc;
  }, {});


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div>
        <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 mb-2">
          Group Name *
        </label>
        <input
          type="text"
          id="group_name"
          name="group_name"
          value={formData.group_name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.group_name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter group name (e.g., Admin, Manager, User)"
        />
        {errors.group_name && (
          <p className="mt-1 text-sm text-red-600">{errors.group_name}</p>
        )}
      </div>

      {/* Permissions Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select Permissions
        </label>
        
        {allPermissions.length === 0 ? (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500 text-center">
              No permissions available. Please contact your administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Card: All Available Permissions */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShield className="h-5 w-5 text-blue-500 mr-2" />
                  Available Permissions
                </h4>
                <span className="text-sm text-gray-500">
                  {filteredPermissions.length} permissions
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const currentPermissions = Array.isArray(formData.permissions) ? formData.permissions : [];
                  const categoryCodenames = categoryPermissions.filter(p => p && p.codename).map(p => p.codename);
                  const selectedInCategory = categoryCodenames.filter(codename => currentPermissions.includes(codename));
                  const allSelected = selectedInCategory.length === categoryCodenames.length && categoryCodenames.length > 0;
                  const someSelected = selectedInCategory.length > 0 && selectedInCategory.length < categoryCodenames.length;
                  
                  return (
                    <div key={category} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace('_', ' ')}
                        </h5>
                        <div className="flex space-x-1">
                          {!allSelected && (
                            <button
                              onClick={() => handleSelectAllInCategory(categoryPermissions)}
                              className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            >
                              Select All
                            </button>
                          )}
                          {someSelected && (
                            <button
                              onClick={() => handleDeselectAllInCategory(categoryPermissions)}
                              className="text-xs px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            >
                              Deselect All
                            </button>
                          )}
                        </div>
                      </div>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => {
                        if (!permission || !permission.codename) return null;
                        
                        const currentPermissions = Array.isArray(formData.permissions) ? formData.permissions : [];
                        const isSelected = currentPermissions.includes(permission.codename);
                        
                        return (
                          <div
                            key={permission.id || permission.codename}
                            className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handlePermissionToggle(permission.codename)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 text-sm">{permission.name || 'Unnamed Permission'}</h6>
                                <p className="text-xs text-gray-500 font-mono">{permission.codename}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isSelected && (
                                  <FiCheck className="h-4 w-4 text-blue-500" />
                                )}
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  isSelected 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300'
                                }`}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Second Card: Selected Permissions */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShield className="h-5 w-5 text-green-500 mr-2" />
                  Selected Permissions
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {Array.isArray(formData.permissions) ? formData.permissions.length : 0} selected
                  </span>
                  {Array.isArray(formData.permissions) && formData.permissions.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.isArray(formData.permissions) && formData.permissions.length > 0 ? (
                  formData.permissions.map((permissionCodename) => {
                    const permission = allPermissions.find(p => p && p.codename === permissionCodename);
                    return (
                      <div
                        key={permissionCodename}
                        className="p-3 bg-white border border-green-200 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900 text-sm">
                              {permission?.name || 'Unnamed Permission'}
                            </h6>
                            <p className="text-xs text-gray-500 font-mono">{permissionCodename}</p>
                            {permission?.description && (
                              <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handlePermissionToggle(permissionCodename)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove permission"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <FiShield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No permissions selected</p>
                    <p className="text-xs text-gray-400 mt-1">Select permissions from the left panel</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default GroupPermissionForm;
