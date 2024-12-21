'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiMail, FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/FormikField';
import Button from '@/components/common/Button';
import { loginUser } from '@/services/public/auth';
import { sleep, toastApiError } from '@/utils/helpers';
import Cookies from 'js-cookie';

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
      // await mutateAsync({ payload: values });
      await sleep(2000);
      Cookies.set('token', 'test');
      router.push('/portal');
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
