'use client';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const baseOptions = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'bar',
    stacked: true,
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
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: '25%',
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: '14px',
  },
  fill: { opacity: 1 },
};

const ConversionChart = ({ traffic_conversions = {} }) => {
  const { theme } = useUI();
  const { conversions = [], traffic = [] } = traffic_conversions;
  const categories = baseOptions.xaxis.categories;

  // Pad or truncate to exactly 7 points
  const normalize = (arr) => {
    const len = categories.length;
    if (arr.length >= len) return arr.slice(0, len);
    return [...arr, ...Array(len - arr.length).fill(0)];
  };

  const series = useMemo(
    () => [
      { name: 'Conversions', data: normalize(conversions) },
      { name: 'Traffic',     data: normalize(traffic)     },
    ],
    [conversions, traffic]
  );

  const options = useMemo(
    () => ({
      ...baseOptions,
      colors: [theme.colors.primary, theme.colors.secondary],
    }),
    [theme]
  );

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Profit this week
        </h4>
      </div>

      <div id="chartTwo" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default ConversionChart;
