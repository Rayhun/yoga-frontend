'use client';
import React from 'react';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import useConfirm from '@/hooks/useConfirm';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikCheckbox from '../common/form/formik/FormikCheckbox';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import SignupStepper from '../common/SignupStepper';
import { registerNewAffiliateUser } from '@/services/private/affiliates/users';
import FormikSubmittable from '../common/form/formik/FormikSubmittable';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import FormikCountrySelect from '../common/form/formik/FormikCountrySelect';
import FormikSelect from '../common/form/formik/FormikSelect';
import { BUSINESS_MODELS } from '@/utils/constants';

const AffiliatesSignupForm = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { mutateAsync } = useMutation({
    mutationFn: registerNewAffiliateUser,
  });

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    paypal_email: '',
    password: '',
    confirm_password: '',
    channels: [],
    terms: false,
    business_model: '',
    country: '',
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
    paypal_email: Yup.string().trim()
    .lowercase()
    .email('Please enter a valid PayPal email address')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email must be in the format user@example.com'
    )
    .required('PayPal Email is required'),
    business_model: Yup.string().min(3, 'Must contain at least 3 characters').required('Required!'),
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
    channels: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 credential is required')
      .max(5, 'Maximum 5 credentials are allowed'),
    country: Yup.string().required('Required!'),
  });

  const handleSubmit = async (values, formikBag) => {
    const { setSubmitting, setStatus, setFieldError, setTouched } = formikBag;

    try {
      await confirm({
        message:
          'One Time Password (OTP) will be sent to your entered email to verify your account. Are you sure you have entered your correct email?',
      }).then(async () => {
        try {
          const { email, password, confirm_password, first_name, last_name, channels, terms, ...rest } =
            values;

          const payload = {
            email,
            password,
            profile: {
              first_name,
              last_name,
            },
            affiliate: {
              ...rest,
              channels: channels.map(channel => channel.trim()).filter(channel => channel),
              agreement: terms,
            },
          };

          const { data: createdUserAccount } = await mutateAsync({ payload });

          toast.success('Account created successfully and OTP sent to your email');

          const userDetails = createdUserAccount?.user;
          sessionStorage.setItem('pendingVerificationToken', createdUserAccount?.token);

          router.push(`/auth/verify-affiliates-account?email=${userDetails?.email}`);
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
      });
    } catch (error) {
      console.log('User cancelled the confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [{ label: 'Sign Up' }, { label: 'Verify Email' }];

  return (
    <React.Fragment>
      <SignupStepper activeStep={1} formSteps={steps} />
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
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
            <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} required />
            <FormikField
              type="email"
              name="paypal_email"
              label="Paypal Email"
              placeholder="Email"
              Icon={FiMail}
              required
            />
            <FormikSubmittable
              name="channels"
              label="Channels"
              placeholder="Where will you share your affiliate link? (e.g., Instagram, TikTok, YouTube, Podcast, Blog, etc.)"
              required
              disabled={values?.channels?.length >= 5}
            />
            <FormikSelect
              name="business_model"
              label="Business Model"
              placeholder="Business Model"
              options={BUSINESS_MODELS}
              required
            />
            <FormikCountrySelect name="country" label="Country" required />

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
                  By checking this box, I agree to the{' '}
                  <Link href="https://www.nourishdoc.com/affiliate-terms" target="_blank" className="text-primary">
                    Affiliate Terms & Conditions
                  </Link>{' '}
                    and understand that all payouts will be made via PayPal.{' '}
                  {/* <Link
                    href="https://www.nourishdoc.com/privacy-policy"
                    target="_blank"
                    className="text-primary"
                  >
                    Privacy Policy
                  </Link>
                  . */}
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

export default AffiliatesSignupForm;
