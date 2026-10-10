'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiLock, FiUser, FiGlobe, FiHash } from 'react-icons/fi';
import useConfirm from '@/hooks/useConfirm';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import FormikTermsAgreement from '@/components/common/form/formik/FormikTermsAgreement';
import FormikCountrySelect from '@/components/common/form/formik/FormikCountrySelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import Button from '@/components/common/Button';
import BuilderStepper from '@/components/certification/builder/BuilderStepper';
import { toastApiError } from '@/utils/helpers';
import { applyAsInstitution, uploadCertificationFile } from '@/services/private/certification/application';

// The application is shown in four short sections (never more than six inputs each). The whole form
// is still ONE Formik instance — a section only decides which fields render — so values, validation
// and the submit payload never depend on the section shown. `fields` are the Formik field names a
// section owns: "Next" validates just those, and a failed submit jumps to the first section with an error.
// Nothing is sent to the server, or kept in browser storage, before the final submit: the form holds a
// password and a document.
export const INSTITUTION_SECTIONS = [
  {
    id: 'account',
    title: 'Account',
    fields: ['first_name', 'last_name', 'email', 'password', 'confirm_password'],
  },
  {
    id: 'organization',
    title: 'Organization',
    fields: ['legal_organization_name', 'country', 'timezone', 'registration_number', 'tax_id'],
  },
  {
    id: 'contact',
    title: 'Contact & experience',
    shortTitle: 'Contact',
    fields: ['website', 'contact_person', 'authorized_signer', 'teaching_experience_years', 'prior_student_count'],
  },
  {
    id: 'application',
    title: 'Application',
    fields: ['sample_curriculum', 'sample_lecture_link', 'incorporation_document', 'terms'],
  },
];
const LAST_SECTION = INSTITUTION_SECTIONS.length - 1;
const ALL_SECTION_INDEXES = INSTITUTION_SECTIONS.map((_, index) => index);
const PANEL_ID_PREFIX = 'institution-apply-section';
const STEPPER_STEPS = INSTITUTION_SECTIONS.map((section, index) => ({
  id: index,
  label: section.shortTitle || section.title,
  panelId: `${PANEL_ID_PREFIX}-${index}`,
}));

const SECTION_OF_FIELD = Object.fromEntries(
  INSTITUTION_SECTIONS.flatMap((section, index) => section.fields.map(field => [field, index]))
);

// Server field names that differ from the form's (the API calls the terms checkbox `agreement_accepted`).
const SERVER_FIELD_ALIASES = { agreement_accepted: 'terms' };

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const toMessage = value => (Array.isArray(value) ? value.join(' ') : String(value));

// Maps a rejected submit to `{ formField: message }`. A 400 from the serializers is `{ field: [msg] }`
// (user fields may be nested under `profile` / `institution`); the email-already-registered check
// answers `{ message }` only, and every one of those messages names the email address.
export const extractServerFieldErrors = error => {
  const data = error?.response?.status === 400 ? error.response.data : null;
  if (!isPlainObject(data)) return {};

  const flat = {};
  Object.entries(data).forEach(([key, value]) => {
    if ((key === 'profile' || key === 'institution') && isPlainObject(value)) Object.assign(flat, value);
    else flat[key] = value;
  });

  const fieldErrors = {};
  Object.entries(flat).forEach(([key, value]) => {
    const field = SERVER_FIELD_ALIASES[key] || key;
    if (field in SECTION_OF_FIELD && value) fieldErrors[field] = toMessage(value);
  });

  if (Object.keys(fieldErrors).length === 0 && typeof data.message === 'string' && /\bemail\b/i.test(data.message)) {
    fieldErrors.email = data.message;
  }
  return fieldErrors;
};

const firstSectionWithError = (errors, sectionIndexes) =>
  sectionIndexes.find(index => INSTITUTION_SECTIONS[index].fields.some(field => errors[field]));

const touchedFor = fields => Object.fromEntries(fields.map(field => [field, true]));

// Browser "leave this page?" prompt while the form holds unsent input.
const LeaveWarning = ({ active }) => {
  useEffect(() => {
    if (!active) return undefined;
    const handler = event => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
  return null;
};

const AccountSection = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField name="first_name" label="First Name" placeholder="First Name" Icon={FiUser} required />
      <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} />
    </div>
    <FormikEmailField name="email" label="Email" placeholder="Email" required />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField type="password" name="password" label="Password" placeholder="Password" Icon={FiLock} required />
      <FormikField type="password" name="confirm_password" label="Confirm Password" placeholder="Confirm Password" Icon={FiLock} required />
    </div>
  </>
);

