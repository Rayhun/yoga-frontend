'use client';

/**
 * Shared date + time picker (Calendly-style: calendar + time slots).
 * Used by GuidedExperienceForm and GroupCoachingForm.
 */
import { useField } from 'formik';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useScrollToFirstErrorField from './useScrollToFirstErrorField';

dayjs.extend(utc);

// 30-min slots for full 24 hours — 12:00 AM through 11:30 PM
const SLOT_MINUTES = [0, 30];

function buildTimeSlots() {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (const m of SLOT_MINUTES) {
      const label = dayjs().hour(h).minute(m).second(0).format('h:mm A');
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

const FormikDateTimePicker = ({ label, required, minDate, ...props }) => {
  const [field, meta, helpers] = useField(props.name);
  const { setValue, setTouched } = helpers;
  const containerRef = useScrollToFirstErrorField(props.name);

  const parsed = field.value
    ? typeof field.value === 'string'
      ? dayjs.utc(field.value)
      : field.value
    : null;
  const selectedDate = parsed ? parsed.startOf('day') : null;
  const selectedTimeValue = parsed
    ? `${String(parsed.hour()).padStart(2, '0')}:${String(parsed.minute()).padStart(2, '0')}`
    : null;

  const handleDateChange = (date) => {
    setTouched(true);
    if (!date) {
      setValue('');
      return;
    }
    const dateStr = date.format('YYYY-MM-DD');
    const time = selectedTimeValue || '09:00';
    setValue(dayjs.utc(`${dateStr}T${time}:00`).format('YYYY-MM-DDTHH:mm:ss[Z]'));
  };

  const handleTimeSlotClick = (slotValue) => {
    setTouched(true);
    const date = selectedDate || dayjs().startOf('day');
    const dateStr = date.format('YYYY-MM-DD');
    setValue(dayjs.utc(`${dateStr}T${slotValue}:00`).format('YYYY-MM-DDTHH:mm:ss[Z]'));
  };

  const minDateEffective = minDate ?? dayjs().startOf('day');
  const isErrorField = meta.touched && meta.error;

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      {label ? (
        <label
          className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      ) : null}
      <div
        className={`rounded-xl border bg-white dark:bg-gray-800/50 dark:border-gray-700 overflow-hidden ${
          isErrorField ? 'border-red-400 dark:border-red-500' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Calendar — Calendly-style: month view, pick a day */}
          <div className="border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 p-2 sm:p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 pb-2">
              Pick a date
            </p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                minDate={minDateEffective}
                disablePast
                sx={{
                  '& .MuiPickersCalendarHeader-root': { mt: 0 },
                  '& .MuiDayCalendar-header': { color: 'text.secondary' },
                  '& .MuiPickersDay-root': { fontSize: '0.875rem' },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Time slots — Calendly-style: click a time, no typing */}
          <div className="p-3 flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 pb-2">
              Pick a time
            </p>
            {!selectedDate ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                Select a date first, then choose a time.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[280px] overflow-y-auto">
                {TIME_SLOTS.map(({ label, value }) => {
                  const isSelected = selectedTimeValue === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleTimeSlotClick(value)}
                      className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors border ${
                        isSelected
                          ? 'bg-green-600 border-green-600 text-white ring-2 ring-green-600/20'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected summary — one clear line like Calendly */}
        {selectedDate && selectedTimeValue && (
          <div className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Event time:</span>{' '}
              {dayjs.utc(field.value).format('dddd, MMMM D, YYYY [at] h:mm A')}
            </p>
          </div>
        )}
      </div>
      {isErrorField && <p className="text-xs text-red-500 mt-1">{meta.error}</p>}
    </div>
  );
};

export default FormikDateTimePicker;
