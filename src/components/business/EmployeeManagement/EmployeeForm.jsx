'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { FiX, FiUser, FiMail, FiPhone, FiIdCard, FiLock } from 'react-icons/fi';

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const isEditing = !!employee;

  const initialValues = {
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.user_email || '',
    mobile_number: employee?.mobile_number || '',
    employee_id: employee?.employee_id || '',
    password: '',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    last_name: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
    mobile_number: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .nullable(),
    employee_id: Yup.string()
      .required('Employee ID is required')
      .min(2, 'Employee ID must be at least 2 characters'),
    password: isEditing 
      ? Yup.string().nullable()
      : Yup.string()
          .required('Password is required')
          .min(6, 'Password must be at least 6 characters'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Remove empty password for updates
      const submitData = { ...values };
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${isEditing ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
            <FiUser className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isEditing ? 'Update employee information' : 'Fill in the details to add a new team member'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikField
                  label="First Name"
                  name="first_name"
                  type="text"
                  placeholder="Enter first name"
                  Icon={FiUser}
                  required
                />
                <FormikField
                  label="Last Name"
                  name="last_name"
                  type="text"
                  placeholder="Enter last name"
                  Icon={FiUser}
                  required
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Contact Information
              </h4>
              <div className="space-y-6">
                <FormikField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  Icon={FiMail}
                  required
                />
                <FormikField
                  label="Mobile Number"
                  name="mobile_number"
                  type="tel"
                  placeholder="Enter mobile number"
                  Icon={FiPhone}
                />
              </div>
            </div>

            {/* Employee Details Section */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Employee Details
              </h4>
              <div className="space-y-6">
                <FormikField
                  label="Employee ID"
                  name="employee_id"
                  type="text"
                  placeholder="Enter unique employee ID"
                  Icon={FiIdCard}
                  required
                />
                <FormikField
                  label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type="password"
                  placeholder={isEditing ? "Enter new password" : "Enter password"}
                  Icon={FiLock}
                  required={!isEditing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isEditing 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                } text-white shadow-lg hover:shadow-xl`}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Adding...') 
                  : (isEditing ? 'Update Employee' : 'Add Employee')
                }
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EmployeeForm;
