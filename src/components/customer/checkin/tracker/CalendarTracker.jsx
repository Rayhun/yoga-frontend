'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getTrackerInfo, getPeriodGoal, createPeriodGoal, updatePeriodGoal } from '@/services/private/customer/goal';
import { useRouter } from 'next/navigation';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const CycleDayCard = ({ cycleInfo }) => {
  if (!cycleInfo) {
    return (
      <Section>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 border-2 border-gray-300 rounded-full flex flex-col items-center justify-center bg-gray-50">
              <span className="text-xs font-medium text-gray-500">Day</span>
              <span className="text-2xl font-bold text-gray-400">--</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Cycle Data</h3>
            <p className="text-gray-500">Start tracking your cycle to see insights</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex items-center gap-6">
        {/* Circular Day Indicator */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 border-2 border-green-500 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <span className="text-xs font-medium text-gray-600">Day</span>
            <span className="text-2xl font-bold text-green-700">{cycleInfo.day}</span>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cycleInfo.title}</h3>
          <div className="space-y-1">
            <p className="text-gray-700">
              {cycleInfo.estimated}
            </p>
            <p className="text-green-600 font-medium">
              Current phase: {cycleInfo.current_phase}
            </p>
            <p className="text-gray-700">
              Last Period: {cycleInfo.last_day ? cycleInfo.last_day : 'Not recorded'}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </Section>
  );
};

const CalendarTracker = () => {
  const router = useRouter();
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [trackerData, setTrackerData] = useState(null);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationTimer, setNotificationTimer] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Show notification function
  const showNotification = useCallback((message, type = 'success') => {
    console.log('Showing notification:', { message, type });
    
    // Clear any existing timer
    if (notificationTimer) {
      clearInterval(notificationTimer);
    }
    
    setNotification({ message, type, progress: 100 });
    setIsHovered(false);
    setIsPaused(false);
    
    // Start countdown timer
    let progress = 100;
    const timer = setInterval(() => {
      if (!isPaused) {
        progress -= 2.5; // 4 seconds = 100% / 40 intervals of 100ms
        setNotification(prev => prev ? { ...prev, progress } : null);
        
        if (progress <= 0) {
          clearInterval(timer);
          setNotification(null);
          setNotificationTimer(null);
        }
      }
    }, 100);
    
    setNotificationTimer(timer);
    
    // Fallback timeout
    setTimeout(() => {
      clearInterval(timer);
      setNotification(null);
      setNotificationTimer(null);
    }, 4000);
  }, [notificationTimer, isPaused]);

  // Fetch tracker data and existing period data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tracker configuration
        const trackerResponse = await getTrackerInfo();
        if (trackerResponse.data.status === 'success') {
          const data = trackerResponse.data.data;
          setTrackerData(data.page_info);
          setCycleInfo(data.cycle_info);
        }

        // Fetch existing period data for current month
        // Backend now sorts by period_start (ascending - first dates first), then period_end, then created_at
        const periodResponse = await getPeriodGoal(currentMonth);
        if (periodResponse.data.status === 'success' && periodResponse.data.data.length > 0) {
          const existingPeriod = periodResponse.data.data[0];
          setExistingData(existingPeriod);
          
          // Populate form with existing data
          setPeriodStart(existingPeriod.period_start);
          setPeriodEnd(existingPeriod.period_end);
          
          showNotification('Existing data loaded successfully!', 'success');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tracker data');
        showNotification('Failed to load tracker data. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  // Handle date selection
  const handleDateChange = useCallback((date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const clickedDate = dayjs(formattedDate);
    
    // Validation: Cannot select future dates
    if (clickedDate.isAfter(dayjs(), 'day')) {
      showNotification('Cannot select future dates. Please select a date today or in the past.', 'error');
      return;
    }
    
    if (!periodStart) {
      setPeriodStart(formattedDate);
      setPeriodEnd(null);
    } else if (periodStart && !periodEnd) {
      const startDate = dayjs(periodStart);
      
      if (clickedDate.isSame(startDate, 'day')) {
        setPeriodStart(null);
        setPeriodEnd(null);
      } else if (clickedDate.isBefore(startDate)) {
        setPeriodStart(formattedDate);
        setPeriodEnd(periodStart);
      } else {
        setPeriodEnd(formattedDate);
      }
    } else {
      setPeriodStart(formattedDate);
      setPeriodEnd(null);
    }
  }, [periodStart, periodEnd, showNotification]);

  // Get selected dates array
  const getSelectedDates = useMemo(() => {
    if (!periodStart) return [];
    if (!periodEnd) return [periodStart];
    
    const dates = [];
    const start = dayjs(periodStart);
    const end = dayjs(periodEnd);
    let current = start;
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }
    return dates;
  }, [periodStart, periodEnd]);

  // Save tracker data
  const handleSave = useCallback(async () => {
    if (!periodStart) {
      alert('Please select at least a start date for your period.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        period_start: periodStart,
        tracker_name: trackerData?.tracker_name || cycleInfo?.tracker_name || 'Cycle'
      };
      
      // Only include period_end if it's selected
      if (periodEnd) {
        payload.period_end = periodEnd;
      }

      let response;
      // Create new data
      response = await createPeriodGoal(payload);
      
      if (response.data.status === 'success') {
        const action = existingData ? 'updated' : 'saved';
        console.log('Success response:', response.data);
        showNotification(`Calendar data ${action} successfully!`, 'success');
        
        // Update existing data with the response data
        if (response.data.data) {
          setExistingData(response.data.data);
        }
        
        // Refresh data to get updated information
        // Backend now sorts by period_start (ascending - first dates first), then period_end, then created_at
        const periodResponse = await getPeriodGoal(currentMonth);
        if (periodResponse.data.status === 'success' && periodResponse.data.data.length > 0) {
          // Get the most recent record (first in sorted list by period_start)
          setExistingData(periodResponse.data.data[0]);
          setPeriodStart(periodResponse.data.data[0].period_start);
          setPeriodEnd(periodResponse.data.data[0].period_end);
        }
        
        // Reload tracker data to get updated information
        try {
          const trackerResponse = await getTrackerInfo();
          if (trackerResponse.data.status === 'success') {
            const data = trackerResponse.data.data;
            setTrackerData(data.page_info);
            setCycleInfo(data.cycle_info);
          }
        } catch (reloadError) {
          console.error('Error reloading tracker data:', reloadError);
        }
      } else {
        throw new Error(response.data.message || 'Failed to save tracker data');
      }
    } catch (err) {
      console.error('Error saving tracker data:', err);
      showNotification('Failed to save tracker data. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [periodStart, periodEnd, trackerData, existingData, currentMonth]);

  // Handle month navigation
  const handleMonthChange = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
    // Clear current form data when changing months
    setPeriodStart(null);
    setPeriodEnd(null);
    setExistingData(null);
  }, []);

  const renderDay = useCallback((day, _value, props) => {
    const selectedDates = getSelectedDates;
    const dayFormatted = day.format('YYYY-MM-DD');
    const isSelected = selectedDates.includes(dayFormatted);
    
    // Check if this day is outside the current viewing month
    const isCurrentMonth = !props.outsideCurrentMonth;
    const isOtherMonth = props.outsideCurrentMonth;
    
    // Check if this is a future date - disable future dates
    const isFutureDate = dayjs(dayFormatted).isAfter(dayjs(), 'day');
    
    // Determine if this is a start/end date or a mid-day
    const isStartDate = periodStart && dayFormatted === periodStart;
    const isEndDate = periodEnd && dayFormatted === periodEnd;
    const isMidDay = isSelected && !isStartDate && !isEndDate;
    
    // Set colors and border radius based on date type
    let backgroundColor = 'transparent';
    let textColor = isOtherMonth ? '#d1d5db' : '#374151';
    let fontWeight = 500;
    let borderRadius = '50%'; // Default circular
    
    if (isSelected && isCurrentMonth) {
      if (isStartDate) {
        backgroundColor = '#dc2626'; // Red for start date
        textColor = '#ffffff';
        fontWeight = 600;
        borderRadius = '50% 0 0 50%'; // Rounded left, straight right
      } else if (isEndDate) {
        backgroundColor = '#dc2626'; // Red for end date
        textColor = '#ffffff';
        fontWeight = 600;
        borderRadius = '0 50% 50% 0'; // Straight left, rounded right
      } else if (isMidDay) {
        backgroundColor = '#fce7f3'; // Light pink for mid-days
        textColor = '#374151';
        fontWeight = 500;
        borderRadius = '0'; // Rectangular
      }
    }
    
    return (
      <div
        {...props}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
          color: textColor,
          fontSize: '0.875rem',
          fontWeight: fontWeight,
          cursor: (isCurrentMonth && !isFutureDate) ? 'pointer' : 'not-allowed',
          border: 'none',
          margin: '2px',
          transition: 'all 0.3s ease',
          opacity: (isOtherMonth || isFutureDate) ? 0.4 : 1,
          boxShadow: (isStartDate || isEndDate) && isCurrentMonth && !isFutureDate ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
          pointerEvents: (isCurrentMonth && !isFutureDate) ? 'auto' : 'none',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isCurrentMonth && !isFutureDate) {
            handleDateChange(day);
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected && isCurrentMonth && !isFutureDate) {
            e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            e.target.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected && isCurrentMonth && !isFutureDate) {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'scale(1)';
          }
        }}
      >
        {day.date()}
        {/* Add icons for start/end dates */}
        {(isStartDate || isEndDate) && isCurrentMonth && (
          <div
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              width: '14px',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              backgroundColor: isStartDate ? '#10b981' : '#ef4444', // Green circle for start, red circle for end
              color: '#ffffff', // White text for both start and end
              fontWeight: 'bold',
              borderRadius: '50%', // Circle for both start and end
              zIndex: 10,
            }}
          >
            {isStartDate ? 'S' : 'E'}
          </div>
        )}
      </div>
    );
  }, [getSelectedDates, handleDateChange, periodStart, periodEnd]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 min-h-screen p-4">
        <Section>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </Section>
        <Section>
          <div className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </Section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tracker</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render with API data
  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center text-xl gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
             <div>
               <h1 className="font-bold text-2xl">Track {trackerData?.tracker_name || cycleInfo?.tracker_name || 'Cycle'} - Calendar</h1>
               <p className="text-green-100 text-sm">Monitor your cycle dates and track patterns</p>
             </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Calendar View</span>
            </div>
            <p className="text-green-100 text-sm">Track your periods</p>
          </div>
        </div>
      </div>

      {/* Cycle Day Card */}
      <div className="mt-8">
        <CycleDayCard cycleInfo={cycleInfo} />
      </div>

      {/* Calendar Section */}
      <Section className="mt-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            </div>
            Calendar
          </h3>
          <p className="text-gray-600">Select your period dates to track your cycle</p>
        </div>
        <div className="calendar-container" style={{ overflow: 'visible', paddingBottom: '20px', minHeight: '480px' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
            key={`${periodStart}-${periodEnd}-${currentMonth}`}
            value={dayjs(currentMonth)}
            slots={{
              day: (props) => renderDay(props.day, null, props)
            }}
            onChange={handleDateChange}
            onMonthChange={(newMonth) => handleMonthChange(newMonth.format('YYYY-MM'))}
            shouldDisableDate={(date) => dayjs(date).isAfter(dayjs(), 'day')}
            showDaysOutsideCurrentMonth={true}
            fixedWeekNumber={6}
            displayStaticWrapperAs="desktop"
            sx={{
              width: '100%',
              minHeight: '440px',
              '& .MuiPickersCalendarHeader-root': {
                paddingLeft: 2,
                paddingRight: 2,
                marginTop: 0,
                marginBottom: 2,
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              '& .MuiPickersCalendarHeader-labelContainer': {
                order: 2,
                margin: 0,
              },
              '& .MuiPickersCalendarHeader-label': {
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#374151',
                margin: 0,
              },
              '& .MuiPickersArrowSwitcher-root': {
                order: 1,
              },
              '& .MuiPickersArrowSwitcher-root:last-child': {
                order: 3,
              },
              '& .MuiIconButton-root': {
                padding: '8px',
                color: '#6b7280',
                fontSize: '1.2rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              },
              '& .MuiDayCalendar-header': {
                justifyContent: 'space-around',
                marginBottom: 1,
                paddingLeft: 1,
                paddingRight: 1,
              },
              '& .MuiDayCalendar-weekDayLabel': {
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: 500,
                width: '40px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              '& .MuiPickersDay-root': {
                fontSize: '0.875rem',
                fontWeight: 500,
                width: '40px',
                height: '40px',
                margin: '2px',
                color: '#374151',
                backgroundColor: 'transparent !important',
                cursor: 'pointer',
                '&.Mui-selected': {
                  backgroundColor: 'transparent !important',
                  color: '#374151',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
                },
                '&.MuiPickersDay-today': {
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  color: '#374151',
                  fontWeight: '500 !important',
                },
              },
              '& .MuiPickersCalendarHeader-switchViewButton': {
                display: 'none',
              },
              '& .MuiDayCalendar-weekContainer': {
                justifyContent: 'space-around',
                marginBottom: 1,
                paddingLeft: 1,
                paddingRight: 1,
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDayCalendar-slideTransition': {
                minHeight: '380px',
                paddingBottom: 3,
                overflow: 'visible',
              },
              '& .MuiPickersSlideTransition-root': {
                overflow: 'visible',
                minHeight: '380px',
              },
              '& .MuiDayCalendar-root': {
                minHeight: '380px',
              },
              '& .MuiPickersDay-root.MuiPickersDay-dayOutsideMonth': {
                color: '#d1d5db !important',
                opacity: 0.4,
                cursor: 'default',
              },
              '& .MuiPickersDay-root.MuiPickersDay-dayOutsideMonth:hover': {
                backgroundColor: 'transparent !important',
              },
              '& .MuiDayCalendar-monthContainer': {
                minHeight: '380px',
              },
              '& .MuiDayCalendar-weekContainer:last-child': {
                marginBottom: 0,
              },
            }}
            />
          </LocalizationProvider>
        </div>
        
        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-600 rounded-full shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Period Start/End</span>
              </div>
          <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-pink-200 rounded-full shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Period Days</span>
              </div>
            </div>
            {(periodStart || periodEnd) && (
              <button
                onClick={() => {
                  setPeriodStart(null);
                  setPeriodEnd(null);
                }}
                className="text-green-500 hover:text-green-600 text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-center items-center mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !periodStart}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
            saving || !periodStart
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            periodEnd ? 'Save Calendar Data' : 'Save Start Date'
          )}
        </button>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">📅</span>
            </div>
            <h3 className="font-bold text-gray-800">Track Patterns</h3>
          </div>
          <p className="text-gray-600 text-sm">Monitor your cycle patterns and identify trends over time for better health insights.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">📊</span>
            </div>
            <h3 className="font-bold text-gray-800">Visual Tracking</h3>
          </div>
          <p className="text-gray-600 text-sm">See your cycle at a glance with our intuitive calendar interface.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 text-lg">💡</span>
            </div>
            <h3 className="font-bold text-gray-800">Easy Navigation</h3>
          </div>
          <p className="text-gray-600 text-sm">Navigate between calendar and daily tracking for comprehensive cycle monitoring.</p>
        </div>
      </div>

      {/* Interactive Notification Toast */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-[9999] transform transition-all duration-500 ease-out cursor-pointer group ${
            isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
          } ${
            notification.type === 'success' 
              ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500' 
              : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
          }`}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 9999,
            minWidth: '320px',
            maxWidth: '420px',
            borderRadius: '16px',
            boxShadow: isHovered ? `
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            ` : `
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={() => {
            setIsHovered(true);
            setIsPaused(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPaused(false);
          }}
          onClick={() => {
            // Click to dismiss
            if (notificationTimer) {
              clearInterval(notificationTimer);
              setNotificationTimer(null);
            }
            setNotification(null);
          }}
        >
          {/* Interactive Timer Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-t-2xl overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ease-linear ${
                isPaused ? 'opacity-50' : 'opacity-100'
              } ${
                notification.type === 'success' 
                  ? 'bg-gradient-to-r from-green-300 to-green-400' 
                  : 'bg-gradient-to-r from-red-300 to-red-400'
              }`}
              style={{ width: `${notification.progress}%` }}
            />
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="px-6 py-4 pt-5 flex items-center gap-4">
            {/* Animated Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
            } ${
              notification.type === 'success' 
                ? 'bg-white bg-opacity-20 shadow-green-200 group-hover:bg-opacity-30' 
                : 'bg-white bg-opacity-20 shadow-red-200 group-hover:bg-opacity-30'
            }`}>
              {notification.type === 'success' ? (
                <svg className={`w-5 h-5 text-white drop-shadow-sm transition-all duration-300 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 text-white drop-shadow-sm transition-all duration-300 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            
            {/* Message with hover effects */}
            <div className="flex-1">
              <p className={`text-white font-semibold text-sm leading-tight drop-shadow-sm transition-all duration-300 ${
                isHovered ? 'text-base' : 'text-sm'
              }`}>
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white text-xs opacity-80">
                  {isPaused ? 'Paused' : `${Math.round(notification.progress / 25)}s remaining`}
                </p>
                {isPaused && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (notificationTimer) {
                  clearInterval(notificationTimer);
                  setNotificationTimer(null);
                }
                setNotification(null);
              }}
              className={`w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 ${
                isHovered ? 'scale-110 bg-opacity-30' : 'scale-100'
              } hover:scale-125 hover:rotate-90`}
            >
              <svg className="w-4 h-4 text-white transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
            </button>
          </div>
          
          {/* Animated Bottom Glow */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-transparent via-green-300 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-red-300 to-transparent'
          } ${isHovered ? 'opacity-80' : 'opacity-50'}`} />
          
          {/* Hover Indicator */}
          {isHovered && (
            <div className="absolute inset-0 rounded-2xl border-2 border-white border-opacity-30 pointer-events-none animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarTracker;
