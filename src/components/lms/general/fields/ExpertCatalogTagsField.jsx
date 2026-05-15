'use client';
import FormikCatalogTagsModalField from '@/components/common/form/formik/FormikCatalogTagsModalField';

/** Ignores legacy ``placeholder`` from old Autocomplete tag fields. */
const ExpertCatalogTagsField = ({
  name = 'tags',
  label = 'Tags',
  context = 'expert_profile',
  modalTitle = 'Select tags',
  placeholder: _ignored,
  ...props
}) => (
  <FormikCatalogTagsModalField
    {...props}
    name={name}
    label={label}
    context={context}
    modalTitle={modalTitle}
    searchPlaceholder="Search tags…"
    triggerPlaceholder="Select Tags"
  />
);

export default ExpertCatalogTagsField;
