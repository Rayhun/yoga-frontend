'use client';

import React from 'react';
import Chart from 'react-apexcharts';
import { Button, Chip } from '@mui/material';

const YogaProgressCard = () => {
  const percentage = 40;

  const chartOptions = {
    series: [percentage, 100 - percentage],
    chart: {
      type: 'donut',
    },
    labels: ['Completed', 'Remaining'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'of your goal',
              fontSize: '12px',
              color: '#999',
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    colors: ['#E99F6D', '#E5E7EB'],
  };

  return (
    <div className="w-full p-10 bg-white rounded rounded-lg border border-stroke shadow-md flex items-center justify-between">
      {/* Left Side Text */}
      <div className="flex flex-col gap-2">
        <h3 className="text-gray-800 font-medium">{"This week's yoga time"}</h3>
        <p className="text-3xl font-semibold text-green-600">2h 20m</p>
        <p className="text-gray-500 text-sm">Keep going!</p>
        <div className="mt-4">
          <Chip
            className="mt-10 !capitalize w-full"
            label="See Details"
            color="primary"
            onClick={() => console.log('See Details')}
          />
        </div>
      </div>

      {/* Right Side Pie Chart */}
      <div className="w-50 h-50 flex items-center justify-center">
        <Chart options={chartOptions} series={chartOptions.series} type="donut" height="100%" />
      </div>
    </div>
  );
};

export default YogaProgressCard;
