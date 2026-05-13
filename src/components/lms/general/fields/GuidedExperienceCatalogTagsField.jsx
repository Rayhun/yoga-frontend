'use client';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import useExpertCatalogTagOptions from '@/hooks/useExpertCatalogTagOptions';

/** Tags for guided experiences — catalog aliases limited to ``guided_experience`` namespaces on the API. */
const GuidedExperienceCatalogTagsField = ({
  name = 'tags',
  label = 'Tags',
  placeholder = 'Select tags',
  ...props
}) => {
  const { options: tagsOptions } = useExpertCatalogTagOptions({ context: 'guided_experience' });

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default GuidedExperienceCatalogTagsField;
