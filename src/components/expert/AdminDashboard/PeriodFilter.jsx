'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { FiCalendar } from 'react-icons/fi';

const PeriodFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const periodOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '14', label: 'Last 14 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '60', label: 'Last 60 days' },
    { value: '90', label: 'Last 90 days' },
  ];

  // Calculate date range based on selected period
  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  // Handle period change
  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    setIsOpen(false);
    
    const { start_date, end_date } = getDateRange(parseInt(value));
    
    // Update URL with new query parameters
    const params = new URLSearchParams(searchParams);
    params.set('start_date', start_date);
    params.set('end_date', end_date);
    
    router.push(`?${params.toString()}`);
  };

  // Update dropdown position when opening
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  // Initialize with URL parameters or default to 7 days
  useEffect(() => {
    const urlStartDate = searchParams.get('start_date');
    const urlEndDate = searchParams.get('end_date');
    
    if (urlStartDate && urlEndDate) {
      const start = new Date(urlStartDate);
      const end = new Date(urlEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Find matching period option
      const matchingPeriod = periodOptions.find(option => 
        parseInt(option.value) === diffDays
      );
      
      if (matchingPeriod) {
        setSelectedPeriod(matchingPeriod.value);
      }
    } else {
      // Set default period and update URL
      const { start_date, end_date } = getDateRange(7);
      const params = new URLSearchParams(searchParams);
      params.set('start_date', start_date);
      params.set('end_date', end_date);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Close dropdown on scroll or resize
  useEffect(() => {
    if (isOpen) {
      const handleClose = () => setIsOpen(false);
      window.addEventListener('scroll', handleClose, true);
      window.addEventListener('resize', handleClose);
      return () => {
        window.removeEventListener('scroll', handleClose, true);
        window.removeEventListener('resize', handleClose);
      };
    }
  }, [isOpen]);

  const selectedLabel = periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Last 7 days';

  // Dropdown menu component to render in portal
  const DropdownMenu = () => {
    if (!isOpen) return null;
    
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
          onMouseDown={(e) => e.stopPropagation()}
        />
        {/* Dropdown */}
        <div 
          className="fixed z-[9999] w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handlePeriodChange(option.value);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                selectedPeriod === option.value
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {selectedPeriod === option.value && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className="relative period-filter-container">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 min-w-[160px]"
      >
        <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <DropdownMenu />
    </div>
  );
};

export default PeriodFilter;
