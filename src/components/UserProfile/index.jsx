'use client';
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import FormikImageInput from '../common/form/formik/FormikImageInput';
import FormikField from '../common/form/formik/FormikField';
import useAuthContext from '@/hooks/useAuthContext';
// import { loginUser } from '@/services/public/auth';
import * as Yup from 'yup';
import Button from '../common/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/services/private/user';
import { toastApiError } from '@/utils/helpers';
import { rest } from 'lodash';
import { toast } from 'react-toastify';
import queryKeys from '@/utils/query-keys';

const UserProfile = () => {
  const { user: loggedInUser } = useAuthContext();
  const  queryClient = useQueryClient();

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: updateUser,
  });

  const initialValues = {
    first_name: loggedInUser?.profile?.first_name || 'John',
    last_name: loggedInUser?.profile?.last_name || 'Doe',
    email: loggedInUser?.email || 'johndoe@example.com',
    circle_name: loggedInUser?.profile?.circle_name || '',
    profile_image: loggedInUser?.profile?.profile_image || '',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    circle_name: Yup.string().required('Circle name is required').max(100, 'Circle name is too long'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const {email, ...rest} = values;
      await updateProfile(rest);
      toast.success('Profile updated successfully');
      await queryClient.invalidateQueries([
        {
          queryKey: [queryKeys.loggedInUser]
        },
      ]);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8n bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => {
          return (
            <Form>
              <div className="flex justify-center items-center mb-5">
                <FormikImageInput name="profile_image" label="Profile Image" />
              </div>
              <div className="my-4">
                <div className="flex justify-between gap-4 sm:flex-row flex-col">
                  <div className="w-full flex flex-col">
                    <FormikField
                      label="First Name"
                      type="text"
                      name="first_name"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <FormikField
                      label="Last Name"
                      type="text"
                      name="last_name"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-4 sm:flex-row flex-col mt-3">
                  <div className="w-full flex flex-col">
                    <FormikField
                      label="Circle Name"
                      type="text"
                      name="circle_name"
                      placeholder="Enter circle name"
                      required
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <FormikField
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      disabled
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="2xl" isLoading={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update My Profile'}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
export default UserProfile;
