'use client';
import Link from 'next/link';
import FormikCheckbox from './FormikCheckbox';

// Same links and card styling as the Sign Up form's terms checkbox (components/auth/SignupForm.jsx).
const TERMS_URL = 'https://www.nourishdoc.com/terms';
const PRIVACY_URL = 'https://www.nourishdoc.com/privacy-policy';
const LINK_CLASS = 'text-green-600 hover:text-green-700 font-medium transition-colors duration-200';

const FormikTermsAgreement = ({ name }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
    <FormikCheckbox
      name={name}
      label={
        <p className="text-xs text-gray-600 leading-relaxed">
          By checking this box, I understand and agree to the{' '}
          <Link href={TERMS_URL} target="_blank" className={LINK_CLASS}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={PRIVACY_URL} target="_blank" className={LINK_CLASS}>
            Privacy Policy
          </Link>
          .
        </p>
      }
    />
  </div>
);

export default FormikTermsAgreement;
