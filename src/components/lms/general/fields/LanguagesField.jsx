'use client';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import { ACCESS_SETTING_OPTIONS } from '@/utils/options';

const LanguagesField = ({ name = 'languages', label = 'Languages', placeholder = 'Languages' }) => {
  return (
    <FormikSubmittableField
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={ACCESS_SETTING_OPTIONS}
    />
  );
};

export default LanguagesField;
