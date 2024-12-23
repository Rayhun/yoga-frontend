'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { FiMail, FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/FormikField';
import Button from '@/components/common/Button';
import { loginUser } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const LoginForm = () => {
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationFn: loginUser,
  });

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid Email').required('Required!'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required!'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { data: response } = await mutateAsync({ payload: values });

      if (response?.data?.token) {
        Cookies.set('token', response?.data?.token);
        router.push('/portal');
      }

      setSubmitting(false);
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} required />
          <FormikField
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            Icon={FiLock}
            required
          />
          <Button type="submit" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Sigining In...' : 'Sign In'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
