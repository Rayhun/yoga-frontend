'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiUser } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import Button from '@/components/common/Button';
import OnboardingJoinFlowLayout from './OnboardingJoinFlowLayout';

export default function OnboardingJoinDetailsStep({
  content,
  initialValues,
  onContinue,
  onBack,
  canGoBack = false,
}) {
  const page = content?.page_1 || {};
  const fullNameField = page.fields?.full_name || {};
  const emailField = page.fields?.email || {};
  const footer = page.footer_microcopy || {};

  const validationSchema = Yup.object({
    full_name: Yup.string()
      .trim()
      .min(2, fullNameField.error_text || 'Please enter your name.')
      .required(fullNameField.error_text || 'Please enter your name.'),
    email: Yup.string()
      .trim()
      .lowercase()
      .email(emailField.error_text || 'Please enter a valid email address.')
      .required(emailField.error_text || 'Please enter a valid email address.'),
  });

  return (
    <OnboardingJoinFlowLayout step={1} stepLabel={page.progress_label}>
      <h1 className="font-serif text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-[1.65rem]">
        {page.headline}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {page.subhead}
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onContinue}
      >
        {({ isSubmitting }) => (
          <Form className="mt-6 flex flex-col gap-4">
            <FormikField
              name="full_name"
              label={fullNameField.label}
              placeholder={fullNameField.placeholder}
              Icon={FiUser}
              required
            />
            <FormikEmailField
              name="email"
              label={emailField.label}
              placeholder={emailField.placeholder}
              Icon={FiMail}
              required
            />

            <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
              {page.button}
            </Button>

            {canGoBack ? (
              <button
                type="button"
                onClick={onBack}
                className="text-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← {page.back_link}
              </button>
            ) : null}
          </Form>
        )}
      </Formik>

      {footer.prefix ? (
        <p className="mt-6 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {footer.prefix}{' '}
          <a
            href={footer.terms_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            {footer.terms_label}
          </a>{' '}
          {footer.conjunction}{' '}
          <a
            href={footer.privacy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            {footer.privacy_label}
          </a>
          . {footer.suffix}
        </p>
      ) : null}
    </OnboardingJoinFlowLayout>
  );
}
