'use client';
import FormikCatalogTagsModalField from '@/components/common/form/formik/FormikCatalogTagsModalField';

/**
 * Catalog tag picker for LMS content (program, module, session, quiz).
 */
const ContentCatalogTagsField = ({
  context,
  name = 'tags',
  label = 'Tags',
  modalTitle,
  placeholder: _ignored,
  ...props
}) => (
  <FormikCatalogTagsModalField
    {...props}
    name={name}
    label={label}
    context={context}
    modalTitle={modalTitle ?? 'Select tags'}
    searchPlaceholder="Search tags…"
    triggerPlaceholder="Select"
  />
);

export default ContentCatalogTagsField;
