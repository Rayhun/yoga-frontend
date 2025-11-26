'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { PiLightningLight, PiMoon } from 'react-icons/pi';
import { MdOutlineDateRange } from 'react-icons/md';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import Calender from '@/components/common/Calender';
import { useState, useRef, useEffect } from 'react';
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
  const buttonRef = useRef(null);

  const queryClient = useQueryClient();

  const { isFetching, data: tracker } = useQuery({
    queryFn: getTracker,
    queryKey: [queryKeys.getTracker],
  });

  const { mutateAsync: createActivity } = useMutation({
    mutationFn: createTrackerActivity,
  });

  const trackerData = tracker?.data?.data?.tracker || {};
  const streak = tracker?.data?.data?.streak?.current_streak || 0;

  const initialValues = {
    selected_option: '',
    date: dayjs(),
  };

  const validationSchema = Yup.object({
    selected_option: Yup.string(),
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

  // Component to load existing data when date changes
  const LoadExistingData = ({ date, setFieldValue, trackerData, tracker }) => {
    useEffect(() => {
      if (!date || !trackerData?.id) return;

      try {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        
        // Use existing tracker query data to find activity for the selected date
        const activities = tracker?.data?.data?.activities || [];
        const activityForDate = activities.find(
          activity => dayjs(activity.date).format('YYYY-MM-DD') === dateStr
        );
        
        if (activityForDate) {
          // Populate form with existing data
          setFieldValue('selected_option', activityForDate.selected_option || '');
        } else {
          // No existing data, reset to default
          setFieldValue('selected_option', '');
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
        // On error, reset to default
        setFieldValue('selected_option', '');
      }
    }, [date, trackerData?.id, setFieldValue, tracker]);

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <LoadingWrapper isLoading={isFetching}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center text-xl gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">{trackerData?.icon || <PiMoon size={24} />}</span>
              </div>
              <div>
                <h1 className="font-bold text-2xl">{trackerData?.title}</h1>
                <p className="text-green-100 text-sm">Track your {trackerData?.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
                <PiLightningLight size={24} className="animate-pulse" />
                <span>{streak} day streak</span>
              </div>
              <p className="text-green-100 text-sm">Keep it going!</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ setFieldValue, isSubmitting, errors, values, touched }) => (
              <>
                <LoadExistingData date={values.date} setFieldValue={setFieldValue} trackerData={trackerData} tracker={tracker} />
                <Form className="flex flex-col gap-6">
                {/* Description and Date Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{trackerData?.description}</h2>
                      {/* <p className="text-gray-600">How did you sleep last night?</p> */}
                    </div>
                    <div className="relative">
                      <button
                        ref={buttonRef}
                        type="button"
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                        onClick={() => setOpen(true)}
                      >
                        <MdOutlineDateRange size={18} /> Change Date
                      </button>
                      <Calender
                        value={values.date}
                        onChnage={date => {
                          setFieldValue('date', date);
                          handleClose();
                        }}
                        isPopover={true}
                        open={open}
                        handleClose={handleClose}
                        anchorEl={buttonRef.current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-lg">
                      {dayjs(values.date).format('dddd, MMMM D')}
                      {dayjs(values.date).isSame(dayjs(), 'day') ? ' (Today)' : ''}
                    </span>
                  </div>
                </div>
                {/* Rating Options */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                  {ratings.map(({ label, icon }, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setFieldValue('selected_option', `option_${index + 1}`);
                      }}
                      className={`group relative rounded-2xl py-8 px-3 flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${
                        values.selected_option === `option_${index + 1}`
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`text-3xl mb-2 transition-transform duration-300 ${
                        values.selected_option === `option_${index + 1}` ? 'scale-110' : 'group-hover:scale-110'
                      }`}>
                        {trackerData[`option_${index + 1}_icon`] || icon}
                      </div>
                      <span className={`text-sm font-bold text-center leading-tight ${
                        values.selected_option === `option_${index + 1}` ? 'text-white' : 'text-gray-700'
                      }`}>
                        {trackerData[`option_${index + 1}_title`] || label}
                      </span>
                      {values.selected_option === `option_${index + 1}` && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Selected Option Description */}
                {values.selected_option && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">💤</span>
                      </div>
                      <h3 className="text-lg font-bold text-green-800">{trackerData?.title}</h3>
                    </div>
                    <p className="text-green-700 font-medium capitalize">
                      {trackerData[`${values.selected_option}_description`] || trackerData[`${values.selected_option}_title`]}
                    </p>
                  </div>
                )}


                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size={'4xl'}
                  isLoading={isSubmitting}
                  disabled={!values.selected_option || isSubmitting}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>💾</span>
                    {`Save${dayjs(values.date).isSame(dayjs(), 'day') ? " Today's " : ' '}${trackerData?.title}`}
                  </div>
                </Button>
              </Form>
              </>
            )}
          </Formik>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">📊</span>
              </div>
              <h3 className="font-bold text-gray-800">Track Progress</h3>
            </div>
            <p className="text-gray-600 text-sm">Monitor your sleep patterns over time to identify trends and improve your rest.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800">Set Goals</h3>
            </div>
            <p className="text-gray-600 text-sm">Aim for consistent sleep quality to build healthy habits and improve your well-being.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-lg">💡</span>
              </div>
              <h3 className="font-bold text-gray-800">Get Insights</h3>
            </div>
            <p className="text-gray-600 text-sm">Receive personalized tips and recommendations based on your sleep tracking data.</p>
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default SleepTracker;
