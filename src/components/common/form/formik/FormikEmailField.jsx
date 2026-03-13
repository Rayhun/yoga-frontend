import React, { useState, useCallback, useEffect } from 'react';
import { useField } from 'formik';
import { FiMail } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { checkEmailExists } from '@/services/public/auth';

const FormikEmailField = ({
  name: fieldName,
  label,
  className,
  required = false,
  placeholder,
  ...fieldProps
}) => {
  const [field, meta, helpers] = useField(fieldName);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const { mutate: checkEmail } = useMutation({
    mutationFn: checkEmailExists,
    onSuccess: (response) => {
      // Email is available (status: success)
      setEmailExists(false);
      setEmailErrorMessage('');
      setEmailChecking(false);
      // Trigger Formik validation
      helpers.setTouched(true);
    },
    onError: (error) => {
      // Email already exists (status: error, status code: 400)
      if (error.response?.status === 400) {
        setEmailExists(true);
        setEmailErrorMessage(error.response?.data?.message || 'This email is already registered');
      } else {
        console.error('Email check error:', error);
        setEmailErrorMessage('Error checking email availability');
      }
      setEmailChecking(false);
      // Trigger Formik validation
      helpers.setTouched(true);
    }
  });

  // Debounced email validation
  const debouncedEmailCheck = useCallback(
    (() => {
      let timeoutId;
      return (email) => {
        clearTimeout(timeoutId);
        if (!email || email.length < 3) {
          setEmailChecking(false);
          setEmailExists(false);
          setEmailErrorMessage('');
          return;
        }
        
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setEmailChecking(false);
          setEmailExists(false);
          setEmailErrorMessage('');
          return;
        }

        setEmailChecking(true);
        timeoutId = setTimeout(() => {
          checkEmail({ email });
        }, 500); // 500ms delay
      };
    })(),
    [checkEmail]
  );

  // Handle email change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    helpers.setValue(email);
    debouncedEmailCheck(email);
  };

  const isErrorField = meta.touched && (meta.error || emailExists);

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <div className="flex items-center gap-2">
          <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
            {label}
          </label>
          {emailChecking && (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-xs text-gray-500">Checking...</span>
            </div>
          )}
        </div>
      ) : null}
      <div className="relative">
        <input
          {...field}
          {...fieldProps}
          type="email"
          onChange={handleEmailChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${className}`}
          style={{ border: isErrorField ? '1px solid red' : undefined }}
        />
        <span className="absolute right-4 top-4">
          <FiMail size={20} color="#B5BDC8" />
        </span>
      </div>

      {isErrorField ? (
        <small className="text-xs text-red-500">
          {emailExists ? emailErrorMessage : meta.error}
        </small>
      ) : null}
    </div>
  );
};

export default FormikEmailField; 