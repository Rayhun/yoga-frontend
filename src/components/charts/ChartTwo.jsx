'use client';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const ChartTwo = ({ contentStats, enrollmentStats }) => {
  const { theme } = useUI();

  // Transform API data for the chart
  const chartData = useMemo(() => {
    const categories = ['Programs', 'Events', 'Consultations', 'Experts', 'Users'];
    
    const series = [
      {
        name: 'Total',
        data: [
          contentStats?.total_programs || 0,
          contentStats?.total_events || 0,
          contentStats?.total_consultations || 0,
          contentStats?.total_experts || 0,
          enrollmentStats?.total_program_enrollments || 0,
        ],
      },
      {
        name: 'Active',
        data: [
          contentStats?.published_programs || 0,
          contentStats?.scheduled_events || 0,
          contentStats?.total_consultations || 0,
          contentStats?.active_experts || 0,
          enrollmentStats?.completed_enrollments || 0,
        ],
      },
    ];

    return {
      categories,
      series,
    };
  }, [contentStats, enrollmentStats]);

  const options = {
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%',
            },
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
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
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

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">Platform Overview</h4>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-mb-9 -ml-5">
          <ReactApexChart
            options={{ ...options, colors: [theme.colors.primary, theme.colors.secondary] }}
            series={chartData.series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
