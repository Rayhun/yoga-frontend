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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await mutateAsync({ payload: values });
      toast.success('Reset password link sent successfully');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} required />
          <Button type="submit" size="5xl" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Send Reset Password Link'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ForgotPasswordForm;
