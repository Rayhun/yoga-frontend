'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getEmployeesList, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '@/services/private/user/employees';
import { getBusinessSubscription } from '@/services/private/business/subscription';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import Button from '@/components/common/Button';
import { FiPlus, FiUsers } from 'react-icons/fi';

const EmployeeManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const queryClient = useQueryClient();

  // Fetch employees list
  const { 
    data: employeesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [queryKeys.employees],
    queryFn: getEmployeesList,
  });

  // Fetch subscription data for limit checking
  const { 
    data: subscriptionResponse 
  } = useQuery({
    queryKey: [queryKeys.businessSubscription],
    queryFn: getBusinessSubscription,
  });

  // Create employee mutation
  const { mutateAsync: createEmployeeMutation } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.employees]);
      toast.success('Employee added successfully');
      setShowForm(false);
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  // Update employee mutation
  const { mutateAsync: updateEmployeeMutation } = useMutation({
    mutationFn: ({ id, data }) => updateEmployee({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.employees]);
      toast.success('Employee updated successfully');
      setShowForm(false);
      setEditingEmployee(null);
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  // Delete employee mutation
  const { mutateAsync: deleteEmployeeMutation } = useMutation({
    mutationFn: ({ id }) => deleteEmployee({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.employees]);
      toast.success('Employee removed successfully');
    },
    onError: (error) => {
      toastApiError(error);
    },
  });

  const employees = employeesResponse?.data?.data || [];
  const subscription = subscriptionResponse?.data?.data;
  
  const currentEmployees = employees.length;
  const employeeLimit = subscription?.employee_limit || 10;
  const canAddEmployee = currentEmployees < employeeLimit;

  const handleAddEmployee = () => {
    if (!canAddEmployee) {
      toast.error(`Employee limit reached (${currentEmployees}/${employeeLimit}). Please update your subscription to add more employees.`);
      return;
    }
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      await deleteEmployeeMutation({ id: employeeId });
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingEmployee) {
      await updateEmployeeMutation({ 
        id: editingEmployee.id, 
        data: formData 
      });
    } else {
      await createEmployeeMutation(formData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading employees: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FiUsers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Employee Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your business employees and their access
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddEmployee}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              canAddEmployee 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
            disabled={!canAddEmployee}
          >
            <FiPlus className="h-5 w-5" />
            {canAddEmployee ? 'Add Employee' : 'Limit Reached'}
          </Button>
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
          <div className="w-full max-w-2xl max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="animate-fadeIn transform transition-all duration-300">
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Employee Limit Status */}
      {subscription && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <FiUsers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Employee Usage</h3>
                <p className="text-sm text-gray-600">
                  {currentEmployees} of {employeeLimit} employees used
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((currentEmployees / employeeLimit) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Utilization</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                (currentEmployees / employeeLimit) >= 0.9 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : (currentEmployees / employeeLimit) >= 0.7 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}
              style={{ width: `${Math.min((currentEmployees / employeeLimit) * 100, 100)}%` }}
            ></div>
          </div>
          
          {!canAddEmployee && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-red-700">
                  Employee limit reached - Update your subscription to add more employees
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
};

export default EmployeeManagement;
