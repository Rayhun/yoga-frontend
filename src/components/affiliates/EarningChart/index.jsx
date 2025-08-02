'use client';

import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useUI } from '@/context/UIProvider';

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const baseOptions = {
  legend: { show: false },
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: { show: false },
  },
  responsive: [
    { breakpoint: 1024, options: { chart: { height: 300 } } },
    { breakpoint: 1366, options: { chart: { height: 350 } } },
  ],
  stroke: { width: 2, curve: 'straight' },
  grid: {
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  dataLabels: { enabled: false },
  markers: { size: 4, colors: '#fff', strokeWidth: 3, hover: { sizeOffset: 5 } },
  xaxis: {
    type: 'category',
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { min: 0 },
};

const EarningChart = ({ earnings_over_time = {} }) => {
  const { theme } = useUI();

  const sorted = useMemo(() => {
    return Object.entries(earnings_over_time)
      .filter(([m]) => monthOrder.includes(m))
      .sort(([mA], [mB]) => monthOrder.indexOf(mA) - monthOrder.indexOf(mB));
  }, [earnings_over_time]);

  const categories = useMemo(() => sorted.map(([m]) => m), [sorted]);
  const dataSeries = useMemo(() => sorted.map(([, v]) => v), [sorted]);

  // Add 20% headroom
  const yMax = useMemo(() => {
    const maxVal = Math.max(...dataSeries, 0);
    return Math.ceil(maxVal * 1.2);
  }, [dataSeries]);

  const options = useMemo(
    () => ({
      ...baseOptions,
      colors: [theme.colors.primary],
      markers: {
        ...baseOptions.markers,
        strokeColors: [theme.colors.primary],
      },
      xaxis: { ...baseOptions.xaxis, categories },
      yaxis: { ...baseOptions.yaxis, max: yMax },
    }),
    [theme, categories, yMax]
  );

  const series = useMemo(() => [{ name: 'Earnings', data: dataSeries }], [dataSeries]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="w-full">
        <h4 className="text-xl font-semibold text-black dark:text-white">Earning Over Time</h4>
      </div>
      <div className="-ml-5">
        <ReactApexChart options={options} series={series} type="area" height={350} />
      </div>
    </div>
  );
};

export default EarningChart;
