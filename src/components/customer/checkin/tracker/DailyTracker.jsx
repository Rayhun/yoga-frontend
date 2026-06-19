'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPeriodDailyGoal, updatePeriodDailyGoal } from '@/services/private/customer/goal';
import {
  useInvalidatePeriodTrackerQueries,
  usePeriodDailyGoalsQuery,
  useTrackerInfoQuery,
} from '@/hooks/usePeriodTrackerQueries';
import { useRouter } from 'next/navigation';
import { MdOutlineDateRange } from 'react-icons/md';
import Calender from '@/components/common/Calender';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white portal-section rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const CycleInfoCard = ({ cycleInfo }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  // Helper function to get regularity status styling
  const getRegularityStatusStyle = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'regular') {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500'
      };
    } else if (statusLower === 'irregular') {
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        dotColor: 'bg-orange-500'
      };
    } else if (statusLower === 'very irregular') {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500'
      };
    }
    return null;
  };

  if (!cycleInfo) {
    return (
      <Section>
        <div className="flex items-center gap-6 relative">
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
          {/* Info Button - Top Right */}
          <div className="absolute top-0 right-0">
            <button
              type="button"
              aria-label="Insights info"
              onClick={() => setInfoOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </button>
          </div>
          {infoOpen && (
            <div className="absolute top-8 right-0 mt-2 w-64 bg-white border border-emerald-100 rounded-xl shadow-xl p-3 z-20">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                  i
                </div>
                <div className="text-sm font-semibold text-gray-800 leading-snug">
                  Track 5 days to see your insights ✨
                </div>
                <button
                  type="button"
                  aria-label="Close insight info"
                  onClick={() => setInfoOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>
    );
  }

  const userStatus = cycleInfo.user_status;
  const recommendations = cycleInfo.recommendations;
  const regularityStyle = getRegularityStatusStyle(cycleInfo.regularity_status);
  const defaultColor = regularityStyle || {
    borderColor: 'border-gray-500',
    phaseColor: 'text-gray-600',
    dotColor: 'bg-gray-500'
  };

  return (
    <Section>
      {/* Top Section - Cycle Overview */}
      <div className="flex items-start gap-6 relative">
        {/* Circular Day Indicator */}
        <div className="flex-shrink-0">
          <div className={`w-20 h-20 border-2 ${defaultColor.borderColor} rounded-full flex flex-col items-center justify-center bg-white`}>
            <span className="text-xs font-medium text-gray-600">Day</span>
            <span className="text-2xl font-bold text-gray-900">{cycleInfo.day}</span>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cycleInfo.title}</h3>
          <div className="space-y-1">
            <p className="text-gray-700">
              {cycleInfo.estimated}
            </p>
            <p className={`${defaultColor.phaseColor} font-medium`}>
              Current phase: {cycleInfo.current_phase}
            </p>
          </div>
        </div>

        {/* Status Indicator - Top Right */}
        <div className="absolute top-0 right-0">
          <div className={`w-3 h-3 ${defaultColor.dotColor} rounded-full`}></div>
        </div>
      </div>

      {/* Bottom Section - Cycle Pattern Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          {/* Cycle Pattern with Bubble Icon */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Cycle Pattern:</span>
            {cycleInfo.regularity_status && regularityStyle && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${regularityStyle.bgColor} ${regularityStyle.textColor}`}>
                <div className={`w-2 h-2 ${regularityStyle.dotColor} rounded-full`}></div>
                <span className="text-sm font-medium">{cycleInfo.regularity_status}</span>
              </div>
            )}
          </div>
          
          {/* Pattern Details (if available) */}
          {cycleInfo.regularity_status && (
            <p className="text-sm text-gray-600">
              {cycleInfo.regularity_status.toLowerCase() === 'regular' 
                ? 'Cycles are consistent'
                : cycleInfo.regularity_status.toLowerCase() === 'irregular'
                ? 'Cycles vary by >7 days'
                : cycleInfo.regularity_status.toLowerCase() === 'very irregular'
                ? 'Cycles vary significantly'
                : ''
              }
            </p>
          )}
          
          {/* Last Period Date */}
          <p className="text-sm text-gray-700">
            Last Period Date: {cycleInfo.last_day ? cycleInfo.last_day : 'Not recorded'}
          </p>
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
  // Helper function to get regularity status styling
  const getRegularityStatusStyle = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'regular') {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500',
        borderColor: 'border-green-500',
        phaseColor: 'text-green-600'
      };
    } else if (statusLower === 'irregular') {
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        dotColor: 'bg-orange-500',
        borderColor: 'border-orange-500',
        phaseColor: 'text-orange-600'
      };
    } else if (statusLower === 'very irregular') {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        borderColor: 'border-red-500',
        phaseColor: 'text-red-600'
      };
    }
    return null;
  };

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

  const regularityStyle = getRegularityStatusStyle(cycleInfo.regularity_status);
  const defaultColor = regularityStyle || {
    borderColor: 'border-gray-500',
    phaseColor: 'text-gray-600',
    dotColor: 'bg-gray-500'
  };

  return (
    <Section>
      {/* Top Section - Cycle Overview */}
      <div className="flex items-start gap-6 relative">
        {/* Circular Day Indicator */}
        <div className="flex-shrink-0">
          <div className={`w-20 h-20 border-2 ${defaultColor.borderColor} rounded-full flex flex-col items-center justify-center bg-white`}>
            <span className="text-xs font-medium text-gray-600">Day</span>
            <span className="text-2xl font-bold text-gray-900">{cycleInfo.day}</span>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cycleInfo.title}</h3>
          <div className="space-y-1">
            <p className="text-gray-700">
              {cycleInfo.estimated}
            </p>
            <p className={`${defaultColor.phaseColor} font-medium`}>
              Current phase: {cycleInfo.current_phase}
            </p>
          </div>
        </div>

        {/* Status Indicator - Top Right */}
        <div className="absolute top-0 right-0">
          <div className={`w-3 h-3 ${defaultColor.dotColor} rounded-full`}></div>
        </div>
      </div>

      {/* Bottom Section - Cycle Pattern Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          {/* Cycle Pattern with Bubble Icon */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Cycle Pattern:</span>
            {cycleInfo.regularity_status && regularityStyle && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${regularityStyle.bgColor} ${regularityStyle.textColor}`}>
                <div className={`w-2 h-2 ${regularityStyle.dotColor} rounded-full`}></div>
                <span className="text-sm font-medium">{cycleInfo.regularity_status}</span>
              </div>
            )}
          </div>
          
          {/* Pattern Details (if available) */}
          {cycleInfo.regularity_status && (
            <p className="text-sm text-gray-600">
              {cycleInfo.regularity_status.toLowerCase() === 'regular' 
                ? 'Cycles are consistent'
                : cycleInfo.regularity_status.toLowerCase() === 'irregular'
                ? 'Cycles vary by >7 days'
                : cycleInfo.regularity_status.toLowerCase() === 'very irregular'
                ? 'Cycles vary significantly'
                : ''
              }
            </p>
          )}
          
          {/* Last Period Date */}
          <p className="text-sm text-gray-700">
            Last Period Date: {cycleInfo.last_day ? cycleInfo.last_day : 'Not recorded'}
          </p>
        </div>
      </div>
    </Section>
  );
};

const DailyTracker = () => {
  const router = useRouter();
  const [symptomLevels, setSymptomLevels] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [existingData, setExistingData] = useState(null);
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month in YYYY-MM format
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { invalidatePeriodDailyGoals, invalidateTrackerInfo } = useInvalidatePeriodTrackerQueries();
  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  const dailyGoalsParams = useMemo(
    () => ({ start_date: selectedDateStr, end_date: selectedDateStr }),
    [selectedDateStr]
  );

  const {
    data: trackerInfo,
    isLoading: isLoadingTrackerInfo,
    isError: isTrackerInfoError,
  } = useTrackerInfoQuery();

  const trackerData = trackerInfo?.page_info ?? null;
  const cycleInfo = trackerInfo?.cycle_info ?? null;

  const {
    data: dailyGoals = [],
    isFetching: isFetchingDailyGoals,
    isError: isDailyGoalsError,
  } = usePeriodDailyGoalsQuery(dailyGoalsParams, { enabled: Boolean(trackerData) });

  const loading = isLoadingTrackerInfo;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const dateButtonRef = useRef(null);

  // Date picker handlers
  const handleDateChange = (date) => {
    // Validation: Cannot select future dates
    if (dayjs(date).isAfter(dayjs(), 'day')) {
      toast.error('Cannot select future dates. Please select a date today or in the past.');
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


  useEffect(() => {
    if (isTrackerInfoError) {
      setError('Failed to load tracker configuration');
      toast.error('Failed to load tracker configuration. Please try again.');
    }
  }, [isTrackerInfoError]);

  useEffect(() => {
    if (!trackerData || isFetchingDailyGoals) return;

    const buildDefaultSymptomLevels = () => {
      const initialSymptomLevels = {};
      Object.keys(trackerData.symptoms_level || {}).forEach(symptom => {
        initialSymptomLevels[symptom] = 1;
      });
      return initialSymptomLevels;
    };

    if (isDailyGoalsError) {
      setSymptomLevels(buildDefaultSymptomLevels());
      setSelectedSymptoms([]);
      setExistingData(null);
      return;
    }

    if (dailyGoals.length > 0) {
      const existing = dailyGoals[0];
      setExistingData(existing);
      setSymptomLevels(existing.symptom_levels || buildDefaultSymptomLevels());
      setSelectedSymptoms(existing.selected_symptoms || []);
    } else {
      setExistingData(null);
      setSymptomLevels(buildDefaultSymptomLevels());
      setSelectedSymptoms([]);
    }

    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, [selectedDate, trackerData, dailyGoals, isFetchingDailyGoals, isDailyGoalsError]);

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
        toast.success('Saved successfully');
        
        // Update existing data with the response data
        if (response.data.data) {
          setExistingData(response.data.data);
        }
        
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
        
        await Promise.all([
          invalidatePeriodDailyGoals(dailyGoalsParams),
          invalidateTrackerInfo(),
        ]);
        
        // Reset save status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save tracker data');
      }
    } catch (err) {
      console.error('Error saving tracker data:', err);
      setSaveStatus('error');
      toast.error('Something went wrong. Please try again.');
      
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  }, [
    symptomLevels,
    selectedSymptoms,
    trackerData,
    cycleInfo,
    existingData,
    selectedDate,
    dailyGoalsParams,
    invalidatePeriodDailyGoals,
    invalidateTrackerInfo,
  ]);

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
    </div>
  );
};

export default DailyTracker;
