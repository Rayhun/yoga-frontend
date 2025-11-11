'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getEmployeesList, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  uploadEmployeesCSV
} from '@/services/private/user/employees';
import { getBusinessSubscription } from '@/services/private/business/subscription';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import EmployeeWellnessDashboard from '../EmployeeWellnessDashboard';
import Button from '@/components/common/Button';
import { FiPlus, FiUsers, FiActivity, FiUpload } from 'react-icons/fi';
import useModal from '@/hooks/useModal';
import FileSelectorForm from '@/components/common/form/FileSelectorForm';

const EmployeeManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeView, setActiveView] = useState('employees'); // 'employees' or 'wellness'
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [csvUploadResults, setCsvUploadResults] = useState(null);
  const [showCsvResults, setShowCsvResults] = useState(false);
  const queryClient = useQueryClient();
  const { render: modal } = useModal();

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

  // CSV Upload handler using modal popup
  const handleCSVUpload = async () => {
    try {
      // Show modal popup for file selection
      const selectedFile = await new Promise(async (resolve) => {
        await modal({
          heading: 'Upload Employees CSV',
          size: 'md',
          content: (
            <div className="space-y-6">
              {/* Instructions Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements</h4>
                    <div className="space-y-1 text-xs text-blue-800">
                      <p><span className="font-semibold">Required columns:</span> email, first_name, mobile_number, employee_id, password</p>
                      <p><span className="font-semibold">Optional columns:</span> last_name</p>
                      <p className="mt-2 text-blue-700">Password must be at least 6 characters long</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample CSV Download */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Need a sample file?</span>
                </div>
                <button
                  onClick={() => {
                    // Create sample CSV content
                    const sampleCSV = `email,first_name,last_name,mobile_number,employee_id,password
john.doe@example.com,John,Doe,+1234567890,EMP001,password123
jane.smith@example.com,Jane,Smith,+1234567891,EMP002,password456`;
                    const blob = new Blob([sampleCSV], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'employee_sample.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    toast.success('Sample CSV file downloaded');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Sample CSV
                </button>
              </div>

              {/* File Upload Form */}
              <FileSelectorForm
                accept={{
                  'text/csv': ['.csv'],
                }}
                validationError="Only CSV files are accepted"
                validate={value => value && (value.type.includes('csv') || value.name.endsWith('.csv'))}
                onSubmit={resolve}
                maxSize={5 * 1024 * 1024} // 5MB
              />
            </div>
          ),
        });
      });

      if (!selectedFile) return;

      setUploadingCSV(true);
      setCsvUploadResults(null);
      setShowCsvResults(false);

      const response = await uploadEmployeesCSV(selectedFile);
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setCsvUploadResults(data);
        setShowCsvResults(true);
        
        // Invalidate employees query to refresh the list
        queryClient.invalidateQueries([queryKeys.employees]);
        
        // Show success message
        if (data.success_count > 0) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } else {
        toast.error(response.data.message || 'Failed to upload CSV file');
      }
    } catch (error) {
      // User cancelled the modal or error occurred
      console.error('CSV upload error:', error);
      if (error?.response) {
        const errorMessage = error.response?.data?.message || 'Failed to upload CSV file. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setUploadingCSV(false);
    }
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
          <div className="flex items-center space-x-4">
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveView('employees')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'employees'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiUsers className="h-4 w-4" />
                Employees
              </button>
              <button
                onClick={() => setActiveView('wellness')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'wellness'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiActivity className="h-4 w-4" />
                Wellness
              </button>
            </div>
            
            {activeView === 'employees' && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCSVUpload}
                  disabled={uploadingCSV || !canAddEmployee}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    (uploadingCSV || !canAddEmployee)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  size="lg"
                >
                  {uploadingCSV ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className="h-5 w-5" />
                      Upload CSV
                    </>
                  )}
                </Button>
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
            )}
          </div>
        </div>
      </div>

      {/* CSV Upload Results Modal */}
      {showCsvResults && csvUploadResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">CSV Upload Results</h3>
                <button
                  onClick={() => setShowCsvResults(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Total Rows</div>
                  <div className="text-2xl font-bold text-blue-900">{csvUploadResults.total_rows}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Success</div>
                  <div className="text-2xl font-bold text-green-900">{csvUploadResults.success_count}</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-sm text-red-600 font-medium mb-1">Failed</div>
                  <div className="text-2xl font-bold text-red-900">{csvUploadResults.failed_count}</div>
                </div>
              </div>

              {/* Failed Records */}
              {csvUploadResults.failed && csvUploadResults.failed.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Failed Records</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvUploadResults.failed.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-600">{item.row}</td>
                            <td className="px-4 py-2 text-gray-600">{item.email}</td>
                            <td className="px-4 py-2 text-red-600">{item.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success Records */}
              {csvUploadResults.success && csvUploadResults.success.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Successfully Created</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvUploadResults.success.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-600">{item.row}</td>
                            <td className="px-4 py-2 text-gray-600">{item.email}</td>
                            <td className="px-4 py-2 text-green-600 font-medium">✓ Created</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CSV Format Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">CSV Format</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Required columns: <span className="font-semibold">email</span>, <span className="font-semibold">first_name</span>, <span className="font-semibold">mobile_number</span>, <span className="font-semibold">employee_id</span>, <span className="font-semibold">password</span>
                </p>
                <p className="text-sm text-gray-600">
                  Optional columns: <span className="font-semibold">last_name</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least 6 characters long.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowCsvResults(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Content based on active view */}
      {activeView === 'employees' ? (
        <>
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
        </>
      ) : (
        /* Wellness Dashboard */
        <EmployeeWellnessDashboard />
      )}
    </div>
  );
};

export default EmployeeManagement;
