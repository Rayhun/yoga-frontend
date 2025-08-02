'use client';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import useLMSCoachingAreas from '@/hooks/useLMSCoachingArea';

const CertificationsField = ({
  name = 'certifications',
  label = 'Certifications',
  placeholder = 'Certifications',
  ...props
}) => {
  const { options: tagsOptions } = useLMSCoachingAreas('Certifications');

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default CertificationsField;
