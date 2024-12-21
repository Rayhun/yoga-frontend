'use client';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import ChartOne from '@/components/charts/ChartOne';
import ChartTwo from '@/components/charts/ChartTwo';
import ChartThree from '@/components/charts/ChartThree';

const BasicChart = () => {
  return (
    <>
      <Breadcrumb pageName="Basic Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
      </div>
    </>
  );
};

export default BasicChart;
