'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { resetPassword } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync } = useMutation({
    mutationFn: resetPassword,
  });

  const initialValues = {
    password: '',
    confirm_password: '',
  };

  const validationSchema = Yup.object({
    password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required'),
    confirm_password: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { password } = values;

      const uidb64 = searchParams.get('uidb64');
      const token = searchParams.get('token');

      if (!uidb64 || !token) {
        toast.error('Invalid reset link. Please request a new password reset link.');
        router.replace('/auth/forgot-password');
        return;
      }

      const payload = { password, uidb64, token };

      await mutateAsync({ payload: payload });
      toast.success('Password updated successfully! Redirecting to login...');
      
      resetForm();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace('/auth/login');
      }, 1500);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <FormikField
              type="password"
              name="password"
              label="New Password"
              placeholder="Enter your new password"
              Icon={FiLock}
              required
            />
            <p className="text-xs text-gray-500 pl-2">
              Must be at least 12 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <FormikField
              type="password"
              name="confirm_password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              Icon={FiLock}
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="5xl" 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
            isLoading={isSubmitting}
          >
            <div className="flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password'}</span>
            </div>
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
