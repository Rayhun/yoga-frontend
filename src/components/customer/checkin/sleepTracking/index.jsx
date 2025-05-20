'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { PiLightningLight, PiMoon } from 'react-icons/pi';
import { MdOutlineDateRange } from 'react-icons/md';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import Calender from '@/components/common/Calender';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrackerActivity, getTracker } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { toastApiError } from '@/utils/helpers';
import { toast } from 'react-toastify';

const ratings = [
  { label: 'Poor', icon: '😴', value: 'poor' },
  { label: 'Below Average', icon: '😟', value: 'below average' },
  { label: 'Average', icon: '😦', value: 'average' },
  { label: 'Good', icon: '😃', value: 'good' },
  { label: 'Excellent', icon: '☺️', value: 'excellent' },
];

const SleepTracker = () => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { isFetching, data: tracker } = useQuery({
    queryFn: getTracker,
    queryKey: [queryKeys.getTracker],
  });

  const { mutateAsync: createActivity } = useMutation({
    mutationFn: createTrackerActivity,
  });

  const trackerData = tracker?.data?.data || {};
  const initialValues = {
    selected_option: '',
    date: dayjs(),
  };

  const validationSchema = Yup.object({
    selected_option: Yup.string().required('Please select a rating'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createActivity({
        payload: { ...values, tracker: trackerData.id, date: dayjs(values.date).format('YYYY-MM-DD') },
      });
      toast.success('Activity updated successfully.');

      resetForm();

      await queryClient.invalidateQueries([
        {
          queryKey: [queryKeys.getTracker],
        },
      ]);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <LoadingWrapper isLoading={isFetching}>
        <div className="bg-green-600 text-white py-6 px-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center text-lg gap-2">
            <span className="text-lg">{trackerData?.icon || <PiMoon size={20} />}</span>
            <span className="font-semibold">{trackerData?.title}</span>
          </div>
          <span className="text-sm flex gap-1 text-lg font-bold">
            <PiLightningLight size={20} className="text-yellow-500" /> 0 day Streak
          </span>
        </div>
        <div className="bg-white rounded-b-xl p-6 shadow">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ setFieldValue, isSubmitting, errors, values }) => (
              <Form className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">{trackerData?.description}</h2>
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
                  {ratings.map(({ label, icon }, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setFieldValue('selected_option', `option_${index + 1}`);
                      }}
                      className={`rounded-xl py-10 px-2 flex flex-col items-center bg-gray-100 hover:bg-orange-100 transition ${
                        values.selected_option === `option_${index + 1}`
                          ? 'border-2 border-orange-300 bg-orange-100'
                          : ''
                      }`}
                    >
                      <span className="text-2xl">{trackerData[`option_${index + 1}_icon`] || icon}</span>
                      <span className="text-sm font-bold mt-1">
                        {trackerData[`option_${index + 1}_title`] || label}
                      </span>
                    </button>
                  ))}
                </div>

                {values.selected_option && (
                  <div className="bg-gray-100 text-lg font-bold text-orange-300 p-4 text-center rounded-xl capitalize mb-4">
                    {trackerData[`${values.selected_option}_description`] || 'No description available'}
                  </div>
                )}

                {errors.selected_option && (
                  <p className="text-sm text-red-500 mb-2">{errors.selected_option}</p>
                )}

                <Button
                  type="submit"
                  className="w-full !border-green-600 hover:!border-green-700 !bg-green-600 hover:!bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
                  size={'4xl'}
                  isLoading={isSubmitting}
                >
                  {`Save${dayjs(values.date).isSame(dayjs(), 'day') ? " Today's " : ' '}Rating`}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default SleepTracker;
