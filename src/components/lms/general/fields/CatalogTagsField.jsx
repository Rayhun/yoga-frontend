'use client';
import FormikCatalogTagsModalField from '@/components/common/form/formik/FormikCatalogTagsModalField';

/**
 * Shared catalog tag picker — loads options from ``/LMS/experts/catalog-tags/``.
 * Pass ``context`` and ``field`` to scope namespaces (expert profile, session, guided experience, …).
 */
const CatalogTagsField = ({
  name = 'tags',
  label = 'Tags',
  context = 'expert_profile',
  field: catalogField = '',
  surface = '',
  modalTitle = 'Select tags',
  triggerPlaceholder = 'Select',
  searchPlaceholder = 'Search tags…',
  seedRows,
  placeholder: _ignored,
  ...props
}) => (
  <FormikCatalogTagsModalField
    {...props}
    seedRows={seedRows}
    name={name}
    label={label}
    field={catalogField}
    context={context}
    surface={surface}
    modalTitle={modalTitle}
    searchPlaceholder={searchPlaceholder}
    triggerPlaceholder={triggerPlaceholder}
  />
);

export default CatalogTagsField;
