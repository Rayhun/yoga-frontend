'use client';
import React from 'react';
import { useField } from 'formik';
import clsx from 'clsx';

export function FormikRadioGroup({
  name,
  label,
  options,
  className = '',
}) {
  const [field, meta, helpers] = useField(name);
  const showError = meta.touched && !!meta.error;

  return (
    <fieldset className={clsx('space-y-1', className)}>
      {label && (
        <legend className="text-gray-700 font-medium">{label}</legend>
      )}

      <div className="flex items-center gap-6">
        {options.map((opt) => {
          const checked = field.value === opt.value;
          return (
            <FormikRadio
              key={String(opt.value)}
              name={name}
              value={opt.value}
              label={opt.label}
              checked={checked}
              onChange={() => helpers.setValue(opt.value)}
            />
          );
        })}
      </div>

      {showError && (
        <p className="mt-1 text-xs text-red-500">{meta.error}</p>
      )}
    </fieldset>
  );
}

function FormikRadio({
  name,
  value,
  label,
  checked,
  onChange,
}) {
  return (
    <label
      htmlFor={`${name}-${String(value)}`}
      className="flex cursor-pointer select-none items-center gap-2"
    >
      <input
        id={`${name}-${String(value)}`}
        name={name}
        type="radio"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />

      <span className="relative inline-flex items-center justify-center w-5 h-5">
        <span
          className={clsx(
            'absolute inset-0 rounded-full border-2 transition-colors',
            checked ? 'border-primary' : 'border-gray-400'
          )}
        />
        <span
          className={clsx(
            'rounded-full transition-colors',
            checked
              ? 'w-3 h-3 border-2 bg-primary'
              : 'w-3 h-3 border-2 border-transparent'
          )}
        />
      </span>

      <span className={clsx(checked ? 'text-primary' : 'text-gray-600')}>
        {label}
      </span>
    </label>
  );
}
