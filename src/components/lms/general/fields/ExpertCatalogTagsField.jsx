'use client';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import useExpertCatalogTagOptions from '@/hooks/useExpertCatalogTagOptions';

const ExpertCatalogTagsField = ({ name = 'tags', label = 'Tags', placeholder = 'Select tags', ...props }) => {
  const { options: tagsOptions } = useExpertCatalogTagOptions();

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default ExpertCatalogTagsField;
