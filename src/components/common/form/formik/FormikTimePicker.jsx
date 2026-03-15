'use client';

import { useField } from 'formik';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';

const StyledTimePicker = styled(TimePicker)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
      borderWidth: '0px',
      boxShadow: 'none',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
      borderWidth: '0px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
      borderWidth: '0px',
      boxShadow: 'none',
    },
  },
  '& .MuiInputBase-root': {
    padding: '0',
  },
  '& .MuiSelect-select': {
    fontSize: '16px',
    color: '#000000',
  },
  '& .MuiSvgIcon-root': {
    color: '#64748B',
    right: '12px',
  },
  '& .MuiInputBase-input': {
    color: '#000',
  },
}));

const FormikTimePicker = ({ label, required, Icon, ...props }) => {
  const [field, meta, helpers] = useField(props.name);
  const { setValue, setTouched } = helpers;

  const handleTimeChange = time => {
    setTouched(true);
    setValue(time ? dayjs(time).format('HH:mm') : null);
  };

  const value = field.value
    ? typeof field.value === 'string'
      ? dayjs(`2000-01-01T${field.value}`)
      : field.value
    : null;

  const isErrorField = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}
      <div className="relative flex flex-col gap-1">
        <div
          className="border border-gray-200 pr-4 rounded-lg flex items-center justify-between"
          style={{ border: isErrorField ? '1px solid red' : undefined }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledTimePicker
              {...props}
              value={value}
              className="w-full"
              onChange={handleTimeChange}
              fullWidth
            />
          </LocalizationProvider>
        </div>
        {isErrorField && <p className="text-xs text-red-500">{meta.error}</p>}
      </div>
    </div>
  );
};

export default FormikTimePicker;
