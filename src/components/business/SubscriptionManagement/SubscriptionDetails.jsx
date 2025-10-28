'use client';
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock,
  FiAlertTriangle,
  FiEdit3,
  FiSave,
  FiX
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';

const SubscriptionDetails = ({ subscription, onUpdateEmployeeLimit, isLoading }) => {
  const [isEditingLimit, setIsEditingLimit] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <FiAlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Subscription Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have an active business subscription.
        </p>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          icon: FiCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        };
      case 'inactive':
        return {
          icon: FiAlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
        };
      case 'pending':
        return {
          icon: FiClock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
        };
      default:
        return {
          icon: FiAlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig(subscription.status);
  const StatusIcon = statusConfig.icon;

  const currentEmployees = subscription.current_employees || 0;
  const employeeLimit = subscription.employee_limit || 10;
  const remainingSlots = employeeLimit - currentEmployees;
  const canAddEmployee = remainingSlots > 0;

  const handleUpdateLimit = async (values, { setSubmitting }) => {
    try {
      await onUpdateEmployeeLimit(parseInt(values.employee_limit));
      setIsEditingLimit(false);
    } catch (error) {
      console.error('Error updating employee limit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    employee_limit: Yup.number()
      .required('Employee limit is required')
      .min(currentEmployees, `Limit cannot be less than current employee count (${currentEmployees})`)
      .max(1000, 'Employee limit cannot exceed 1000')
      .integer('Employee limit must be a whole number'),
  });

  return (
    <div className="space-y-8">
      {/* Subscription Status Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${statusConfig.color}`}>
                {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)} Subscription
              </h3>
              <p className="text-gray-600 text-lg">
                {subscription.title || 'Business Plan'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Expires</p>
              <p className="text-xl font-bold text-gray-900">
                {subscription.expires 
                  ? new Date(subscription.expires).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Limit Management */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Employee Management
              </h3>
              <p className="text-gray-600">
                Manage your employee limit and track usage
              </p>
            </div>
          </div>
          {/* {!isEditingLimit && (
            <Button
              onClick={() => setIsEditingLimit(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FiEdit3 className="h-4 w-4" />
              Update Limit
            </Button>
          )} */}
        </div>

        {isEditingLimit ? (
          <Formik
            initialValues={{ employee_limit: employeeLimit }}
            validationSchema={validationSchema}
            onSubmit={handleUpdateLimit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <FormikField
                      label="Employee Limit"
                      name="employee_limit"
                      type="number"
                      placeholder="Enter employee limit"
                      min={currentEmployees}
                      max={1000}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current employees: {currentEmployees} | Min: {currentEmployees} | Max: 1000
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FiSave className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditingLimit(false)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FiX className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Employees */}
            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="p-3 bg-orange-500 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-2">{currentEmployees}</p>
              <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Current Employees</p>
            </div>

            {/* Employee Limit */}
            <div className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="p-3 bg-green-500 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaBuilding className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">{employeeLimit}</p>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Employee Limit</p>
            </div>

            {/* Remaining Slots */}
            <div className={`group border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
              canAddEmployee 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className={`p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                canAddEmployee ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <FiCheckCircle className="h-8 w-8 text-white" />
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                canAddEmployee ? 'text-green-600' : 'text-red-600'
              }`}>
                {remainingSlots}
              </p>
              <p className={`text-sm font-semibold uppercase tracking-wide ${
                canAddEmployee ? 'text-green-800' : 'text-red-800'
              }`}>
                Remaining Slots
              </p>
            </div>
          </div>
        )}

        {/* Usage Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Employee Usage</h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((currentEmployees / employeeLimit) * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                {currentEmployees} / {employeeLimit} employees
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-red-700">
                  Employee limit reached. Update your limit to add more employees.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FiCheckCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Subscription Details
          </h3>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Plan Title</dt>
            <dd className="text-sm font-medium text-gray-900">{subscription.title || 'N/A'}</dd>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</dt>
            <dd className="text-sm">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
              </span>
            </dd>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Created At</dt>
            <dd className="text-sm font-medium text-gray-900">
              {subscription.created_at 
                ? new Date(subscription.created_at).toLocaleDateString()
                : 'N/A'
              }
            </dd>
          </div>
          <div className="flex justify-between items-center py-3">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Updated At</dt>
            <dd className="text-sm font-medium text-gray-900">
              {subscription.updated_at 
                ? new Date(subscription.updated_at).toLocaleDateString()
                : 'N/A'
              }
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
