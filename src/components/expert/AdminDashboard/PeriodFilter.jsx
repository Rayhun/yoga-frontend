'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PeriodFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState('7');

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
  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setSelectedPeriod(newPeriod);
    
    const { start_date, end_date } = getDateRange(parseInt(newPeriod));
    
    // Update URL with new query parameters
    const params = new URLSearchParams(searchParams);
    params.set('start_date', start_date);
    params.set('end_date', end_date);
    
    router.push(`?${params.toString()}`);
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

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Period:</span>
      <select
        value={selectedPeriod}
        onChange={handlePeriodChange}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodFilter;
