'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { PiLightningLight, PiMoon } from 'react-icons/pi';
import { MdOutlineDateRange } from 'react-icons/md';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import Calender from '@/components/common/Calender';
import { useState } from 'react';

const ratings = [
  { label: 'Poor', icon: '😴', value: 'poor' },
  { label: 'Below Average', icon: '😟', value: 'below average' },
  { label: 'Average', icon: '😦', value: 'average' },
  { label: 'Good', icon: '😃', value: 'good' },
  { label: 'Excellent', icon: '☺️', value: 'excellent' },
];

const SleepTracker = () => {
  const [open, setOpen] = useState(false);

  const initialValues = {
    rating: '',
    date: dayjs(),
  };

  const validationSchema = Yup.object({
    rating: Yup.string().required('Please select a rating'),
  });

  const handleSubmit = values => {
    console.log('Sleep Rating:', values);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-green-600 text-white py-6 px-4 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center text-lg gap-2">
          <PiMoon size={20} />
          <span className="font-semibold">Sleep Quality Tracker</span>
        </div>
        <span className="text-sm flex gap-1 text-lg font-bold">
          <PiLightningLight size={20} className="text-yellow-500" /> 0 day Streak
        </span>
      </div>
      <div className="bg-white rounded-b-xl p-6 shadow">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ setFieldValue, touched, errors, values }) => (
            <Form className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">How did you sleep?</h2>
                <p
                  className="text-md font-medium text-green-600 flex items-center gap-1 cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <MdOutlineDateRange size={18} /> Change Date
                </p>
                <Calender
                  value={values.date}
                  onChange={date => {
                    setFieldValue('date', date);
                    handleClose();
                  }}
                  isPopover={true}
                  open={open}
                  handleClose={handleClose}
                />
              </div>
              <p className="text-md font-medium text-green-600 mb-4 flex items-center gap-1">
                {dayjs(values.date).format('dddd MMMM D')}
                {dayjs(values.date).isSame(dayjs(), 'day') ? ' (Today)' : ''}
              </p>
              <div className="grid grid-cols-5 gap-3 mb-10">
                {ratings.map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setFieldValue('rating', label);
                    }}
                    className={`rounded-xl py-10 px-2 flex flex-col items-center bg-gray-100 hover:bg-orange-100 transition ${
                      values.rating === label ? 'border-2 border-orange-300 bg-orange-100' : ''
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-bold mt-1">{label}</span>
                  </button>
                ))}
              </div>

              {values.rating && (
                <div className="bg-gray-100 text-lg font-bold text-orange-300 p-4 text-center rounded-xl capitalize mb-4">
                  {values.rating} Sleep
                </div>
              )}

              {touched.rating && errors.rating && (
                <p className="text-sm text-red-500 mb-2">{errors.rating}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow"
                size={'xl'}
              >
                Save Today’s Rating
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SleepTracker;
