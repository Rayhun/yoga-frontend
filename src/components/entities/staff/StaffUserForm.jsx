'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { createStaffUser, updateStaffUser, getStaffUser } from '@/services/private/user/staff';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import useAuthContext from '@/hooks/useAuthContext';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';

const StaffUserForm = ({ staffUserId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const isEditMode = Boolean(staffUserId);

  // Debug: Log the staffUserId
  console.log('StaffUserForm - staffUserId received:', staffUserId);
  console.log('StaffUserForm - isEditMode:', isEditMode);

  // Fetch staff user data for edit mode
  const {
    data: staffUserResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: [queryKeys.staffUsers, staffUserId],
    queryFn: () => getStaffUser({ id: staffUserId }),
    enabled: isEditMode && !!staffUserId && staffUserId !== 'undefined',
  });

  const { mutateAsync: addStaffUser } = useMutation({
    mutationFn: createStaffUser,
  });
  const { mutateAsync: updateStaffUserMutation } = useMutation({
    mutationFn: updateStaffUser,
  });

  // Check if user is admin
  if (!user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need admin permissions to access staff management.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Current role: {user.profile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Check if staffUserId is valid for edit mode
  if (isEditMode && (!staffUserId || staffUserId === 'undefined')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Invalid Staff User ID
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The staff user ID is missing or invalid.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Staff User ID: {staffUserId}
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isEditMode && isLoading) {
    return <FullScreenLoader />;
  }

  if (isEditMode && isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Staff User
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.response?.status === 401 
              ? 'You are not authorized to edit this staff user. Please check your permissions.'
              : error?.response?.status === 404
              ? 'Staff user not found.'
              : 'An error occurred while loading the staff user details.'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Error: {error?.response?.status} - {error?.message}
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const selected = staffUserResponse?.data?.data;

  // Debug: Log the selected data for edit mode
  if (isEditMode && selected) {
    console.log('Edit mode - Selected staff user data:', selected);
  }

  const roleOptions = [
    { value: 'Staff', label: 'Staff' },
  ];

  const initialValues = {
    first_name: selected?.first_name || '',
    last_name: selected?.last_name || '',
    email: selected?.email || '',
    mobile_number: selected?.mobile_number || '',
    password: '',
    confirm_password: '',
    role: selected?.role || 'Staff',
    is_active: selected?.is_active ?? true,
  };

  // Debug: Log initial values
  if (isEditMode) {
    console.log('Edit mode - Initial form values:', initialValues);
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile_number: Yup.string(),
    password: isEditMode 
      ? Yup.string().min(8, 'Password must be at least 8 characters')
      : Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirm_password: isEditMode
      ? Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
      : Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
    role: Yup.string().required('Role is required'),
    is_active: Yup.bool(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirm_password, ...submitValues } = values;
      
      // Debug: Log submit values
      console.log('Form submit values:', submitValues);
      console.log('Is edit mode:', isEditMode);
      console.log('Staff user ID:', staffUserId);
      
      if (isEditMode) {
        await updateStaffUserMutation({ 
          id: staffUserId, 
          payload: submitValues 
        });
        toast.success('Staff user updated successfully');
      } else {
        await addStaffUser({ payload: submitValues });
        toast.success('Staff user created successfully');
      }
      
      await queryClient.invalidateQueries([queryKeys.staffUsers]);
      router.push('/portal/admin/staff');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <FormLayoutWrapper title={isEditMode ? 'Edit Staff User' : 'Add Staff User'}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="first_name" 
                  label="First Name" 
                  placeholder="Enter first name" 
                  Icon={FiUser}
                  required 
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="last_name" 
                  label="Last Name" 
                  placeholder="Enter last name" 
                  Icon={FiUser}
                  required 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="email" 
                  label="Email" 
                  type="email"
                  placeholder="Enter email" 
                  Icon={FiMail}
                  required 
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="mobile_number" 
                  label="Mobile Number" 
                  placeholder="Enter mobile number" 
                  Icon={FiPhone}
                />
              </div>
            </div>

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikSelect 
                  name="role" 
                  label="Role" 
                  options={roleOptions}
                  required 
                />
              </div>
              <div className="w-full xl:w-1/2">
                {/* Empty div for spacing */}
              </div>
            </div>

            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="password" 
                  label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                  type="password"
                  placeholder="Enter password" 
                  required={!isEditMode}
                />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField 
                  name="confirm_password" 
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password" 
                  required={!isEditMode}
                />
              </div>
            </div>

            <FormikCheckbox name="is_active" label="Active" />

            <div className="flex gap-3">
              <Button type="submit" size="2xl" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update' : 'Create')}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="2xl" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default StaffUserForm;
