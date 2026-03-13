'use client';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { INTENSITY_LEVEL_OPTIONS } from '@/utils/options';

const IntensityField = ({ name = 'intensity', label = 'Intensity', placeholder = 'Intensity', ...props }) => {
  return (
    <FormikSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={INTENSITY_LEVEL_OPTIONS}
    />
  );
};

export default IntensityField;
