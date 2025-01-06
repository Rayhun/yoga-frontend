'use client';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';

const FocusAreasField = ({
  name = 'focus_areas',
  label = 'Focus Areas',
  placeholder = 'Focus Areas',
  ...rest
}) => {
  return <FormikSubmittableField {...rest} name={name} label={label} placeholder={placeholder} />;
};

export default FocusAreasField;
