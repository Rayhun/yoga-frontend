'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiUser } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import Button from '@/components/common/Button';

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .email('Please enter a valid email')
    .required('Email is required'),
  first_name: Yup.string().min(2, 'Must be at least 2 characters').required('First name is required'),
  last_name: Yup.string(),
});

export default function PublicOnboardingSignupForm({ onSubmit, isSubmitting = false }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Almost there
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We&apos;ll save your quiz answers and home coach choice to your new profile.
          </p>
        </div>

        <Formik
          initialValues={{ email: '', first_name: '', last_name: '' }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting: formSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <FormikEmailField
                name="email"
                label="Email"
                placeholder="you@example.com"
                Icon={FiMail}
                required
              />
              <FormikField
                name="first_name"
                label="First name"
                placeholder="Your first name"
                Icon={FiUser}
                required
              />
              <FormikField
                name="last_name"
                label="Last name"
                placeholder="Your last name (optional)"
                Icon={FiUser}
              />
              <Button
                type="submit"
                className="mt-2 w-full"
                isLoading={isSubmitting || formSubmitting}
              >
                Complete signup
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
