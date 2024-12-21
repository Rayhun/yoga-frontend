'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/FormikField';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Button from '@/components/common/Button';
import { forgotPassword } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const ResetPasswordForm = () => {
  const searchParams = useSearchParamUtils();
  const { mutateAsync } = useMutation({
    mutationFn: forgotPassword,
  });

  const initialValues = {
    password: '',
    confirm_password: '',
  };

  const validationSchema = Yup.object({
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required!'),
    confirm_password: Yup.string()
      .required('Required!')
      .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { password } = values;

      const uidb64 = searchParams.get('uidb64');
      const token = searchParams.get('token');

      const payload = { password, uidb64, token };

      await mutateAsync({ payload: payload });

      setSubmitting(false);
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <FormikField
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            Icon={FiLock}
            required
          />
          <FormikField
            type="password"
            name="confirm_password"
            label="Confirm Password"
            placeholder="Confirm Password"
            Icon={FiLock}
            required
          />
          <Button type="submit" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Send Reset Password Link'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
