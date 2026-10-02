'use client';

import { useMemo } from 'react';
import { SESSION_EQUIPMENT_OPTIONS } from '@/utils/options';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';

const EquipmentsField = ({
  name = 'equipments',
  label = 'Equipments',
  placeholder = 'Select equipment',
  modalTitle = 'Equipment',
  ...props
}) => {
  const options = useMemo(() => SESSION_EQUIPMENT_OPTIONS, []);

  return (
    <FormikMultiOptionsModalField
      {...props}
      name={name}
      label={label}
      options={options}
      chipKind="selection"
      modalTitle={modalTitle}
      triggerPlaceholder={placeholder}
      searchPlaceholder="Search equipment…"
    />
  );
};

export default EquipmentsField;
