'use client';
import { useCallback, useMemo } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import useScrollToFirstErrorField from './useScrollToFirstErrorField';

const FormikSelect = ({
  name,
  label,
  options = [],
  placeholder,
  Icon,
  required,
  onChange = () => null,
  disabled = false,
  loading = false,
  freeSolo = false,
}) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const containerRef = useScrollToFirstErrorField(name);

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue =
        typeof selected === 'string' ? selected : selected?.value ?? '';
      setFieldValue(name, selectedValue, true);
      onChange(selectedValue);
    },
    [name, onChange, setFieldValue]
  );

  const handleInputChange = useCallback(
    (_, inputValue, reason) => {
      if (!freeSolo) return;
      if (reason === 'input' || reason === 'clear') {
        setFieldValue(name, inputValue ?? '', true);
        onChange(inputValue ?? '');
      }
    },
    [freeSolo, name, onChange, setFieldValue]
  );

  const selectedOption = useMemo(
    () => options.find(option => field.value === option.value),
    [field.value, options]
  );

  const isErrorField = Boolean(meta.touched && meta.error);

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      {label && (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <Autocomplete
          id={name}
          options={options}
          freeSolo={freeSolo}
          getOptionLabel={option => (typeof option === 'string' ? option : option.label)}
          value={selectedOption || (freeSolo ? field.value || '' : null)}
          onChange={handleChange}
          onInputChange={handleInputChange}
          disabled={disabled}
          loading={loading}
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
                borderColor: '#e2e8f0',
                zIndex: 1000
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

export default FormikSelect;
