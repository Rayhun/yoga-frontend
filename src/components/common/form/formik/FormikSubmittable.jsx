'use client';
import { useState, useCallback } from 'react';
import { useField, useFormikContext } from 'formik';
import Chip from '@mui/material/Chip';
import { IconButton, Tooltip } from '@mui/material';
import { MdInfoOutline } from 'react-icons/md';

const FormikSubmittable = ({
  name = '',
  label,
  className,
  required = false,
  Icon,
  placeholder,
  ...restProps
}) => {
  const { setFieldValue, setFieldError } = useFormikContext();
  const [value, setValue] = useState('');
  const [field, meta] = useField(name);

  const isErrorField = meta.touched && meta.error;

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (value !== value.trim()) {
        setFieldError(name, 'Value cannot have leading or trailing spaces');
      } else {
        // Clear URL validation error when user starts typing
        if (meta.error && meta.error.includes('valid URL')) {
          setFieldError(name, undefined);
        }
      }
  
      setValue(value);
    },
    [name, setFieldError, meta.error]
  );

  const isValidUrl = useCallback((string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }, []);

  const handleKeyDown = useCallback(
    event => {
      if (event.key === 'Enter') {
        event.preventDefault();

        const { name: fieldName, value: fieldValue } = event.target;

        if (!fieldValue || fieldValue.trim() !== fieldValue) return;

        // Validate URL format
        const trimmedValue = fieldValue.trim();
        if (!isValidUrl(trimmedValue)) {
          setFieldError(name, 'Please enter a valid URL (e.g., https://example.com)');
          return;
        }

        setFieldError(name, undefined);
        setFieldValue(fieldName, [...field.value, trimmedValue]);
        setValue('');
      }
    },
    [field.value, setFieldValue, name, setFieldError, isValidUrl]
  );

  const handleRemove = index => {
    const items = [...field.value];
    items.splice(index, 1);
    setFieldValue(name, items);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        {label ? (
          <label
            className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}
          >
            {label}
          </label>
        ) : null}
        <Tooltip title="Please press enter to submit entered value." placement="right" arrow>
          <IconButton>
            <MdInfoOutline className="text-primary" size={20} />
          </IconButton>
        </Tooltip>
      </div>
      <div className="relative">
        <input
          {...field}
          {...restProps}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${className}`}
          style={{ border: isErrorField ? '1px solid red' : undefined }}
        />

        {Icon ? (
          <span className="absolute right-4 top-4">
            <Icon size={20} color="#B5BDC8" />
          </span>
        ) : null}
        {value ? (
          <span className={`absolute ${Icon ? 'right-16' : 'right-4'} top-4 text-gray-400`}>
            <span>Press Enter ↵</span>
          </span>
        ) : null}
      </div>

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}

      {field.value?.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {field.value.map((label, index) => (
            <Chip
              key={index}
              label={label}
              className="!bg-gray-300 !text-black-2 dark:text-white dark:bg-primary"
              color="primary"
              onDelete={() => handleRemove(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FormikSubmittable;
