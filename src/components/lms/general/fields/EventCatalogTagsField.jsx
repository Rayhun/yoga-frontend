'use client';
import FormikCatalogTagsModalField from '@/components/common/form/formik/FormikCatalogTagsModalField';

/**
 * Catalog tag picker for guided experiences (events).
 * Pass ``field`` to load namespace-scoped tags from ``/LMS/experts/catalog-tags/?context=guided_experience&field=…``.
 */
const EventCatalogTagsField = ({
  name = 'tags',
  label = 'Tags',
  field: catalogField = '',
  context = 'guided_experience',
  modalTitle = 'Select tags',
  triggerPlaceholder = 'Select',
  placeholder: _ignored,
  ...props
}) => (
  <FormikCatalogTagsModalField
    {...props}
    name={name}
    label={label}
    field={catalogField}
    context={context}
    surface="all"
    modalTitle={modalTitle}
    searchPlaceholder="Search tags…"
    triggerPlaceholder={triggerPlaceholder}
  />
);

export default EventCatalogTagsField;
