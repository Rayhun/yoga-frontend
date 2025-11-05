'use client';
import React from 'react';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiLock, FiUser } from 'react-icons/fi';
import useConfirm from '@/hooks/useConfirm';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import FormikCheckbox from '../common/form/formik/FormikCheckbox';
import Button from '@/components/common/Button';
import { registerNewUser } from '@/services/public/auth';
import { extractFormFieldError, toastApiError } from '@/utils/helpers';
import FormikPhoneFieldWithValidation from '@/components/common/form/formik/FormikPhoneFieldWithValidation';
import SignupStepper from '../common/SignupStepper';

const SignupForm = () => {
  const router = useRouter();
  const confirm = useConfirm();
  
  const { mutateAsync } = useMutation({
    mutationFn: registerNewUser,
  });

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    terms: false,
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().min(3, 'Must contain at least 3 characters').required('Required!'),
    last_name: Yup.string(),
    email: Yup.string().trim()
    .lowercase()
    .email('Please enter a valid email address')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email must be in the format user@example.com'
    )
    .required('Email is required'),
    mobile_number: Yup.string()
      .min(12, 'Invalid number. Please enter a complete number or remove any special characters.')
      .matches(/^\+?[0-9]* ?[0-9]*$/, 'Mobile number should only contain digits, an optional plus at start, and at most one space')
      .required('Required!'),
    password: Yup.string()
      .min(12, 'Password must be at least 12 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .required('Required!'),
    confirm_password: Yup.string()
      .required('Required!')
      .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
    terms: Yup.bool().isTrue('Please check to the terms and conditions to proceed'),
  });

  const handleSubmit = async (values, formikBag) => {
    const { setSubmitting, setStatus, setFieldError, setTouched } = formikBag;

    // Prevent form submission until user confirms
    setSubmitting(true);

    try {
      // Show confirmation popup
      await confirm({
        heading: 'Confirm Sign Up',
        message:
          'One Time Password (OTP) will be sent to your entered email and phone number to verify your account. Are you sure you have entered your correct email and phone?',
      });

      // Only proceed if user confirmed (clicked OK)
      try {
        const { email, password, confirm_password, terms, ...rest } = values;
        const payload = {
          email,
          password,
          profile: {
            ...rest,
          },
        };

        const { data: createdUserAccount } = await mutateAsync({ payload });

        toast.success('Account created successfully and OTP sent to your email and phone');

        const userDetails = createdUserAccount?.user;
        sessionStorage.setItem('pendingVerificationToken', createdUserAccount?.token);

        router.push(
          `/auth/verify-account?email=${userDetails?.email}&phone=${userDetails?.profile?.mobile_number}&step=email`
        );
      } catch (error) {
        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message;

          let fieldName = null;

          if (
            errorMessage.toLowerCase().includes('email') ||
            errorMessage.toLowerCase().includes('expert')
          ) {
            fieldName = 'email';
          } else if (
            errorMessage.toLowerCase().includes('phone') ||
            errorMessage.toLowerCase().includes('mobile')
          ) {
            fieldName = 'mobile_number';
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
    } catch (error) {
      // User cancelled or closed the popup - prevent form submission
      console.log('User cancelled or closed the confirmation popup');
      setSubmitting(false);
      // Don't submit the form - just return
      return;
    }
  };

  return (
    <React.Fragment>
      <SignupStepper activeStep={1} />
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikField
                name="first_name"
                label="First Name"
                placeholder="First Name"
                Icon={FiUser}
                required
              />
              <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} />
            </div>
            <FormikEmailField name="email" label="Email" placeholder="Email" required />
            <FormikPhoneFieldWithValidation
              name="mobile_number"
              label="Phone"
              placeholder="Enter your phone number"
              required
            />
            <FormikField
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              Icon={FiLock}
              required
            />
            <span className="text-sm text-gray-500 pl-2">
              Min 12 characters with at least 1 uppercase/lowercase letter, number and special character
            </span>
            <FormikField
              type="password"
              name="confirm_password"
              label="Confirm Password"
              placeholder="Confirm Password"
              Icon={FiLock}
              required
            />
            <FormikCheckbox
              name="terms"
              label={
                <p>
                  By checking this box, I understand and agree to the{' '}
                  <Link href="https://www.nourishdoc.com/terms" target="_blank" className="text-primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://www.nourishdoc.com/privacy-policy"
                    target="_blank"
                    className="text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              }
              required
            />
            <Button type="submit" size="5xl" className="mt-3" isLoading={isSubmitting}>
              {isSubmitting ? 'Creating Account' : 'Sign Up'}
            </Button>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default SignupForm;
