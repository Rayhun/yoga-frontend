'use client';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { ACCESS_SETTING_OPTIONS } from '@/utils/options';

const AccessSettingField = ({
  name = 'access_setting',
  label = 'Access Setting',
  placeholder = 'Access Setting',
  ...props
}) => {
  return (
    <FormikSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={ACCESS_SETTING_OPTIONS}
    />
  );
};

export default AccessSettingField;
