import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const DURATION_OPTIONS = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '9m', label: '9 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'custom', label: 'Custom' },
];

const validationSchema = Yup.object({
  start_date: Yup.date(),
  end_date: Yup.date(),
  status: Yup.string(),
});

const ListFilters = ({ onClose, onApplyFilter, selected, handleReset }) => {
  const initialValues = {
    duration: selected?.duration || '',
    start_date: selected?.start_date || '',
    end_date: selected?.end_date || '',
    status: selected?.status || '',
  };

  const getStartDate = (duration) => {
    const today = new Date();
    switch (duration) {
      case '1m':
        return new Date(today.setMonth(today.getMonth() - 1)).toISOString().slice(0, 10);
      case '3m':
        return new Date(today.setMonth(today.getMonth() - 3)).toISOString().slice(0, 10);
      case '6m':
        return new Date(today.setMonth(today.getMonth() - 6)).toISOString().slice(0, 10);
      case '9m':
        return new Date(today.setMonth(today.getMonth() - 9)).toISOString().slice(0, 10);
      case '1y':
        return new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().slice(0, 10);
      default:
        return '';
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    let payload = { ...values };

    if (values.duration !== 'custom') {
      const today = new Date();
      payload.end_date = today.toISOString().slice(0, 10);
      payload.start_date = getStartDate(values.duration);
    }

    onApplyFilter(payload);
    setSubmitting(false);
    onClose();
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, resetForm, values, handleChange }) => {
        return (
          <Form>
            <Box className="space-y-4">
              {/* Duration Dropdown */}
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel shrink={true}>Duration</InputLabel>
                <Select
                  name="duration"
                  value={values.duration}
                  onChange={handleChange}
                  label="Duration"
                  displayEmpty
                  sx={{ textAlign: 'left' }}
                >
                  {DURATION_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Custom Date Fields */}
              {values.duration === 'custom' && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <TextField
                      label="From"
                      name="start_date"
                      type="date"
                      fullWidth
                      value={values.start_date}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </div>
                  <div className="w-1/2">
                    <TextField
                      label="To"
                      name="end_date"
                      type="date"
                      fullWidth
                      value={values.end_date}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </div>
                </div>
              )}

              {/* Status Dropdown */}
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel shrink={true}>Status</InputLabel>
                <Select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  label="Status"
                  displayEmpty
                  sx={{ textAlign: 'left' }}
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  onClick={() => handleReset(resetForm)}
                  color="secondary"
                  type="button"
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Applying...' : 'Apply'}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ListFilters;
