'use client';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import useExpertCatalogTagOptions from '@/hooks/useExpertCatalogTagOptions';

/**
 * Catalog tag picker for LMS content (program, module, session, quiz).
 * Uses ``/LMS/experts/catalog-tags/?context=…`` — values are TagAlias IDs.
 */
const ContentCatalogTagsField = ({
  context,
  name = 'tags',
  label = 'Tags',
  placeholder = 'Select tags',
  ...props
}) => {
  const { options: tagsOptions } = useExpertCatalogTagOptions({ context });

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default ContentCatalogTagsField;
