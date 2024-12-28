'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Button from '@/components/common/Button';
import { resetPassword } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const { mutateAsync } = useMutation({
    mutationFn: resetPassword,
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
      toast.success('Password updated successfully');

      router.replace('/auth/login');
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
          <Button type="submit" size="5xl" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Reset Password'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
