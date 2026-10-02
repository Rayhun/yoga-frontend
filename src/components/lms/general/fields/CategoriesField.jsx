'use client';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';

const CategoriesField = ({
  name = 'categories',
  label = 'Categories',
  placeholder = 'Categories',
  context,
  field,
  ...props
}) => {
  const { options: categoriesOptions } = useLMSCategoryOptions({ context, field });

  return (
    <FormikMultiSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={categoriesOptions}
    />
  );
};

export default CategoriesField;