const OrganizationSection = () => (
  <>
    <FormikField name="legal_organization_name" label="Legal Organization Name" placeholder="Legal Organization Name" Icon={FiUser} required />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikCountrySelect name="country" label="Country" placeholder="Select Country" required />
      <FormikField name="timezone" label="Timezone" placeholder="e.g. America/New_York" Icon={FiGlobe} required />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField name="registration_number" label="Registration Number" placeholder="Registration Number" Icon={FiHash} required />
      <FormikField name="tax_id" label="Tax ID" placeholder="Tax ID" Icon={FiHash} required />
    </div>
  </>
);

const ContactSection = () => (
  <>
    <FormikField name="website" label="Website" placeholder="https://" Icon={FiGlobe} required />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField name="contact_person" label="Contact Person" placeholder="Contact Person" Icon={FiUser} required />
      <FormikField name="authorized_signer" label="Authorized Signer" placeholder="Authorized Signer" Icon={FiUser} required />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormikField type="number" name="teaching_experience_years" label="Teaching Experience (years)" placeholder="0" required />
      <FormikField type="number" name="prior_student_count" label="Prior Student Count" placeholder="0" required />
    </div>
  </>
);

const ApplicationSection = () => (
  <>
    <FormikField name="sample_curriculum" label="Sample Curriculum (link)" placeholder="https://" Icon={FiGlobe} required />
    <FormikField name="sample_lecture_link" label="Sample Lecture (link, any platform)" placeholder="https://" Icon={FiGlobe} required />

    <FormikDropzone
      name="incorporation_document"
      label="Incorporation Document"
      required
      accept={{ 'application/pdf': [], 'image/png': [], 'image/jpeg': [] }}
      supportedFilesText="pdf, jpg, jpeg and png files are supported."
    />

    <FormikTermsAgreement name="terms" />
  </>
);

const SECTION_COMPONENTS = [AccountSection, OrganizationSection, ContactSection, ApplicationSection];

