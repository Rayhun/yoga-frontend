'use client';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittableField';

const FocusAreasField = ({
  name = 'focus_areas',
  label = 'Focus Areas',
  placeholder = 'Focus Areas',
  ...rest
}) => {
  return <FormikSubmittableField {...rest} name={name} label={label} placeholder={placeholder} />;
};

export default FocusAreasField;
