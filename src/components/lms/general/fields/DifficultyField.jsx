'use client';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { DIFFICULTY_OPTIONS } from '@/utils/options';

const DifficultyField = ({
  name = 'difficulty',
  label = 'Difficulty',
  placeholder = 'Difficulty',
  ...props
}) => {
  return (
    <FormikSelect
      {...props}
      name={name}
      label={label}
      placeholder={placeholder}
      options={DIFFICULTY_OPTIONS}
    />
  );
};

export default DifficultyField;
