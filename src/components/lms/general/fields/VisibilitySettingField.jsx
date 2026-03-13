'use client';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { VISIBILITY_SETTING_OPTIONS } from '@/utils/options';

const VisibilitySettingField = ({
  name = 'visibility_setting',
  label = 'Visibility Setting',
  placeholder = 'Visibility Setting',
  ...props
}) => {
  return (
    <FormikSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={VISIBILITY_SETTING_OPTIONS}
    />
  );
};

export default VisibilitySettingField;
