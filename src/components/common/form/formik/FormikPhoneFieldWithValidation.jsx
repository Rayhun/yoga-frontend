import { useState, useEffect, useCallback } from 'react';
import { useField } from 'formik';
import { Select, MenuItem, FormControl } from '@mui/material';
import { FiPhone } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { checkPhoneExists } from '@/services/public/auth';
import { COUNTRIES_CALLING_CODE } from '@/utils/constants';

const FormikPhoneFieldWithValidation = ({ 
  name, 
  label, 
  className, 
  required = false, 
  placeholder, 
  ...fieldProps 
}) => {
  const [field, meta, helpers] = useField(name);
  const { setValue, setTouched } = helpers;
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');

  const [countryCode, setCountryCode] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { mutate: checkPhone } = useMutation({
    mutationFn: checkPhoneExists,
    onSuccess: (response) => {
      // Phone is available (status: success)
      setPhoneExists(false);
      setPhoneErrorMessage('');
      setPhoneChecking(false);
      // Trigger Formik validation
      setTouched(true);
    },
    onError: (error) => {
      // Phone already exists (status: error, status code: 400)
      if (error.response?.status === 400) {
        setPhoneExists(true);
        setPhoneErrorMessage(error.response?.data?.message || 'This phone number is already registered');
      } else {
        console.error('Phone check error:', error);
        setPhoneErrorMessage('Error checking phone number availability');
      }
      setPhoneChecking(false);
      // Trigger Formik validation
      setTouched(true);
    }
  });

  // Debounced phone validation
  const debouncedPhoneCheck = useCallback(
    (() => {
      let timeoutId;
      return (phone) => {
        clearTimeout(timeoutId);
        if (!phone || phone.length < 10) {
          setPhoneChecking(false);
          setPhoneExists(false);
          setPhoneErrorMessage('');
          return;
        }
        
        // Basic phone format validation (at least 10 digits)
        const phoneRegex = /^\+?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
          setPhoneChecking(false);
          setPhoneExists(false);
          setPhoneErrorMessage('');
          return;
        }

        setPhoneChecking(true);
        timeoutId = setTimeout(() => {
          checkPhone({ phone });
        }, 500); // 500ms delay
      };
    })(),
    [checkPhone]
  );

  useEffect(() => {
    if (field.value) {
      let matchedCountry = COUNTRIES_CALLING_CODE.find(({ callingCode }) =>
        field.value.startsWith(callingCode)
      );
      if (!matchedCountry) {
        setPhoneNumber(field.value);
        return;
      }
      setCountryCode(matchedCountry.code);
      const number = field.value.substring(matchedCountry.callingCode.length).trim();
      setPhoneNumber(number);
    }
  }, []);

  const handlePhoneNumberChange = e => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    const callingCode = COUNTRIES_CALLING_CODE.find(c => c.code === countryCode)?.callingCode || '';
    const fullPhoneNumber = `${callingCode} ${newPhoneNumber}`;
    setValue(fullPhoneNumber);
    
    // Trigger phone validation
    debouncedPhoneCheck(fullPhoneNumber);
  };

  const handleCountryCodeChange = e => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    const callingCode = COUNTRIES_CALLING_CODE.find(c => c.code === newCountryCode)?.callingCode || '';
    const fullPhoneNumber = `${callingCode} ${phoneNumber}`;
    setValue(fullPhoneNumber);
    setTouched(true);
    
    // Trigger phone validation with new country code
    debouncedPhoneCheck(fullPhoneNumber);
  };

  const isErrorField = meta.touched && (meta.error || phoneExists);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center gap-2">
          <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
            {label}
          </label>
          {phoneChecking && (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-xs text-gray-500">Checking...</span>
            </div>
          )}
        </div>
      )}

      <div className="flex">
        <FormControl
          sx={{
            minWidth: 100,
            '& .MuiOutlinedInput-root': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              height: '58px',
              borderColor: isErrorField ? 'red' : undefined,
            },
          }}
        >
          <Select
            value={countryCode}
            onChange={handleCountryCodeChange}
            displayEmpty
            variant="outlined"
            sx={{
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: isErrorField ? 'red' : undefined,
              },
            }}
            renderValue={value => {
              const selectedCountry = COUNTRIES_CALLING_CODE.find(item => item.code === value);
              if (!selectedCountry) return value;

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{`${selectedCountry.callingCode} (${selectedCountry.code})`}</span>
                </div>
              );
            }}
          >
            {COUNTRIES_CALLING_CODE.map((item, index) => (
              <MenuItem key={`${item.code}-${index}`} value={item.code}>
                {item.callingCode} ({item.name} {item.flag})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="relative flex-1">
          <input
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={field.onBlur}
            name={name}
            {...fieldProps}
            className={`w-full rounded-r-lg border border-stroke bg-transparent py-4 pl-4 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${className}`}
            style={{
              border: isErrorField ? '1px solid red' : undefined,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            placeholder={placeholder}
            type="text"
          />
          <span className="absolute right-4 top-4">
            <FiPhone size={20} color="#B5BDC8" />
          </span>
        </div>
      </div>

      {isErrorField && (
        <small className="text-xs text-red-500">
          {phoneExists ? phoneErrorMessage : meta.error}
        </small>
      )}
    </div>
  );
};

export default FormikPhoneFieldWithValidation; 