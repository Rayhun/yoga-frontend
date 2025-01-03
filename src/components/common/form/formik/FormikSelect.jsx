'use client';
import { useCallback, useMemo } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const FormikSelect = ({ name, label, options = [], placeholder, Icon, required, onChange = () => null }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue = selected.value || '';
      setFieldValue(name, selectedValue);
      onChange(selectedValue);
    },
    [name, onChange, setFieldValue]
  );

  const selectedOption = useMemo(
    () => options.find(option => field.value === option.value),
    [field.value, options]
  );

  const isErrorField = Boolean(meta.touched && meta.error);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <Autocomplete
          id={name}
          options={options}
          getOptionLabel={option => option.label}
          getOptionKey={option => option.value}
          value={selectedOption || null}
          onChange={handleChange}
          renderInput={params => <TextField {...params} placeholder={placeholder} error={isErrorField} />}
        />
        {Icon && (
          <span className="absolute right-4 top-4">
            <Icon size={20} color="#B5BDC8" />
          </span>
        )}
      </div>

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
};

export default FormikSelect;
