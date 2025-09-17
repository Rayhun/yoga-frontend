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
import { getOnboardingRecommendations } from '@/services/private/onboarding/quiz';
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

  const handleSubmit = async (values, formikBag) => {
    const { setSubmitting, setStatus, setFieldError, setTouched } = formikBag;

    try {
      const { data: response } = await mutateAsync({ payload: values });
      if (response?.data?.token) {
        const userDetails = response?.data?.user;
        const { email_verify, mobile_number_verify, on_boarding_quiz, role, mobile_number } =
          userDetails?.profile;
        if (role?.toLowerCase() === 'teacher') {
          if (!email_verify || !mobile_number_verify) {
            sessionStorage.setItem('pendingVerificationToken', response?.data?.token);
            router.replace(
              `/auth/verify-account?email_verify=${email_verify}&mobile_verify=${mobile_number_verify}&email=${
                userDetails?.email
              }&phone=${mobile_number}&step=${email_verify ? 'phone' : 'email'}`
            );
          } else {
            Cookies.set('token', response?.data?.token);
            router.replace('/portal/teacher/profile?active_tab=about');
          }
        } else if (role?.toLowerCase() === 'affiliate') {
          Cookies.set('token', response?.data?.token);
          router.replace('/portal/affiliate/dashboard');
        } else if (on_boarding_quiz) {
          Cookies.set('token', response?.data?.token);
          // Fetch onboarding recommendations after successful login
          try {
            await getOnboardingRecommendations();
          } catch (error) {
            console.error('Failed to fetch recommendations:', error);
          }
          router.replace('/');
        } else {
          Cookies.set('token', response?.data?.token);
          router.replace('/onboarding');
        }
      }
    } catch (error) {
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        let fieldName = null;

        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('expert')) {
          fieldName = 'email';
        } else if (errorMessage.toLowerCase().includes('password')) {
          fieldName = 'password';
        }

        if (fieldName) {
          setFieldError(fieldName, errorMessage);

          const touchedFields = { ...formikBag.touched, [fieldName]: true };
          setTouched(touchedFields, false);
        } else {
          setStatus({
            success: false,
            error: errorMessage,
          });
          toastApiError(error);
        }
      } else {
        const generalError = error.message || 'An error occurred during signup';
        setStatus({
          success: false,
          error: generalError,
        });
        toastApiError(error);
      }
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
