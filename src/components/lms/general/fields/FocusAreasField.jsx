'use client';

import { useMemo } from 'react';
import { SESSION_FOCUS_AREA_OPTIONS } from '@/utils/options';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';

const FocusAreasField = ({
  name = 'focus_areas',
  label = 'Focus Areas',
  placeholder = 'Select focus areas',
  modalTitle = 'Focus areas',
  ...rest
}) => {
  const options = useMemo(() => SESSION_FOCUS_AREA_OPTIONS, []);

  return (
    <FormikMultiOptionsModalField
      {...rest}
      name={name}
      label={label}
      options={options}
      chipKind="selection"
      modalTitle={modalTitle}
      triggerPlaceholder={placeholder}
      searchPlaceholder="Search focus areas…"
    />
  );
};

export default FocusAreasField;