const InstitutionApplyForm = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const [isUploading, setIsUploading] = useState(false);
  const [section, setSection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formikRef = useRef(null);
  const { mutateAsync } = useMutation({ mutationFn: applyAsInstitution });

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    legal_organization_name: '',
    country: '',
    timezone: '',
    registration_number: '',
    website: '',
    contact_person: '',
    authorized_signer: '',
    tax_id: '',
    teaching_experience_years: '',
    sample_curriculum: '',
    sample_lecture_link: '',
    prior_student_count: '',
    incorporation_document: null,
    terms: false,
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().min(2, 'Must contain at least 2 characters').required('Required!'),
    last_name: Yup.string(),
    email: Yup.string().trim().lowercase().email('Please enter a valid email').required('Email is required'),
    password: Yup.string()
      .min(12, 'Password must be at least 12 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .required('Required!'),
    confirm_password: Yup.string()
      .required('Required!')
      .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
    legal_organization_name: Yup.string().required('Required!'),
    country: Yup.string().required('Required!'),
    timezone: Yup.string().required('Required!'),
    registration_number: Yup.string().required('Required!'),
    website: Yup.string().url('Must be a valid URL').required('Required!'),
    contact_person: Yup.string().required('Required!'),
    authorized_signer: Yup.string().required('Required!'),
    tax_id: Yup.string().required('Required!'),
    teaching_experience_years: Yup.number().min(0).required('Required!'),
    sample_curriculum: Yup.string().url('Must be a valid URL').required('Required!'),
    sample_lecture_link: Yup.string().url('Must be a valid URL').required('Required!'),
    prior_student_count: Yup.number().min(0).required('Required!'),
    incorporation_document: Yup.mixed().required('Incorporation document is required'),
    terms: Yup.bool().isTrue('Please accept the creator agreement to proceed'),
  });

  // Shows a rejected field in the section that owns it and moves there.
  const showServerFieldErrors = (fieldErrors, { setFieldError, setFieldTouched }) => {
    const fields = Object.keys(fieldErrors);
    if (fields.length === 0) return;
    fields.forEach(field => {
      setFieldTouched(field, true, false);
      setFieldError(field, fieldErrors[field]);
    });
    setSection(Math.min(...fields.map(field => SECTION_OF_FIELD[field])));
  };

  const handleSubmit = async (values, helpers) => {
    const { setSubmitting } = helpers;
    try {
      await confirm({
        message: 'One Time Password (OTP) will be sent to your entered email to verify your account. Continue?',
      });

      setIsUploading(true);
      const { data: uploadedFile } = await uploadCertificationFile({ file: values.incorporation_document });
      setIsUploading(false);

      const payload = {
        email: values.email,
        password: values.password,
        profile: {
          first_name: values.first_name,
          last_name: values.last_name,
        },
        institution: {
          legal_organization_name: values.legal_organization_name,
          country: values.country,
          timezone: values.timezone,
          registration_number: values.registration_number,
          website: values.website,
          contact_person: values.contact_person,
          authorized_signer: values.authorized_signer,
          tax_id: values.tax_id,
          teaching_experience_years: values.teaching_experience_years,
          sample_curriculum: values.sample_curriculum,
          sample_lecture_link: values.sample_lecture_link,
          prior_student_count: values.prior_student_count,
          incorporation_document: uploadedFile?.file_key,
          agreement_accepted: values.terms,
        },
      };

      await mutateAsync({ payload });
      setIsSubmitted(true);
      toast.success('Application submitted — check your email to verify your account');
      router.push('/certification/apply-institution/pending');
    } catch (error) {
      if (error?.response) {
        toastApiError(error);
        showServerFieldErrors(extractServerFieldErrors(error), helpers);
      } else if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
      // else: user cancelled the confirm dialog — no toast
    } finally {
      setIsUploading(false);
      setSubmitting(false);
    }
  };

  // Moving forward checks every section from here up to the target and stops at the first one with an
  // error (shown there); moving back is never blocked.
  const goToSection = useCallback(
    async target => {
      const formik = formikRef.current;
      if (!formik || target === section) return;
      if (target < section) {
        setSection(target);
        return;
      }
      const errors = await formik.validateForm();
      const blocked = firstSectionWithError(
        errors,
        ALL_SECTION_INDEXES.filter(index => index >= section && index < target)
      );
      if (blocked !== undefined) {
        formik.setTouched({ ...formik.touched, ...touchedFor(INSTITUTION_SECTIONS[blocked].fields) }, false);
        setSection(blocked);
        return;
      }
      setSection(target);
    },
    [section]
  );

  // The last section's button: check the whole form first, jumping to the first section with an error.
  const submitApplication = useCallback(async () => {
    const formik = formikRef.current;
    if (!formik) return;
    const errors = await formik.validateForm();
    const failing = firstSectionWithError(errors, ALL_SECTION_INDEXES);
    if (failing !== undefined) {
      formik.setTouched(touchedFor(INSTITUTION_SECTIONS.flatMap(item => item.fields)), false);
      setSection(failing);
      return;
    }
    await formik.submitForm();
  }, []);

  const SectionFields = SECTION_COMPONENTS[section];
  const current = INSTITUTION_SECTIONS[section];

  return (
    <Formik
      innerRef={formikRef}
      validateOnChange={false}
      validateOnBlur
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, dirty }) => (
        // Enter in a text input would otherwise submit the form (or skip ahead); only the buttons move on.
        <Form className="flex flex-col gap-3" onSubmit={event => event.preventDefault()}>
          <LeaveWarning active={dirty && !isSubmitted} />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-600" aria-live="polite">
              Step {section + 1} of {INSTITUTION_SECTIONS.length} · {current.title}
            </p>
            <div className="hidden sm:block">
              <BuilderStepper
                steps={STEPPER_STEPS}
                currentStep={section}
                onSelect={goToSection}
                ariaLabel="Application sections"
                itemLabel="Section"
              />
            </div>
          </div>

          <div
            role="tabpanel"
            id={STEPPER_STEPS[section].panelId}
            aria-labelledby={`${STEPPER_STEPS[section].panelId}-tab`}
            className="flex flex-col gap-3"
          >
            <SectionFields />
          </div>

          <div className="flex items-center gap-3">
            {section > 0 ? (
              <Button type="button" variant="secondary" disabled={isSubmitting || isUploading} onClick={() => goToSection(section - 1)}>
                ← Back
              </Button>
            ) : null}
            {section === LAST_SECTION ? (
              <Button type="button" onClick={submitApplication} disabled={isSubmitting || isUploading} isLoading={isSubmitting || isUploading}>
                {isUploading ? 'Uploading document…' : 'Apply as Institution'}
              </Button>
            ) : (
              <Button type="button" onClick={() => goToSection(section + 1)}>
                Next →
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InstitutionApplyForm;
