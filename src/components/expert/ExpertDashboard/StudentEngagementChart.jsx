'use client';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const StudentEngagementChart = ({ studentData, progressRecords }) => {
  const { theme } = useUI();

  const options = {
    legend: {
      show: false,
    },
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 350,
      type: 'radar',
    },
    xaxis: {
      categories: [
        'Unique Students',
        'Program Enrollments',
        'Event Enrollments',
        'Consultation Enrollments',
        'Progress Records',
        'Completion Rate'
      ],
    },
    yaxis: {
      show: false,
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e9ecef',
          fill: {
            colors: ['#f8f9fa', '#fff']
          }
        }
      }
    },
    colors: [theme.colors.primary],
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: theme.colors.primary,
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val;
        }
      }
    }
  };

  const series = [
    {
      name: 'Student Analytics',
      data: [
        studentData?.unique_students || 0,
        studentData?.program_enrollments || 0,
        studentData?.event_enrollments || 0,
        studentData?.consultation_enrollments || 0,
        progressRecords || 0,
        studentData?.completion_rate || 0,
      ],
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Student Engagement
        </h4>
        <div className="mt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="radar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentEngagementChart;
