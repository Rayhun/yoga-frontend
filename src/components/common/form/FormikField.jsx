import { useField } from 'formik';
import { RiInputField } from 'react-icons/ri';

const FormikField = ({
  name: fieldName,
  label,
  className,
  required = false,
  Icon = RiInputField,
  ...fieldProps
}) => {
  const [field, meta] = useField(fieldName);

  const isErrorField = meta.touched && meta.error;

  return (
    <div>
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          {...field}
          {...fieldProps}
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
    </div>
  );
};

export default FormikField;
