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
  const { options: tagsOptions, isError } = useExpertCatalogTagOptions({
    context: 'guided_experience',
    // Skip show_on filter if production catalog rows use other surface labels
    surface: 'all',
  });

  return (
    <FormikMultiSelect
      {...props}
      name={name}
      label={label}
      placeholder={isError ? 'Could not load tags — check API / login' : placeholder}
      options={tagsOptions}
    />
  );
};

export default GuidedExperienceCatalogTagsField;
