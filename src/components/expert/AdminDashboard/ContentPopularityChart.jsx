'use client';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const ContentPopularityChart = ({ contentData }) => {
  const { theme } = useUI();

  const options = {
    legend: {
      show: true,
      position: 'bottom',
    },
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 350,
      type: 'donut',
    },
    labels: contentData?.map(item => item.program__title) || [],
    colors: [
      theme.colors.primary,
      theme.colors.secondary,
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const series = contentData?.map(item => item.enrollment_count) || [];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Popular Content
        </h4>
        <div className="mt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentPopularityChart;
