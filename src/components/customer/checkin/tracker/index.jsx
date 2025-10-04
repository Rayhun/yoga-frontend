'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getTrackerInfo } from '@/services/private/customer/goal';
import axios from 'axios';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const SymptomSlider = ({ label, options, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = React.useRef(null);

  const handleClick = (e) => {
    if (isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = Math.round(percentage * (options.length - 1));
    onChange(Math.max(0, Math.min(options.length - 1, newValue)));
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
    const newValue = Math.round(percentage * (options.length - 1));
    onChange(Math.max(0, Math.min(options.length - 1, newValue)));
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
    <div className="mb-10">
      <h4 className="text-base font-semibold text-gray-800 mb-5">{label}</h4>
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          {options.map((option, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors font-medium"
              onClick={() => onChange(index)}
            >
              {option}
            </span>
          ))}
        </div>
        <div 
          ref={sliderRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer shadow-inner"
          onClick={handleClick}
        >
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 shadow-lg z-10 border-2 border-white"
            style={{ left: `${(value / (options.length - 1)) * 100}%` }}
            onMouseDown={handleMouseDown}
          />
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
        ? 'bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 text-green-800 shadow-md'
        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-sm hover:bg-gray-50'
    }`}
  >
    {symptom}
  </button>
);

const Tracker = () => {
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [symptomLevels, setSymptomLevels] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [trackerData, setTrackerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch tracker data from API
  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        setLoading(true);
        const response = await getTrackerInfo();
        
        if (response.data.status === 'success') {
          const data = response.data.data;
          setTrackerData(data);
          
          // Initialize symptom levels
          const initialSymptomLevels = {};
          Object.keys(data.symptoms_level).forEach(symptom => {
            initialSymptomLevels[symptom] = 0;
          });
          setSymptomLevels(initialSymptomLevels);
        } else {
          setError('Failed to load tracker data');
        }
      } catch (err) {
        console.error('Error fetching tracker data:', err);
        setError('Failed to load tracker data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerData();
  }, []);

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

  // Handle symptom level changes
  const handleSymptomLevelChange = useCallback((symptom, level) => {
    setSymptomLevels(prev => ({
      ...prev,
      [symptom]: level
    }));
  }, []);

  const handleSymptomToggle = useCallback((symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  // Save tracker data
  const handleSave = useCallback(async () => {
    if (!periodStart) {
      alert('Please select at least a start date for your period.');
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);

      const payload = {
        period_start: periodStart,
        period_end: periodEnd,
        symptom_levels: symptomLevels,
        selected_symptoms: selectedSymptoms,
        tracker_name: trackerData?.tracker_name || 'Cycle'
      };

      const response = await axios.post('/cycle/tracker/', payload);
      
      if (response.data.status === 'success') {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
      } else {
        throw new Error(response.data.message || 'Failed to save tracker data');
      }
    } catch (err) {
      console.error('Error saving tracker data:', err);
      alert('Failed to save tracker data. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [periodStart, periodEnd, symptomLevels, selectedSymptoms, trackerData]);

  const renderDay = useCallback((day, _value, props) => {
    const selectedDates = getSelectedDates;
    const dayFormatted = day.format('YYYY-MM-DD');
    const isSelected = selectedDates.includes(dayFormatted);
    
    // Check if this day is outside the current viewing month
    const isCurrentMonth = !props.outsideCurrentMonth;
    const isOtherMonth = props.outsideCurrentMonth;
    
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
          backgroundColor: isSelected && isCurrentMonth ? '#f97316' : 'transparent',
          borderRadius: '50%',
          color: isSelected && isCurrentMonth ? '#ffffff' : isOtherMonth ? '#d1d5db' : '#374151',
          fontSize: '0.875rem',
          fontWeight: isSelected && isCurrentMonth ? 600 : 500,
          cursor: isCurrentMonth ? 'pointer' : 'not-allowed',
          border: 'none',
          margin: '2px',
          transition: 'all 0.3s ease',
          opacity: isOtherMonth ? 0.4 : 1,
          boxShadow: isSelected && isCurrentMonth ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
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
            e.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
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
      </div>
    );
  }, [getSelectedDates, handleDateChange]);

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
    <div className="flex flex-col gap-8 min-h-screen p-6">
      {/* Header */}
      <Section>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Track {trackerData?.tracker_name || 'Cycle'}</h2>
            <p className="text-gray-600 mt-1">Monitor your wellness journey</p>
          </div>
        </div>
      </Section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Section>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </h3>
          </div>
          <div className="calendar-container" style={{ overflow: 'visible', paddingBottom: '20px', minHeight: '480px' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
              key={`${periodStart}-${periodEnd}`}
              value={null}
              slots={{
                day: (props) => renderDay(props.day, null, props)
              }}
              onChange={handleDateChange}
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
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-md"></div>
              <span className="text-sm font-medium text-gray-700">
                {trackerData?.tracker_name === 'Cycle' ? 'Periods' : 'Last date of Periods'}
              </span>
            </div>
          </div>
        </Section>

        {/* Symptoms Level Section */}
        <Section>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Symptoms Level
          </h3>
          {trackerData?.symptoms_level && Object.entries(trackerData.symptoms_level).map(([symptom, options]) => (
            <SymptomSlider
              key={symptom}
              label={symptom}
              options={options}
              value={symptomLevels[symptom] || 0}
              onChange={(level) => handleSymptomLevelChange(symptom, level)}
            />
          ))}
        </Section>
      </div>

      {/* Log Symptoms Section */}
      <Section>
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Log Symptoms
        </h3>
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

      {/* Save Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          disabled={saving || !periodStart}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
            saving || !periodStart
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            'Save Tracker Data'
          )}
        </button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tracker data saved successfully!
        </div>
      )}
    </div>
  );
};

export default Tracker;
