'use client';

import { useMemo } from 'react';
import { LANGUAGES } from '@/utils/constants';
import FormikMultiOptionsModalField from '@/components/common/form/formik/FormikMultiOptionsModalField';

const LanguagesField = ({
  name = 'languages',
  label = 'Languages',
  placeholder = 'Select languages you speak',
  ...props
}) => {
  const options = useMemo(
    () => LANGUAGES.map(({ value, label: langLabel }) => ({ value, label: langLabel })),
    []
  );

  return (
    <FormikMultiOptionsModalField
      {...props}
      name={name}
      label={label}
      triggerPlaceholder={placeholder}
      options={options}
      chipKind="language"
      modalTitle="Languages"
      searchPlaceholder="Search languages…"
    />
  );
};

export default LanguagesField;
