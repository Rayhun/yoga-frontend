'use client';

import React from 'react';
import ReactApexChart from 'react-apexcharts';

const options = {
  chart: {
    type: 'line',
    fontFamily: 'Satoshi, sans-serif',
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'straight',
    width: 2,
  },
  grid: {
    xaxis: {
      lines: { show: true },
    },
    yaxis: {
      lines: { show: true },
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'March', 'April', 'May', 'June'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    min: 0,
    max: 7,
    tickAmount: 6,
    title: {
      style: { fontSize: '0px' },
    },
  },
  legend: {
    show: false,
  },
  colors: ['#FB923C'], // orange-400
  markers: {
    size: 4,
    colors: '#fff',
    strokeWidth: 3,
    strokeColors: '#FB923C',
    hover: {
      sizeOffset: 5,
    },
  },
};

const MonthlyPatternsChart = () => {
  const series = [
    {
      name: 'Monthly',
      data: [2, 4, 5, 2, 7, 3, 1],
    },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Monthly patterns</h2>
      <div id="chartOne">
        <ReactApexChart options={options} series={series} type="line" height={300} />
      </div>
    </>
  );
};

export default MonthlyPatternsChart;
