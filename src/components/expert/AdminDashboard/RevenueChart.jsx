'use client';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const RevenueChart = ({ revenueData }) => {
  const { theme } = useUI();

  const options = {
    legend: {
      show: false,
    },
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 350,
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: revenueData?.map(item => new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })) || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      labels: {
        formatter: function (val) {
          return '$' + val.toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString();
        },
      },
    },
    colors: [theme.colors.primary],
  };

  const series = [
    {
      name: 'Revenue',
      data: revenueData?.map(item => item.revenue) || [],
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Revenue Tracking
        </h4>
        <div className="mt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
