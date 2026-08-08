'use client';
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiMail, FiLock, FiUser, FiGlobe, FiHash } from 'react-icons/fi';
import useConfirm from '@/hooks/useConfirm';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikEmailField from '@/components/common/form/formik/FormikEmailField';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import FormikCountrySelect from '@/components/common/form/formik/FormikCountrySelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import Button from '@/components/common/Button';
import { toastApiError } from '@/utils/helpers';
import { applyAsInstitution, uploadCertificationFile } from '@/services/private/certification/application';

const InstitutionApplyForm = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const [isUploading, setIsUploading] = useState(false);
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

  const handleSubmit = async (values, { setSubmitting }) => {
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
      toast.success('Application submitted — check your email to verify your account');
      router.push('/certification/apply-institution/pending');
    } catch (error) {
      if (error?.response) {
        toastApiError(error);
      } else if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
      // else: user cancelled the confirm dialog — no toast
    } finally {
      setIsUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField name="first_name" label="First Name" placeholder="First Name" Icon={FiUser} required />
            <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} />
          </div>
          <FormikEmailField name="email" label="Email" placeholder="Email" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField type="password" name="password" label="Password" placeholder="Password" Icon={FiLock} required />
            <FormikField type="password" name="confirm_password" label="Confirm Password" placeholder="Confirm Password" Icon={FiLock} required />
          </div>

          <hr className="my-2" />

          <FormikField name="legal_organization_name" label="Legal Organization Name" placeholder="Legal Organization Name" Icon={FiUser} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikCountrySelect name="country" label="Country" placeholder="Select Country" required />
            <FormikField name="timezone" label="Timezone" placeholder="e.g. America/New_York" Icon={FiGlobe} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField name="registration_number" label="Registration Number" placeholder="Registration Number" Icon={FiHash} required />
            <FormikField name="tax_id" label="Tax ID" placeholder="Tax ID" Icon={FiHash} required />
          </div>
          <FormikField name="website" label="Website" placeholder="https://" Icon={FiGlobe} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField name="contact_person" label="Contact Person" placeholder="Contact Person" Icon={FiUser} required />
            <FormikField name="authorized_signer" label="Authorized Signer" placeholder="Authorized Signer" Icon={FiUser} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField type="number" name="teaching_experience_years" label="Teaching Experience (years)" placeholder="0" required />
            <FormikField type="number" name="prior_student_count" label="Prior Student Count" placeholder="0" required />
          </div>
          <FormikField name="sample_curriculum" label="Sample Curriculum (link)" placeholder="https://" Icon={FiGlobe} required />
          <FormikField name="sample_lecture_link" label="Sample Lecture (link, any platform)" placeholder="https://" Icon={FiGlobe} required />

          <FormikDropzone
            name="incorporation_document"
            label="Incorporation Document"
            required
            accept={{ 'application/pdf': [], 'image/png': [], 'image/jpeg': [] }}
            supportedFilesText="pdf, jpg, jpeg and png files are supported."
          />

          <FormikCheckbox name="terms" label="I accept the creator agreement" />

          <Button type="submit" disabled={isSubmitting || isUploading} isLoading={isSubmitting || isUploading}>
            {isUploading ? 'Uploading document…' : 'Apply as Institution'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default InstitutionApplyForm;
