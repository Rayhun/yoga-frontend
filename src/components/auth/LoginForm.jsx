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
            // Store email and phone in sessionStorage for security (not in URL)
            sessionStorage.setItem('pendingVerificationEmail', userDetails?.email);
            sessionStorage.setItem('pendingVerificationPhone', mobile_number);
            router.replace(`/auth/verify-account?step=${email_verify ? 'phone' : 'email'}`);
          } else {
            Cookies.set('token', response?.data?.token);
            router.replace('/portal/teacher/profile?active_tab=about');
          }
        } else if (role?.toLowerCase() === 'affiliate') {
          Cookies.set('token', response?.data?.token);
          router.replace('/portal/affiliate/dashboard');
        } else if (on_boarding_quiz) {
          Cookies.set('token', response?.data?.token);
          
          // Check if user is a business owner and redirect to business dashboard
          const userProfile = userDetails?.profile;
          if (userProfile?.profile_type === 'Business' && !userProfile?.business_owner) {
            router.replace('/portal/business/dashboard');
          } else {
            // Fetch onboarding recommendations after successful login for individual users
            try {
              await getOnboardingRecommendations();
            } catch (error) {
              console.error('Failed to fetch recommendations:', error);
            }
            router.replace('/');
          }
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
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <FormikField 
              type="email" 
              name="email" 
              label="Email" 
              placeholder="Enter your email" 
              Icon={FiMail} 
              required 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <FormikField
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              Icon={FiLock}
              required
            />
            <div className="flex justify-end">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              By logging in to your account, you are agreeing to the{' '}
              <Link 
                href="https://www.nourishdoc.com/terms" 
                target="_blank" 
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link 
                href="https://www.nourishdoc.com/privacy-policy" 
                target="_blank" 
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              .
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
              <span>🔐</span>
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            </div>
          </Button>

        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
