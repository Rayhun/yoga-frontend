import { useState, useRef } from 'react';
import { useField, useFormikContext } from 'formik';

const FormikOTP = ({ name: fieldName, label, numberOfDigits = 4, className, required = false }) => {
  const inputRefs = useRef([]);
  const { setFieldValue } = useFormikContext();
  const [_, meta] = useField(fieldName);
  const [otp, setOtp] = useState(Array(numberOfDigits).fill(''));

  const { touched, error } = meta;

  const handleInputChange = (e, index) => {
    const value = e.target.value;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;

    setOtp(updatedOtp);
    setFieldValue(fieldName, updatedOtp.join(''));

    // Focus on the next field
    if (value && index < numberOfDigits - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      const updatedOtp = [...otp];
      if (otp[index]) {
        updatedOtp[index] = '';
      } else if (index > 0) {
        updatedOtp[index - 1] = '';
        inputRefs.current[index - 1].focus();
      }

      setOtp(updatedOtp);
      setFieldValue(fieldName, updatedOtp.join(''));
    }
  };

  const handleFocus = index => {
    inputRefs.current[index].select(); // Select the content on focus
  };

  const isErrorField = touched && error;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center gap-4.5">
        {Array.from({ length: numberOfDigits }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={otp[index]}
            onChange={e => handleInputChange(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            ref={el => (inputRefs.current[index] = el)}
            className={`w-[50px] rounded-md border-[1.5px] border-stroke bg-transparent p-3 text-center text-2xl font-medium text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${className}`}
          />
        ))}
      </div>

      {isErrorField ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default FormikOTP;
