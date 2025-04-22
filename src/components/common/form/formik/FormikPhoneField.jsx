import { useState, useEffect } from 'react';
import { useField } from 'formik';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FiPhone } from 'react-icons/fi';
import { COUNTRIES_CALLING_CODE } from '@/utils/constants';

const FormikPhoneField = ({
  name,
  label,
  className,
  required = false,
  placeholder,
  ...fieldProps
}) => {
  const [field, meta, helpers] = useField(name);
  const { setValue, setTouched } = helpers;
  
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  useEffect(() => {
    if (field.value) {
      const countryCodeMatch = field.value.match(/^\+\d+/);
      if (countryCodeMatch) {
        const code = countryCodeMatch[0];
        const number = field.value.substring(code.length).trim();
        setCountryCode(code);
        setPhoneNumber(number);
      } else {
        setPhoneNumber(field.value);
      }
    }
  }, []);

  const handlePhoneNumberChange = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    setValue(`${countryCode} ${newPhoneNumber}`);
  };

  const handleCountryCodeChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);
    setValue(`${code} ${phoneNumber}`);
    setTouched(true);
  };

  const isErrorField = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
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
            }
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
              }
            }}
            renderValue={(value) => {
              return value;
            }}
          >
            {COUNTRIES_CALLING_CODE.map((item, index) => (
              <MenuItem key={`${item.callingCode}-${index}`} value={item.callingCode}>
                {item.callingCode} ({item.name} {item.flag})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <div className="relative flex-1">
          <input
            type="tel"
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
          />
          <span className="absolute right-4 top-4">
            <FiPhone size={20} color="#B5BDC8" />
          </span>
        </div>
      </div>
      
      {isErrorField && <small className="text-xs text-red-500">{meta.error}</small>}
    </div>
  );
};

export default FormikPhoneField;