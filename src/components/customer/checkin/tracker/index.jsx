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

  const userStatus = cycleInfo.user_status;
  const recommendations = cycleInfo.recommendations;

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
            {userStatus && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  userStatus.period_status === 'normal' ? 'bg-green-500' : 
                  userStatus.period_status === 'irregular' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {userStatus.period_message}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.next_actions && recommendations.next_actions.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.next_actions.map((action, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
};

const Tracker = () => {
  const router = useRouter();
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [trackerData, setTrackerData] = useState(null);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [allMonthData, setAllMonthData] = useState([]); // Store all period data for the month
  const [selectedRecordId, setSelectedRecordId] = useState(null); // Track which record is selected for update
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

  // Fetch tracker configuration (only once on component mount)
  useEffect(() => {
    const fetchTrackerConfig = async () => {
      try {
        setLoading(true);
        
        // Fetch tracker configuration
        const trackerResponse = await getTrackerInfo();
        if (trackerResponse.data.status === 'success') {
          const data = trackerResponse.data.data;
          setTrackerData(data.page_info);
          setCycleInfo(data.cycle_info);
        }
      } catch (err) {
        console.error('Error fetching tracker config:', err);
        setError('Failed to load tracker configuration');
        showNotification('Failed to load tracker configuration. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerConfig();
  }, []); // Empty dependency array - only run once on mount

  // Fetch existing period data when month changes
  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        setLoading(true);
        
        // Fetch existing period data for current month
        const periodResponse = await getPeriodGoal(currentMonth);
        if (periodResponse.data.status === 'success' && periodResponse.data.data.length > 0) {
          const monthData = periodResponse.data.data;
          setAllMonthData(monthData);
          
          // Clear form for new entry by default
          setExistingData(null);
          setSelectedRecordId(null);
          setPeriodStart(null);
          setPeriodEnd(null);
          
          showNotification(`${monthData.length} existing record(s) found for this month!`, 'success');
        } else {
          // No existing data for this month, clear everything
          setAllMonthData([]);
          setExistingData(null);
          setSelectedRecordId(null);
          setPeriodStart(null);
          setPeriodEnd(null);
        }
      } catch (err) {
        console.error('Error fetching month data:', err);
        setError('Failed to load data for this month');
        showNotification('Failed to load data for this month. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch month data if tracker config is loaded
    if (trackerData) {
      fetchMonthData();
    }
  }, [currentMonth, trackerData]); // Depend on currentMonth and trackerData

  // Handle date selection
  const handleDateChange = useCallback((date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const clickedDate = dayjs(formattedDate);
    
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
  }, [periodStart, periodEnd]);

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
        period_end: periodEnd,
        symptom_levels: {},
        selected_symptoms: [],
        tracker_name: trackerData?.tracker_name || cycleInfo?.tracker_name || 'Cycle'
      };

      let response;
      if (existingData && selectedRecordId) {
        // Update existing data
        response = await updatePeriodGoal(existingData.id, payload);
      } else {
        // Create new data
        response = await createPeriodGoal(payload);
      }
      
      if (response.data.status === 'success') {
        const action = (existingData && selectedRecordId) ? 'updated' : 'saved';
        console.log('Success response:', response.data);
        showNotification(`Calendar data ${action} successfully!`, 'success');
        
        // Update existing data with the response data
        if (response.data.data) {
          setExistingData(response.data.data);
        }
        
        // Refresh data to get updated information for current month
        const periodResponse = await getPeriodGoal(currentMonth);
        if (periodResponse.data.status === 'success' && periodResponse.data.data.length > 0) {
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
    // The useEffect will handle loading existing data for the new month
  }, []);

  // Handle record selection for update
  const handleRecordSelect = useCallback((record) => {
    setSelectedRecordId(record.id);
    setExistingData(record);
    setPeriodStart(record.period_start);
    setPeriodEnd(record.period_end);
    showNotification(`Selected record for update: ${record.period_start} to ${record.period_end}`, 'success');
  }, []);

  // Handle new record creation
  const handleNewRecord = useCallback(() => {
    setSelectedRecordId(null);
    setExistingData(null);
    setPeriodStart(null);
    setPeriodEnd(null);
    showNotification('Creating new record...', 'success');
  }, []);

  const renderDay = useCallback((day, _value, props) => {
    const selectedDates = getSelectedDates;
    const dayFormatted = day.format('YYYY-MM-DD');
    const isSelected = selectedDates.includes(dayFormatted);
    
    // Check if this day is outside the current viewing month
    const isCurrentMonth = !props.outsideCurrentMonth;
    const isOtherMonth = props.outsideCurrentMonth;
    
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
          cursor: isCurrentMonth ? 'pointer' : 'not-allowed',
          border: 'none',
          margin: '2px',
          transition: 'all 0.3s ease',
          opacity: isOtherMonth ? 0.4 : 1,
          boxShadow: (isStartDate || isEndDate) && isCurrentMonth ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
          pointerEvents: isCurrentMonth ? 'auto' : 'none',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isCurrentMonth) {
            handleDateChange(day);
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected && isCurrentMonth) {
            e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            e.target.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected && isCurrentMonth) {
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
               <h1 className="font-bold text-2xl">Track {trackerData?.tracker_name || cycleInfo?.tracker_name || 'Cycle'}</h1>
               <p className="text-green-100 text-sm">
                 {cycleInfo?.user_status?.action_required === 'resume_tracking' 
                   ? 'Resume tracking your cycle and symptoms'
                   : 'Monitor your cycle dates and track patterns'
                 }
               </p>
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

      {/* Existing Records Section */}
      {allMonthData.length > 0 && (
        <Section className="mt-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Period Records</h3>
                  <p className="text-gray-600">{dayjs(currentMonth).format('MMMM YYYY')} • {allMonthData.length} record{allMonthData.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={handleNewRecord}
                className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  !selectedRecordId
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-xl'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm">{!selectedRecordId ? '✓ Creating New Record' : 'Create New Record'}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {allMonthData.map((record, index) => (
              <div
                key={record.id}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  selectedRecordId === record.id
                    ? 'ring-4 ring-emerald-200 shadow-2xl scale-105'
                    : 'shadow-lg hover:shadow-2xl'
                }`}
                onClick={() => handleRecordSelect(record)}
                style={{
                  background: selectedRecordId === record.id
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-current rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-current rounded-full"></div>
                </div>
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {/* <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedRecordId === record.id
                          ? 'bg-white bg-opacity-20'
                          : 'bg-gradient-to-br from-emerald-500 to-green-600'
                      }`}>
                        <span className={`text-sm font-bold ${
                          selectedRecordId === record.id ? 'text-white' : 'text-white'
                        }`}>
                          #{record.id}
                        </span>
                      </div> */}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedRecordId === record.id
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {dayjs(record.period_start).format('MMM DD')}
                      </div>
                    </div>
                    
                    {selectedRecordId === record.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Period Dates */}
                  <div className="mb-4">
                    <div className={`text-lg font-bold mb-1 ${
                      selectedRecordId === record.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {dayjs(record.period_start).format('MMM DD')} - {dayjs(record.period_end).format('MMM DD')}
                    </div>
                    <div className={`text-sm ${
                      selectedRecordId === record.id ? 'text-white text-opacity-80' : 'text-gray-600'
                    }`}>
                      {dayjs(record.period_end).diff(dayjs(record.period_start), 'days') + 1} day{dayjs(record.period_end).diff(dayjs(record.period_start), 'days') !== 0 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Symptoms */}
                  {/* <div className="mb-4">
                    <div className={`text-sm font-medium mb-2 ${
                      selectedRecordId === record.id ? 'text-white text-opacity-90' : 'text-gray-700'
                    }`}>
                      Symptoms
                    </div>
                    {record.selected_symptoms?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {record.selected_symptoms.slice(0, 3).map((symptom, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedRecordId === record.id
                                ? 'bg-white bg-opacity-20 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {symptom}
                          </span>
                        ))}
                        {record.selected_symptoms.length > 3 && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedRecordId === record.id
                                ? 'bg-white bg-opacity-20 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            +{record.selected_symptoms.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={`text-xs ${
                        selectedRecordId === record.id ? 'text-white text-opacity-60' : 'text-gray-500'
                      }`}>
                        No symptoms recorded
                      </div>
                    )}
                  </div> */}
                  
                  {/* Action Indicator */}
                  <div className={`flex items-center gap-2 text-sm font-medium ${
                    selectedRecordId === record.id ? 'text-white' : 'text-emerald-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {selectedRecordId === record.id ? 'Selected for update' : 'Click to update'}
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
              </div>
            ))}
          </div>
          
        </Section>
      )}

      {/* Calendar Section */}
      <Section className="mt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Calendar</h3>
            </div>
            {allMonthData.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Click to select & update</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            {selectedRecordId 
              ? `Update selected record (ID: ${selectedRecordId})` 
              : 'Select your period dates to create a new record'
            }
          </p>
          {selectedRecordId && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 font-semibold text-sm">Ready to update record</span>
            </div>
          )}
        </div>
        <div className="calendar-container relative" style={{ overflow: 'visible', paddingBottom: '20px', minHeight: '480px' }}>
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Loading month data...</span>
              </div>
            </div>
          )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
            key={`${periodStart}-${periodEnd}-${currentMonth}`}
            value={dayjs(currentMonth)}
            slots={{
              day: (props) => renderDay(props.day, null, props)
            }}
            onChange={handleDateChange}
            onMonthChange={(newMonth) => handleMonthChange(newMonth.format('YYYY-MM'))}
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
                {selectedRecordId ? 'Updating...' : 'Saving...'}
              </div>
            ) : (
              selectedRecordId ? 'Update Record' : 'Save New Record'
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

export default Tracker;
