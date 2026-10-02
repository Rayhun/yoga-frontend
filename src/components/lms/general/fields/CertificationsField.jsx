'use client';

import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';
import useLMSCoachingAreas from '@/hooks/useLMSCoachingArea';

const CertificationsField = ({
  name = 'certifications',
  label = 'Certifications',
  placeholder = 'Select certifications (max 5)',
  ...props
}) => {
  const { isLoading, isError, options } = useLMSCoachingAreas('Certifications');

  return (
    <FormikMultiOptionsModalField
      {...props}
      name={name}
      label={label}
      triggerPlaceholder={placeholder}
      options={options}
      loading={isLoading}
      loadError={isError}
      max={5}
      chipKind="certification"
      modalTitle="Certifications"
      searchPlaceholder="Search certifications…"
    />
  );
};

export default CertificationsField;
