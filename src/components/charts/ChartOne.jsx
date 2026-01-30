'use client';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const ChartOne = ({ monthlyRevenue, enrollmentGrowth }) => {
  const { theme } = useUI();

  // Transform API data for the chart
  const chartData = useMemo(() => {
    // Process monthly revenue data
    const revenueData = monthlyRevenue || [];
    const revenueCategories = revenueData.map(item => {
      const date = new Date(item.month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const revenueValues = revenueData.map(item => parseFloat(item.total) || 0);

    // Process enrollment growth data
    const enrollmentData = enrollmentGrowth || [];
    const enrollmentCategories = enrollmentData.map(item => {
      const date = new Date(item.month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const enrollmentValues = enrollmentData.map(item => item.count || 0);

    // Combine categories (use revenue categories as base, add enrollment if different)
    const allCategories = [...new Set([...revenueCategories, ...enrollmentCategories])].sort();
    
    // Map values to categories
    const revenueMap = new Map(revenueData.map((item, idx) => {
      const date = new Date(item.month);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return [key, parseFloat(item.total) || 0];
    }));

    const enrollmentMap = new Map(enrollmentData.map((item, idx) => {
      const date = new Date(item.month);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return [key, item.count || 0];
    }));

    const revenueSeries = allCategories.map(cat => revenueMap.get(cat) || 0);
    const enrollmentSeries = allCategories.map(cat => enrollmentMap.get(cat) || 0);

    return {
      categories: allCategories.length > 0 ? allCategories : ['No Data'],
      series: [
        {
          name: 'Revenue',
          data: revenueSeries.length > 0 ? revenueSeries : [0],
        },
        {
          name: 'Enrollments',
          data: enrollmentSeries.length > 0 ? enrollmentSeries : [0],
        },
      ],
    };
  }, [monthlyRevenue, enrollmentGrowth]);

  const options = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
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
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
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
      categories: chartData.categories,
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
    },
  };

  // Get date range for display
  const getDateRange = () => {
    if (monthlyRevenue && monthlyRevenue.length > 0) {
      const dates = monthlyRevenue.map(item => new Date(item.month));
      const start = dates[0];
      const end = dates[dates.length - 1];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'No data available';
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Total Revenue</p>
              <p className="text-sm font-medium">{getDateRange()}</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Enrollments</p>
              <p className="text-sm font-medium">{getDateRange()}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={{
              ...options,
              colors: [theme.colors.primary, theme.colors.secondary],
              markers: {
                strokeColors: [theme.colors.primary, theme.colors.secondary],
              },
            }}
            series={chartData.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
