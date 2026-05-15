'use client';
import FormikCategoriesModalField from '@/components/common/form/formik/FormikCategoriesModalField';

const CategoriesField = ({
  name = 'categories',
  label = 'Categories',
  placeholder = 'Select categories',
  ...props
}) => (
  <FormikCategoriesModalField
    {...props}
    name={name}
    label={label}
    triggerPlaceholder={placeholder}
  />
);

export default CategoriesField;
