'use client';
import { useState, useCallback } from 'react';
import { useField, useFormikContext } from 'formik';
import Chip from '@mui/material/Chip';

const SubmittableTextfield = ({
  name = '',
  label,
  className,
  required = false,
  Icon,
  placeholder,
  ...restProps
}) => {
  const { setFieldValue } = useFormikContext();
  const [value, setValue] = useState('');
  const [field, meta] = useField(name);

  const isErrorField = meta.touched && meta.error;

  const handleChange = useCallback(event => {
    setValue(event.target.value);
  }, []);

  const handleKeyDown = useCallback(
    event => {
      if (event.key === 'Enter') {
        event.preventDefault();

        const { name: fieldName, value: fieldValue } = event.target;

        if (!fieldValue) return;

        setFieldValue(fieldName, [...field.value, fieldValue]);
        setValue('');
      }
    },
    [field.value, setFieldValue]
  );

  const handleRemove = index => {
    const items = [...field.value];
    items.splice(index, 1);
    setFieldValue(name, items);
  };

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}
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
      </div>

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}

      {field.value.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {field.value.map((label, index) => (
            <Chip
              key={index}
              label={label}
              className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
              color="primary"
              onDelete={() => handleRemove(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SubmittableTextfield;
