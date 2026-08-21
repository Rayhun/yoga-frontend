'use client';
import FormikCategoriesModalField from '@/components/common/form/formik/FormikCategoriesModalField';

const CategoriesField = ({
  name = 'categories',
  label = 'Categories',
  placeholder = 'Select categories',
  context,
  field,
  ...props
}) => (
  <FormikCategoriesModalField
    {...props}
    name={name}
    label={label}
    triggerPlaceholder={placeholder}
    context={context}
    field={field}
  />
);

export default CategoriesField;
