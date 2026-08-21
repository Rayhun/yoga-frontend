'use client';

import FormikSingleOptionModalField from './FormikSingleOptionModalField';

/**
 * Single-select field using the same pill + modal design as catalog tag pickers.
 */
const FormikSelect = ({
  name,
  label,
  options = [],
  placeholder,
  modalTitle,
  searchPlaceholder,
  Icon,
  required,
  onChange,
  disabled = false,
  loading = false,
  freeSolo = false,
}) => {
  const resolvedModalTitle = modalTitle ?? (label ? `Select ${label.toLowerCase()}` : 'Select option');
  const resolvedSearch = searchPlaceholder ?? `Search ${(label || 'options').toLowerCase()}…`;
  const resolvedTrigger = placeholder ?? 'Select';

  return (
    <FormikSingleOptionModalField
      name={name}
      label={label}
      options={options}
      required={required}
      modalTitle={resolvedModalTitle}
      searchPlaceholder={resolvedSearch}
      triggerPlaceholder={resolvedTrigger}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      Icon={Icon}
      freeSolo={freeSolo}
    />
  );
};

export default FormikSelect;
