"use client";

import { useField } from "formik";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

const StyledDateTimePicker = styled(DateTimePicker)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent",
      borderWidth: "0px",
      boxShadow: "none",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
      borderWidth: "0px",
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
      borderWidth: "0px",
      boxShadow: "none",
    },
  },
  "& .MuiInputBase-root": {
    padding: "0",
  },
  "& .MuiSelect-select": {
    fontSize: "16px",
    color: "#000000",
  },
  "& .MuiSvgIcon-root": {
    color: "#64748B",
    right: "12px",
  },
  "& .MuiInputBase-input": {
    color: "#000",
  },
}));

const FormikDateTimePicker = ({ label, required, Icon, ...props }) => {
  const [field, meta, helpers] = useField(props.name);
  const { setValue, setTouched } = helpers;

  const handleDateChange = (date) => {
    setTouched(true);
    setValue(date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : null);
  };

  const value = field.value ? 
    (typeof field.value === 'string' ? dayjs(field.value) : field.value) 
    : null;

  return (
    <div>
      {label && (
        <label className="text-xs sm:text-sm dark-color">
          {label} {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="border border-gray-200 pr-4 rounded-xl flex items-center justify-between">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledDateTimePicker
              {...props}
              value={value}
              className="w-full"
              onChange={handleDateChange}
              fullWidth
            />
          </LocalizationProvider>
        </div>

        {meta.touched && meta.error && (
          <p className="text-red-500 text-xs">{meta.error}</p>
        )}
      </div>
    </div>
  );
};

export default FormikDateTimePicker;
