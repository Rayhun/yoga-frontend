import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'profile_complete', label: 'Profile Completed' },
  { value: 'has_event_or_consult', label: 'Has Event/Consult' },
];

const EXPERT_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

const validationSchema = Yup.object({
  is_active: Yup.boolean(),
  status: Yup.string(),
  start_date: Yup.date(),
  end_date: Yup.date(),
});

const ListFilters = ({ onClose, onApplyFilter, selected, handleReset }) => {
  const initialValues = {
    is_active: selected?.is_active ?? '',
    status: selected?.status || '',
    start_date: selected?.start_date || '',
    end_date: selected?.end_date || '',
  };


  const handleSubmit = (values, { setSubmitting }) => {
    onApplyFilter(values);
    setSubmitting(false);
    onClose();
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, resetForm, values, handleChange }) => {
        return (
          <Form>
            <Box className="space-y-4">
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel shrink={true}>Active Status</InputLabel>
                <Select
                  name="is_active"
                  value={values.is_active}
                  onChange={handleChange}
                  label="Active Status"
                  displayEmpty
                  sx={{ textAlign: 'left' }}
                >
                  {EXPERT_STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
