'use client';
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiUser, FiGlobe } from 'react-icons/fi';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import CertificationsField from '@/components/lms/general/fields/CertificationsField';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/loader/PageLoader';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  applyForQTE,
  getMyQTEApplication,
  uploadCertificationFile,
} from '@/services/private/certification/application';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';

const DOCUMENT_ACCEPT = { 'application/pdf': [], 'image/png': [], 'image/jpeg': [] };

const QTEApplyForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadingField, setUploadingField] = useState(null);

  const { data: application, isLoading } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
  });

  const { mutateAsync } = useMutation({ mutationFn: applyForQTE });

  if (isLoading) return <PageLoader />;

  const inFlightStatuses = ['submitted', 'under_review', 'approved'];
  if (application && inFlightStatuses.includes(application.application_status)) {
    return (
      <div className="max-w-lg">
        <ApplicationStatusCard
          applicationStatus={application.application_status}
          rejectedReason={application.rejected_reason}
        />
      </div>
    );
  }

  const initialValues = {
    legal_name: application?.legal_name || '',
    public_name: application?.public_name || '',
    linkedin: application?.linkedin || '',
    country: application?.country || '',
    timezone: application?.timezone || '',
    teaching_experience_years: application?.teaching_experience_years || '',
    sample_curriculum: application?.sample_curriculum || '',
    sample_lecture_link: application?.sample_lecture_link || '',
    prior_student_count: application?.prior_student_count || '',
    certifications: application?.certifications || [],
    government_id_file: null,
    resume_file: null,
    agreement_accepted: false,
  };

  const validationSchema = Yup.object({
    legal_name: Yup.string().required('Required!'),
    public_name: Yup.string().required('Required!'),
    linkedin: Yup.string().url('Must be a valid URL'),
    country: Yup.string().required('Required!'),
    timezone: Yup.string().required('Required!'),
    teaching_experience_years: Yup.number().min(0).required('Required!'),
    sample_curriculum: Yup.string().url('Must be a valid URL').required('Required!'),
    sample_lecture_link: Yup.string().url('Must be a valid URL').required('Required!'),
    prior_student_count: Yup.number().min(0).required('Required!'),
    government_id_file: Yup.mixed().required('Government ID is required'),
    resume_file: Yup.mixed().required('Resume is required'),
    agreement_accepted: Yup.bool().isTrue('Please accept the creator agreement to proceed'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setUploadingField('government_id_file');
      const { data: govIdUpload } = await uploadCertificationFile({ file: values.government_id_file });

      setUploadingField('resume_file');
      const { data: resumeUpload } = await uploadCertificationFile({ file: values.resume_file });
      setUploadingField(null);

      const payload = {
        legal_name: values.legal_name,
        public_name: values.public_name,
        linkedin: values.linkedin,
        country: values.country,
        timezone: values.timezone,
        teaching_experience_years: values.teaching_experience_years,
        sample_curriculum: values.sample_curriculum,
        sample_lecture_link: values.sample_lecture_link,
        prior_student_count: values.prior_student_count,
        certifications: values.certifications,
        government_id_file: govIdUpload?.file_link,
        resume_file: resumeUpload?.file_link,
        agreement_accepted: values.agreement_accepted,
      };

      await mutateAsync({ payload });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.myQTEApplication] });
      toast.success('QTE application submitted for review');
      router.push('/portal/teacher/dashboard');
    } catch (error) {
      toastApiError(error);
    } finally {
      setUploadingField(null);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      validateOnChange={false}
      validateOnBlur
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3 max-w-2xl">
          {application?.application_status === 'rejected' && application?.rejected_reason ? (
            <div className="mb-2">
              <ApplicationStatusCard
                applicationStatus="rejected"
                rejectedReason={application.rejected_reason}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField name="legal_name" label="Legal Name" placeholder="Legal Name" Icon={FiUser} required />
            <FormikField name="public_name" label="Public Name" placeholder="Public Name" Icon={FiUser} required />
          </div>
          <FormikField name="linkedin" label="LinkedIn" placeholder="https://linkedin.com/in/…" Icon={FiGlobe} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField name="country" label="Country" placeholder="Country" required />
            <FormikField name="timezone" label="Timezone" placeholder="e.g. America/New_York" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormikField type="number" name="teaching_experience_years" label="Teaching Experience (years)" placeholder="0" required />
            <FormikField type="number" name="prior_student_count" label="Prior Student Count" placeholder="0" required />
          </div>
          <FormikField name="sample_curriculum" label="Sample Curriculum (link)" placeholder="https://" required />
          <FormikField name="sample_lecture_link" label="Sample Lecture (link, any platform)" placeholder="https://" required />
          <CertificationsField name="certifications" label="Certifications" placeholder="Select or add certifications" />

          <FormikDropzone
            name="government_id_file"
            label="Government ID"
            required
            accept={DOCUMENT_ACCEPT}
            supportedFilesText="pdf, jpg, jpeg and png files are supported."
          />
          <FormikDropzone
            name="resume_file"
            label="Resume"
            required
            accept={DOCUMENT_ACCEPT}
            supportedFilesText="pdf, jpg, jpeg and png files are supported."
          />

          <FormikCheckbox name="agreement_accepted" label="I accept the creator agreement" />

          <Button
            type="submit"
            disabled={isSubmitting || !!uploadingField}
            isLoading={isSubmitting || !!uploadingField}
          >
            {uploadingField ? 'Uploading documents…' : 'Submit QTE Application'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default QTEApplyForm;
