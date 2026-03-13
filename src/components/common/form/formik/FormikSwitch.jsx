'use client';
import { useField } from 'formik';

const FormikSwitch = ({ name: fieldName, label, className, required = false, ...fieldProps }) => {
  const [field, meta] = useField({ name: fieldName, type: 'checkbox' });

  const isErrorField = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-1 w-100">
      <label htmlFor={fieldName} className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            {...field}
            {...fieldProps}
            type="checkbox"
            id={fieldName}
            className={`sr-only ${className}`}
          />
          <div
            className={`mr-4 h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${
              field.checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                field.checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
        {label}
      </label>

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
};

export default FormikSwitch;
