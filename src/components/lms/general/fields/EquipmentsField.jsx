'use client';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import { ACCESS_SETTING_OPTIONS } from '@/utils/options';

const EquipmentsField = ({ name = 'equipments', label = 'Equipments', placeholder = 'Equipments' }) => {
  return (
    <FormikSubmittableField
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={ACCESS_SETTING_OPTIONS}
    />
  );
};

export default EquipmentsField;
