'use client';

import { CULTURE_EXPERIENCE_OPTIONS } from '@/utils/constants';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';

const CultureExperienceField = ({
  name = 'culture_experience',
  label = 'Culture Experience',
  placeholder = 'Select culture experience',
  ...props
}) => (
  <FormikMultiOptionsModalField
    {...props}
    name={name}
    label={label}
    triggerPlaceholder={placeholder}
    options={CULTURE_EXPERIENCE_OPTIONS}
    chipKind="culture"
    modalTitle="Culture experience"
    searchPlaceholder="Search culture experiences…"
  />
);

export default CultureExperienceField;
