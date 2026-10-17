'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FaRegFileImage } from 'react-icons/fa6';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';
import useReportSaveStatus from '@/components/certification/builder/useReportSaveStatus';

const validationSchema = Yup.object({
  certificate_title: Yup.string(),
  expiry_period_days: Yup.number().min(0, 'Must be 0 or more days').nullable(),
  completion_rules: Yup.string(),
  primary_issuer_name: Yup.string(),
  certificate_type: Yup.string(),
  signatory_name: Yup.string(),
  signatory_title: Yup.string(),
});

// Same fix as PricingSection: FormikField type="number" leaves an empty field as '', and DRF's
// PositiveIntegerField rejects '' outright rather than treating it as null.
const toPayload = values => ({
  certificate_title: values.certificate_title,
  expiry_period_days: values.expiry_period_days === '' ? null : values.expiry_period_days,
  completion_rules: values.completion_rules,
  primary_issuer_name: values.primary_issuer_name,
  // Everything below is printed verbatim on the learner's certificate document
  // (see Certification.certificates.certificate_payload) — no copy is hardcoded client-side.
  certificate_type: values.certificate_type,
  signatory_name: values.signatory_name,
  signatory_title: values.signatory_title,
  issuer_logo: values.issuer_logo,
});

/**
 * The mockup's 3 fields (Certificate Title, Certificate Validity, Completion Rule) plus Issuer
 * Name (`primary_issuer_name`) — not in the mockup either, but required for Publish (backend
 * pass 3's completeness check) and with no other field anywhere to collect it, so it's added
 * here rather than leaving the builder unable to publish anything. Still not the full
 * co-branding block (co-issuer name/signature/logo, primary signature image, template picker) —
 * those stay flagged separately, backend already supports them, not built here.
 *
 * The four fields added for the dynamic certificate document — Certificate Type (the ribbon /
 * seal label, e.g. "Course Certificate"), Signatory Name + Title (the printed signature block)
 * and Issuer Logo (the top-left mark, which replaces the issuer's name in the header when set) —
 * are collected here because the certificate renders them and nothing else writes them. Issuer
 * Logo reuses the thumbnail's public-upload pattern (`uploadLMSFile` → `POST /LMS/file/upload/`
 * → `file_link`): it's a public document image, not a private application document.
 *
 * ``initialValues.primary_issuer_name`` defaults to the creator's own name (Expert.public_name /
 * Institution.legal_organization_name, resolved server-side as `creator_display_name` — see
 * ProgramBuilderModal) when nothing's been saved yet, but stays freely editable.
 *
 * One mismatch worth knowing about: the mockup's "Certificate Validity" field is free text
 * ("e.g. 2 years, or Lifetime"), but the backend model stores it as `expiry_period_days` (a
 * plain integer). This renders it as a numeric days input rather than inventing a "2 years" →
 * days parser that was never confirmed — "Lifetime" maps naturally (leave blank = never
 * expires), but a creator typing "2 years" has to convert to "730" themselves. Worth flagging
 * to the client, not silently working around.
 */
const CertificateSetupSection = ({ initialValues, onSave, disabled = false, onStatusChange, anchorId }) => {
  const { notifyBlur, markSaved, retry, status, errorMessage, canRetry } = useSectionAutosave(onSave);
  useReportSaveStatus(onStatusChange, { status, errorMessage, canRetry, retry });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleBlur = useCallback(values => notifyBlur(toPayload(values)), [notifyBlur]);

  const handleLogoDrop = useCallback(
    async (files, values, setFieldValue) => {
      const file = files?.[0];
      if (!file) return;
      setIsUploadingLogo(true);
      try {
        const { data } = await uploadLMSFile({ file });
        setFieldValue('issuer_logo', data?.file_link);
        handleBlur({ ...values, issuer_logo: data?.file_link });
      } catch (error) {
        toastApiError(error);
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [handleBlur]
  );

  return (
    <SectionCard
      anchorId={anchorId}
      title="Certificate Setup"
      status={status}
      errorMessage={errorMessage}
      canRetry={canRetry}
      onRetry={retry}
    >
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-3" onBlur={() => handleBlur(values)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikField name="certificate_title" label="Certificate Title" placeholder="e.g. Menopause Wellness Coach Certification" disabled={disabled} />
              <FormikField
                type="number"
                name="expiry_period_days"
                label="Certificate Validity (days)"
                placeholder="Leave blank for lifetime / never expires"
                disabled={disabled}
              />
            </div>
            <FormikField
              name="primary_issuer_name"
              label="Issuer Name"
              placeholder="e.g. your name or organization, as it should appear on the certificate"
              disabled={disabled}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikField
                name="certificate_type"
                label="Certificate Type"
                placeholder="e.g. Course Certificate"
                disabled={disabled}
              />
              <FormikField
                name="signatory_title"
                label="Signatory Title"
                placeholder="e.g. Program Director"
                disabled={disabled}
              />
            </div>
            <FormikField
              name="signatory_name"
              label="Signatory Name"
              placeholder="Name printed under the signature line (defaults to the issuer name)"
              disabled={disabled}
            />
            <FormikDropzone
              name="logo_file"
              label={isUploadingLogo ? 'Issuer Logo (uploading…)' : 'Issuer Logo'}
              fileURLs={values.issuer_logo ? [values.issuer_logo] : []}
              Icon={FaRegFileImage}
              disabled={disabled || isUploadingLogo}
              onDrop={files => handleLogoDrop(files, values, setFieldValue)}
            />
            <FormikField
              name="completion_rules"
              label="Completion Rule"
              placeholder="e.g. All 6 modules + final assessment"
              rows={2}
              disabled={disabled}
            />
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default CertificateSetupSection;
