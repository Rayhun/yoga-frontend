'use client';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const PersonalEarningsChart = ({ earningsData, earningsBySection }) => {
  const { theme } = useUI();

  const options = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
    },
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [2, 2],
      curve: 'smooth',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
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
      type: 'category',
      categories: earningsData?.map(item => {
        if (typeof window === 'undefined') {
          // SSR-safe fallback
          const date = new Date(item.month);
          return `${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        return new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }) || [],
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
      min: 0,
      labels: {
        formatter: function (val) {
          if (typeof window === 'undefined') {
            return '$' + val.toString();
          }
          return '$' + val.toLocaleString();
        },
      },
    },
    colors: [theme.colors.primary, theme.colors.secondary],
  };

  const series = [
    {
      name: 'Monthly Earnings',
      data: earningsData?.map(item => item.earnings) || [],
    },
    {
      name: 'Earnings by Section',
      data: earningsBySection?.map(item => item.earnings) || [],
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Earnings Overview
        </h4>
        <div className="mt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalEarningsChart;
