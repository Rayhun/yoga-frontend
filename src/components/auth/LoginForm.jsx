'use client';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { FiMail, FiLock } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
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
        if (response?.data?.user?.profile?.role?.toLowerCase() === 'teacher')
          router.replace('/portal/teacher/profile');
        else if (response?.data?.user?.profile?.on_boarding_quiz) router.replace('/');
        else router.replace('/onboarding');
      }
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
          <div className="flex flex-col gap-1">
            <FormikField
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              Icon={FiLock}
              required
            />
            <Link href="/auth/forgot-password" className="text-primary text-right">
              Forgot Password?
            </Link>
          </div>
          <p className="text-sm">
            By logging in to your account, you are agreeing to the{' '}
            <Link href="https://www.nourishdoc.com/terms" target="_blank" className="text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="https://www.nourishdoc.com/privacy-policy" target="_blank" className="text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          <Button type="submit" size="5xl" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Sigining In...' : 'Sign In'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
