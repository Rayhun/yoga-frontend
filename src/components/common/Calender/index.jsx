'use client';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers';
import { Popover } from '@mui/material';

const Calender = ({ value, onChnage, isPopover, open, handleClose, anchorEl, ...props }) => {

  const calender = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar value={value} onChange={onChnage} {...props} />
    </LocalizationProvider>
  );

  return isPopover ? (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      transformOrigin={{
        horizontal: 'center',
        vertical: 'top',
      }}
    >
      <div className="p-2">{calender}</div>
    </Popover>
  ) : (
    calender
  );
};

export default Calender;
