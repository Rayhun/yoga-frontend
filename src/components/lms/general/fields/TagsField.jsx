'use client';
import useLMSTagOptions from '@/hooks/useLMSTagOptions';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';

const TagsField = ({ name = 'tags', label = 'Tags', placeholder = 'Tags', ...props }) => {
  const { options: tagsOptions } = useLMSTagOptions();

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default TagsField;
