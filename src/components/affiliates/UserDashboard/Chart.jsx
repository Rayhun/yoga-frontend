'use client';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const baseOptions = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'line',
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false },
    height: 335,
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: { borderRadius: 0, columnWidth: '25%' },
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'smooth',
  },
  dataLabels: { enabled: false },
  markers: {
    size: 4,
    colors: '#fff',
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: '14px',
  },
  fill: {
    opacity: 1,
  },
};

const ConversionChart = ({ traffic_conversions = {} }) => {
  const { theme } = useUI();
  const { conversions = [], traffic = [] } = traffic_conversions;

  const categories = baseOptions.xaxis.categories;


  const series = useMemo(
    () => {
      const normalize = arr => {
        const len = categories.length;
        if (arr.length >= len) return arr.slice(0, len);
        return [...arr, ...Array(len - arr.length).fill(0)];
      };
      
      return [
        { name: 'Conversions', data: normalize(conversions) },
        { name: 'Traffic', data: normalize(traffic) },
      ];
    },
    [conversions, traffic, categories.length]
  );

  const options = useMemo(
    () => ({
      ...baseOptions,
      colors: [theme.colors.primary, theme.colors.secondary],
      markers: {
        strokeColors: [theme.colors.primary, theme.colors.secondary],
      },
    }),
    [theme]
  );

  return (
    <div className="w-full px-6 pb-6 pt-6">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-2">Conversions & Traffic Over Time</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">Track your conversion rates and traffic patterns</p>
      </div>

      <div id="chartTwo" className="-ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
};

export default ConversionChart;
