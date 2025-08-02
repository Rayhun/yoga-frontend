'use client';

import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

const MonthlyPatternsChart = ({ data }) => {
  const categories = data?.map(item => item.date);
  const values = data?.map(item => item.value);

  const options = useMemo(() => {
    return{
      chart: {
        type: 'line',
        fontFamily: 'Satoshi, sans-serif',
        toolbar: { show: false },
        dropShadow: { enabled: false },
      },
      stroke: {
        curve: 'straight',
        width: 2,
      },
      grid: {
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: { fontSize: '10px' },
        },
      },
      yaxis: {
        min: 0,
        max: 5, 
        tickAmount: 5,
        title: { style: { fontSize: '0px' } },
      },
      legend: { show: false },
      colors: ['#FB923C'],
      markers: {
        size: 4,
        colors: '#fff',
        strokeWidth: 3,
        strokeColors: '#FB923C',
        hover: { sizeOffset: 5 },
      },
    };
  }, [categories]) 

  const series = [
    {
      name: 'Daily',
      data: values,
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
