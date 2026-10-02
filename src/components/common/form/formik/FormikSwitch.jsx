'use client';
import { useField } from 'formik';

const Track = ({ checked }) => (
  <span
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
      checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
    }`}
    aria-hidden
  >
    <span
      className={`pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-out ${
        checked ? 'translate-x-[1.375rem]' : 'translate-x-0'
      }`}
    />
  </span>
);

/**
 * Toggle switch bound to Formik boolean.
 *
 * @param {'default' | 'card'} variant - card: bordered row, label left, On/Off label + toggle right
 * @param {boolean} elevateCardLabel - when variant is ``card``, render label above the bar (matches FormikSelect / FormikField)
 */
const FormikSwitch = ({
  name: fieldName,
  label,
  description,
  variant = 'default',
  elevateCardLabel = false,
  className = '',
  required: _required = false,
  ...fieldProps
}) => {
  const [field, meta] = useField({ name: fieldName, type: 'checkbox' });
  const isErrorField = meta.touched && meta.error;
  const checked = Boolean(field.checked);

  const input = <input {...field} {...fieldProps} type="checkbox" id={fieldName} className="sr-only" />;

  if (variant === 'card') {
    const barClass =
      'flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900/40';

    if (elevateCardLabel) {
      return (
        <div className={`flex min-w-0 w-full flex-col gap-1 ${className}`}>
          {label ? (
            <div className="mb-1 block font-medium text-black dark:text-white">{label}</div>
          ) : null}
          <label className={`block cursor-pointer select-none ${barClass}`}>
            <span className="min-h-[1.25rem] flex-1 pr-4 text-sm leading-snug text-gray-600 dark:text-gray-400">
              {description || '\u00a0'}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  checked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {checked ? 'On' : 'Off'}
              </span>
              <span className="relative inline-flex">
                {input}
                <Track checked={checked} />
              </span>
            </div>
          </label>
          {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
        </div>
      );
    }

    return (
      <div className={`flex w-full flex-col gap-1 ${className}`}>
        <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 dark:border-gray-600 dark:bg-gray-800/40">
          <div className="min-w-0 flex-1">
            {label ? <p className="text-sm font-semibold text-black dark:text-white">{label}</p> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                checked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {checked ? 'On' : 'Off'}
            </span>
            <label htmlFor={fieldName} className="inline-flex cursor-pointer select-none items-center">
              {input}
              <Track checked={checked} />
            </label>
          </div>
        </div>
        {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldName} className="flex cursor-pointer select-none items-center gap-3">
        {input}
        <Track checked={checked} />
        {label ? <span className="text-sm text-black dark:text-white">{label}</span> : null}
      </label>
      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
};

export default FormikSwitch;
