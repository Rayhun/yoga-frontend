'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getTrackerInfo, createPeriodDailyGoal, updatePeriodDailyGoal, listPeriodDailyGoals } from '@/services/private/customer/goal';
import { useRouter } from 'next/navigation';
import { MdOutlineDateRange } from 'react-icons/md';
import Calender from '@/components/common/Calender';
import dayjs from 'dayjs';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const CycleInfoCard = ({ cycleInfo }) => {
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
          <div className="w-20 h-20 border-2 border-emerald-500 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
            <span className="text-xs font-medium text-gray-600">Day</span>
            <span className="text-2xl font-bold text-emerald-700">{cycleInfo.day}</span>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cycleInfo.title}</h3>
          <div className="space-y-1">
            <p className="text-gray-700">
              {cycleInfo.estimated}
            </p>
            <p className="text-emerald-600 font-medium">
              Current phase: {cycleInfo.current_phase}
            </p>
            <p className="text-gray-700">
              Last Period: {cycleInfo.last_day ? cycleInfo.last_day : 'Not recorded'}
            </p>
            {/* {userStatus && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  userStatus.period_status === 'normal' ? 'bg-green-500' : 
                  userStatus.period_status === 'irregular' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {userStatus.period_message}
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.next_actions && recommendations.next_actions.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Daily Check-in Recommendations
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


const SymptomSlider = ({ label, options, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = React.useRef(null);

  const handleClick = (e) => {
    if (isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = Math.round(percentage * (options.length - 1)) + 1; // Convert to 1-based
    onChange(Math.max(1, Math.min(5, newValue))); // Ensure range is 1-5
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = Math.round(percentage * (options.length - 1)) + 1; // Convert to 1-based
    onChange(Math.max(1, Math.min(5, newValue))); // Ensure range is 1-5
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          {label}
        </label>
        <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
          {options[value - 1]}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          {options.map((option, index) => (
            <span
              key={index}
              className={`text-xs cursor-pointer transition-colors font-medium px-2 py-1 rounded ${
                index === value - 1 
                  ? 'text-emerald-700 bg-emerald-100 font-semibold' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onChange(index + 1)}
            >
              {option}
            </span>
          ))}
        </div>
        <div 
          ref={sliderRef}
          className={`relative h-3 bg-gray-200 rounded-full cursor-pointer shadow-inner transition-all duration-300 ${
            isHovered ? 'shadow-lg' : ''
          }`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-110 shadow-lg z-10 border-2 border-white"
            style={{ left: `${((value - 1) / (options.length - 1)) * 100}%` }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SymptomTag = ({ symptom, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
      isSelected
        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg ring-2 ring-teal-200'
        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:shadow-md hover:bg-teal-50'
    }`}
  >
    <div className="flex items-center gap-2">
      {isSelected && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{symptom}</span>
    </div>
  </button>
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

const DailyTracker = () => {
  const router = useRouter();
  const [symptomLevels, setSymptomLevels] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [trackerData, setTrackerData] = useState(null);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month in YYYY-MM format
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationTimer, setNotificationTimer] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const dateButtonRef = useRef(null);

  // Date picker handlers
  const handleDateChange = (date) => {
    // Validation: Cannot select future dates
    if (dayjs(date).isAfter(dayjs(), 'day')) {
      showNotification('Cannot select future dates. Please select a date today or in the past.', 'error');
      return;
    }
    
    // Simply change the date - the useEffect will load existing data for that date
    // If there are unsaved changes, they will be lost, but this is expected behavior
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const handleCloseDatePicker = () => {
    setDatePickerOpen(false);
  };


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

  // Fetch tracker configuration only
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
          
          // Initialize symptom levels
          const initialSymptomLevels = {};
          Object.keys(data.page_info.symptoms_level).forEach(symptom => {
            initialSymptomLevels[symptom] = 1;
          });
          setSymptomLevels(initialSymptomLevels);
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
  }, []); // Only run once on mount

  // Load existing data when selectedDate changes
  useEffect(() => {
    if (!trackerData || !selectedDate) return;

    const loadExistingData = async () => {
      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        // Fetch existing data for the selected date
        const response = await listPeriodDailyGoals({
          start_date: dateStr,
          end_date: dateStr
        });

        if (response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
          // Found existing data for this date
          const existing = response.data.data[0];
          setExistingData(existing);
          
          // Populate form with existing data
          if (existing.symptom_levels) {
            setSymptomLevels(existing.symptom_levels);
          } else {
            // Initialize with default values
            const initialSymptomLevels = {};
            Object.keys(trackerData.symptoms_level || {}).forEach(symptom => {
              initialSymptomLevels[symptom] = 1;
            });
            setSymptomLevels(initialSymptomLevels);
          }
          
          if (existing.selected_symptoms) {
            setSelectedSymptoms(existing.selected_symptoms);
          } else {
            setSelectedSymptoms([]);
          }
          
          setHasUnsavedChanges(false);
          setSaveStatus('idle');
        } else {
          // No existing data for this date, initialize with defaults
          setExistingData(null);
          
          // Initialize symptom levels with default values
          const initialSymptomLevels = {};
          Object.keys(trackerData.symptoms_level || {}).forEach(symptom => {
            initialSymptomLevels[symptom] = 1;
          });
          setSymptomLevels(initialSymptomLevels);
          setSelectedSymptoms([]);
          
          setHasUnsavedChanges(false);
          setSaveStatus('idle');
        }
      } catch (err) {
        console.error('Error loading existing data:', err);
        // On error, just initialize with defaults
        const initialSymptomLevels = {};
        Object.keys(trackerData.symptoms_level || {}).forEach(symptom => {
          initialSymptomLevels[symptom] = 1;
        });
        setSymptomLevels(initialSymptomLevels);
        setSelectedSymptoms([]);
        setExistingData(null);
      }
    };

    loadExistingData();
  }, [selectedDate, trackerData]); // Load when date or tracker config changes

  // Handle symptom level changes
  const handleSymptomLevelChange = useCallback((symptom, level) => {
    setSymptomLevels(prev => ({
      ...prev,
      [symptom]: level
    }));
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  const handleSymptomToggle = useCallback((symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  // Save tracker data
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      setError(null);

      const payload = {
        tracker_date: selectedDate.format('YYYY-MM-DD'),
        symptom_levels: symptomLevels,
        selected_symptoms: selectedSymptoms,
        tracker_name: trackerData?.tracker_name || cycleInfo?.tracker_name || 'Cycle'
      };

      let response;
      if (existingData) {
        // Update existing daily data
        response = await updatePeriodDailyGoal(existingData.id, payload);
      } else {
        // Create new daily data
        response = await createPeriodDailyGoal(payload);
      }
      
      if (response.data.status === 'success') {
        const action = existingData ? 'updated' : 'saved';
        console.log('Success response:', response.data);
        showNotification(`Daily check-in data ${action} successfully!`, 'success');
        
        // Update existing data with the response data
        if (response.data.data) {
          setExistingData(response.data.data);
        }
        
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
        
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
        
        // Reset save status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save tracker data');
      }
    } catch (err) {
      console.error('Error saving tracker data:', err);
      setSaveStatus('error');
      showNotification('Failed to save tracker data. Please try again.', 'error');
      
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  }, [symptomLevels, selectedSymptoms, trackerData, existingData, showNotification, selectedDate]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 min-h-screen p-4">
        <Section>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section>
            <div className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </Section>
          <Section>
            <div className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </Section>
        </div>
        <Section>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
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
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center text-xl gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-2xl">Daily Check-In & Mind & Body Signals</h1>
                <p className="text-green-100 text-sm">
                  {cycleInfo?.user_status?.action_required === 'resume_tracking' 
                    ? 'Resume tracking your daily wellness and symptoms'
                    : 'Track your daily wellness and body signals'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Daily Tracking</span>
              </div>
              <p className="text-green-100 text-sm">Monitor your wellness</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Cycle Info Card */}
      <div className="mt-8">
        <CycleInfoCard cycleInfo={cycleInfo} />
      </div>

      {/* Date Picker Section */}
      <div className="mt-8">
        <Section>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Select Date for Daily Check-In</h2>
                <p className="text-gray-600">Choose the date you want to track your daily wellness</p>
              </div>
              <div className="relative">
                <button
                  ref={dateButtonRef}
                  type="button"
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                  onClick={() => setDatePickerOpen(true)}
                >
                  <MdOutlineDateRange size={18} /> Change Date
                </button>
                <Calender
                  value={selectedDate}
                  onChnage={handleDateChange}
                  isPopover={true}
                  open={datePickerOpen}
                  handleClose={handleCloseDatePicker}
                  anchorEl={dateButtonRef.current}
                  shouldDisableDate={(date) => dayjs(date).isAfter(dayjs(), 'day')}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-lg">
                {selectedDate.format('dddd, MMMM D')}
                {selectedDate.isSame(dayjs(), 'day') ? ' (Today)' : ''}
              </span>
            </div>
          </div>
        </Section>
      </div>

      {/* Main Content Grid - Two Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Daily Check-In Card */}
        <Section>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Daily Check-In
            </h3>
            <p className="text-gray-600">How noticeable was this experience today?</p>
          </div>
          {trackerData?.symptoms_level && Object.entries(trackerData.symptoms_level).map(([symptom, options]) => (
            <SymptomSlider
              key={symptom}
              label={symptom}
              options={options}
              value={symptomLevels[symptom] || 1}
              onChange={(level) => handleSymptomLevelChange(symptom, level)}
            />
          ))}
        </Section>

        {/* Mind & Body Signals Card */}
        <Section>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Mind & Body Signals
            </h3>
            <p className="text-gray-600">Select anything you noticed or felt today.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {trackerData?.log_symptoms?.map((symptom) => (
              <SymptomTag
                key={symptom}
                symptom={symptom}
                isSelected={selectedSymptoms.includes(symptom)}
                onClick={() => handleSymptomToggle(symptom)}
              />
            ))}
          </div>
        </Section>
      </div>

        {/* Save Button */}
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : saveStatus === 'saved'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : saveStatus === 'error'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : hasUnsavedChanges
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } shadow-lg hover:shadow-xl`}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : saveStatus === 'saved' ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </div>
            ) : saveStatus === 'error' ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Retry Save
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Save Changes
              </div>
            ) : (
              'Save Daily Data'
            )}
          </button>
        </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">📊</span>
            </div>
            <h3 className="font-bold text-gray-800">Monitor Symptoms</h3>
          </div>
          <p className="text-gray-600 text-sm">Track symptom intensity and frequency to better understand your body&apos;s patterns.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">🧠</span>
            </div>
            <h3 className="font-bold text-gray-800">Mind & Body</h3>
          </div>
          <p className="text-gray-600 text-sm">Track both physical and mental signals to get a complete picture of your wellness.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 text-lg">💡</span>
            </div>
            <h3 className="font-bold text-gray-800">Daily Insights</h3>
          </div>
          <p className="text-gray-600 text-sm">Get personalized insights and recommendations based on your daily tracking data.</p>
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

export default DailyTracker;
