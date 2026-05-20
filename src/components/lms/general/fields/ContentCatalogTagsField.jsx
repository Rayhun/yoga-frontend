'use client';
import CatalogTagsField from './CatalogTagsField';

/** Catalog tag picker for LMS content (program, module, session, quiz). */
const ContentCatalogTagsField = ({
  context,
  field = 'tags',
  name = 'tags',
  label = 'Tags',
  modalTitle,
  triggerPlaceholder = 'Select tags',
  placeholder: _ignored,
  ...props
}) => (
  <CatalogTagsField
    {...props}
    name={name}
    label={label}
    field={field}
    context={context}
    modalTitle={modalTitle ?? 'Select tags'}
    triggerPlaceholder={triggerPlaceholder}
  />
);

export default ContentCatalogTagsField;
