import React, { useState } from 'react';
import { useField } from 'formik';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import useScrollToFirstErrorField from './useScrollToFirstErrorField';

const FormikField = ({
  name: fieldName,
  label,
  className,
  required = false,
  rows = 1,
  Icon,
  type = 'text',
  helperIcon = null,
  ...fieldProps
}) => {
  const [typeState, setTypeState] = useState(type);
  const [field, meta] = useField(fieldName);
  const containerRef = useScrollToFirstErrorField(fieldName);

  const isErrorField = meta.touched && meta.error;

  const handleTypeChange = () => {
    setTypeState(prevType => (prevType === 'text' ? 'password' : 'text'));
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {label ? (
        <div className="flex items-center gap-2">
          <label className={`text-sm font-semibold text-gray-700 dark:text-gray-300 ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
            {label}
          </label>
          {helperIcon}
        </div>
      ) : null}
      <div className="relative group">
        {rows > 1 ? (
          <textarea
            {...field}
            {...fieldProps}
            rows={rows}
            className={`w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-100 hover:border-gray-300 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:focus:border-green-400 dark:focus:bg-gray-800 ${isErrorField ? 'border-red-400 focus:border-red-500 focus:shadow-red-100' : 'border-gray-200'}`}
          />
        ) : (
          <input
            {...field}
            {...fieldProps}
            type={typeState}
            className={`w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm py-4 pl-12 pr-12 text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-100 hover:border-gray-300 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:focus:border-green-400 dark:focus:bg-gray-800 ${isErrorField ? 'border-red-400 focus:border-red-500 focus:shadow-red-100' : 'border-gray-200'}`}
          />
        )}
        
        {/* Icon on the left */}
        {Icon && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300">
            <Icon size={20} />
          </span>
        )}
        
        {/* Password toggle or right icon */}
        {type === 'password' ? (
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
            onClick={handleTypeChange}
          >
            {typeState === 'password' ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
          </button>
        ) : null}
      </div>

      {/* Error message with animation */}
      {isErrorField ? (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-fadeIn">
          <span>⚠️</span>
          <span>{meta.error}</span>
        </div>
      ) : null}
    </div>
  );
};

export default FormikField;
