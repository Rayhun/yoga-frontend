'use client';
import { useCallback, useMemo } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

const FormikMultiSelect = ({
  name,
  label,
  options = [],
  placeholder,
  Icon,
  required,
  max,
  onChange = () => null,
  ...rest
}) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = useCallback(
    (_, value) => {
      const raw = Array.isArray(value) ? value : [];
      const arrayValue = raw
        .map(i => i.value)
        .filter(v => v != null && v !== '');
      setFieldValue(name, arrayValue);
      onChange(raw);
    },
    [name, onChange, setFieldValue]
  );

  // Ensure field.value is always treated as an array
  const fieldValueArray = useMemo(() => {
    if (!field.value) return [];
    if (Array.isArray(field.value)) return field.value;
    if (typeof field.value === 'string') {
      // If it's a comma-separated string, split it
      if (field.value.includes(',')) {
        return field.value.split(',').map(v => v.trim()).filter(v => v);
      }
      // If it's a single string value, wrap it in an array
      return [field.value];
    }
    return [];
  }, [field.value]);

  const selectedOptions = useMemo(
    () =>
      fieldValueArray
        .map(fv => options.find(opt => opt.value != null && opt.value !== '' && fv == opt.value))
        .filter(Boolean),
    [fieldValueArray, options]
  );

  // Show error whenever validation fails (e.g. over max) so user sees it without blurring
  const isErrorField = Boolean(meta.error);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative rounded-xl">
        <Autocomplete
          {...rest}
          id={name}
          options={options}
          getOptionLabel={option => option.label}
          getOptionKey={(option, index) =>
            option?.value != null && option?.value !== ''
              ? option.value
              : `option-${option?.label ?? index}`
          }
          value={selectedOptions || []}
          onChange={handleChange}
          renderInput={params => <TextField {...params} placeholder={placeholder} error={isErrorField} />}
          renderTags={(value, getTagProps) => (
            <div className="flex flex-wrap gap-1">
              {value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  label={option.label}
                  variant="filled"
                  color="primary"
                  className="!bg-gray-300 !text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          )}
          multiple
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

export default FormikMultiSelect;
