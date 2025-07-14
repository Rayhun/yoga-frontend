'use client';
import { useCallback, useMemo } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { COUNTRIES_CALLING_CODE } from '@/utils/constants';

const FormikCountrySelect = ({ name, label, placeholder, Icon, required, onChange = () => null }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue = selected?.name || '';
      setFieldValue(name, selectedValue);
      onChange(selectedValue);
    },
    [name, onChange, setFieldValue]
  );

  const selectedOption = useMemo(
    () => COUNTRIES_CALLING_CODE.find(option => field.value === option.name),
    [field.value]
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
          options={COUNTRIES_CALLING_CODE}
          getOptionLabel={option => `${option.flag} ${option.name}`}
          getOptionKey={option => option.name}
          value={selectedOption || null}
          onChange={handleChange}
          renderInput={params => (
            <TextField
              {...params}
              placeholder={placeholder}
              error={isErrorField}
              // style={{ border: isErrorField ? '1px solid red' : undefined }}
            />
          )}
          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                borderWidth: '2px',
                borderColor: '#e2e8f0'
              }
            }
          }}
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

export default FormikCountrySelect;
