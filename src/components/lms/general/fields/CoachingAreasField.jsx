'use client';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import useLMSCoachingAreas from '@/hooks/useLMSCoachingArea';

const CoachingAreasField = ({
  name = 'coaching_areas',
  label = 'Coaching Areas',
  placeholder = 'Coaching Areas',
  ...props
}) => {
  const { options: tagsOptions } = useLMSCoachingAreas('Coaching Areas');

  return (
    <FormikMultiSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={tagsOptions}
      max={10}
    />
  );
};

export default CoachingAreasField;
