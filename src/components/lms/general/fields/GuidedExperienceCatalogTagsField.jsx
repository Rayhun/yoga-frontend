'use client';
import FormikCatalogTagsModalField from '@/components/common/form/formik/FormikCatalogTagsModalField';

/** Guided experience (event) tags — ``guided_experience`` namespaces; ``surface=all`` for catalog rows. */
const GuidedExperienceCatalogTagsField = ({
  name = 'tags',
  label = 'Tags',
  modalTitle = 'Select tags',
  placeholder: _ignored,
  ...props
}) => (
  <FormikCatalogTagsModalField
    {...props}
    name={name}
    label={label}
    context="guided_experience"
    surface="all"
    modalTitle={modalTitle}
    searchPlaceholder="Search tags…"
    triggerPlaceholder="Select Tags"
  />
);

export default GuidedExperienceCatalogTagsField;
