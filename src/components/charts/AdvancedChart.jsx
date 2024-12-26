'use client';
import Breadcrumb from '../breadcrumbs/Breadcrumb';
import ChartFour from '@/components/charts/ChartFour';
import ChartSeven from '@/components/charts/ChartSeven';
import ChartEight from '@/components/charts/ChartEight';
import ChartSix from '@/components/charts/ChartSix';
import ChartNine from '@/components/charts/ChartNine';
import ChartTwelve from '@/components/charts/ChartTwelve';
import React from 'react';

const AdvancedChart = () => {
  return (
    <>
      <Breadcrumb pageName="Advanced Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <ChartFour />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <ChartSeven />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ChartEight />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <ChartSix />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ChartNine />
        </div>

        <ChartTwelve />
      </div>
    </>
  );
};

export default AdvancedChart;
