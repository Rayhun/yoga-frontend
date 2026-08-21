'use client';

import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';
import useLMSCoachingAreas from '@/hooks/useLMSCoachingArea';

const CoachingAreasField = ({
  name = 'coaching_areas',
  label = 'Coaching Areas',
  placeholder = 'Select coaching areas (max 10)',
  ...props
}) => {
  const { isLoading, isError, options } = useLMSCoachingAreas('Coaching Areas');

  return (
    <FormikMultiOptionsModalField
      {...props}
      name={name}
      label={label}
      triggerPlaceholder={placeholder}
      options={options}
      loading={isLoading}
      loadError={isError}
      max={10}
      chipKind="coaching_area"
      modalTitle="Coaching areas"
      searchPlaceholder="Search coaching areas…"
    />
  );
};

export default CoachingAreasField;
