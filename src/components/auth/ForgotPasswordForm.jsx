'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { FiMail } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { forgotPassword } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const ForgotPasswordForm = () => {
  const { mutateAsync } = useMutation({
    mutationFn: forgotPassword,
  });

  const initialValues = {
    email: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().trim()
    .lowercase()
    .email('Please enter a valid email address')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email must be in the format user@example.com'
    )
    .required('Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await mutateAsync({ payload: values });
      toast.success('Reset password link sent successfully');
      resetForm();
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
          {/* Email Field */}
          <div className="space-y-2">
            <FormikField 
              type="email" 
              name="email" 
              label="Email Address" 
              placeholder="Enter your email" 
              Icon={FiMail} 
              required 
            />
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-semibold">💡 Tip:</span> If you don&apos;t receive the email in 10 seconds, please check your spam folder.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="5xl" 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
            isLoading={isSubmitting}
          >
            <div className="flex items-center justify-center gap-2">
              <span>📧</span>
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Password Link'}</span>
            </div>
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ForgotPasswordForm;
