'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { PageHeader } from '@/components/common/page';
import Button from '@/components/common/Button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import queryKeys from '@/utils/query-keys';

const AddUserPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    role: 'Customer',
    sub_role: 'Individual',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile_number: Yup.string().required('Mobile number is required'),
    role: Yup.string().required('Role is required'),
    sub_role: Yup.string().when('role', {
      is: 'Customer',
      then: Yup.string().required('Sub role is required for customers'),
      otherwise: Yup.string(),
    }),
  });

  const { mutateAsync: createUser, isPending } = useMutation({
    mutationFn: async (userData) => {
      // This would be replaced with actual API call
      // For now, we'll simulate the API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { id: Math.random() } });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries([queryKeys.users]);
      router.push('/portal/admin/entities/users');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createUser(values);
    } catch (error) {
      // Error handling is done in mutation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add New User" />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="inline h-4 w-4 mr-1" />
                      First Name
                    </label>
                    <Field
                      name="first_name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter first name"
                    />
                    {errors.first_name && touched.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="inline h-4 w-4 mr-1" />
                      Last Name
                    </label>
                    <Field
                      name="last_name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter last name"
                    />
                    {errors.last_name && touched.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter email address"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiPhone className="inline h-4 w-4 mr-1" />
                      Mobile Number
                    </label>
                    <Field
                      name="mobile_number"
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter mobile number"
                    />
                    {errors.mobile_number && touched.mobile_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.mobile_number}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiShield className="inline h-4 w-4 mr-1" />
                      Role
                    </label>
                    <Field
                      as="select"
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                      <option value="Community">Community</option>
                      <option value="Affiliate">Affiliate</option>
                    </Field>
                    {errors.role && touched.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>

                  {/* Sub Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub Role
                    </label>
                    <Field
                      as="select"
                      name="sub_role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                    </Field>
                    {errors.sub_role && touched.sub_role && (
                      <p className="mt-1 text-sm text-red-600">{errors.sub_role}</p>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={isSubmitting || isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || isPending}
                  >
                    {isSubmitting || isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
    </div>
  );
};

export default AddUserPage;
