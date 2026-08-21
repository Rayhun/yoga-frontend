'use client';

import ReactApexChart from 'react-apexcharts';

const WellnessInsightsChart = ({ points = [], unit = '' }) => {
  const categories = points.map(point => point.label);
  const seriesData = points.map(point => point.value);
  const lastIndex = Math.max(seriesData.length - 1, 0);

  const options = {
    chart: {
      type: 'area',
      height: 300,
      width: '100%',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: ['#1E4D35'],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: '#F0F0F0',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: {
      size: 0,
      hover: { size: 5 },
      discrete: seriesData.length
        ? [
            {
              seriesIndex: 0,
              dataPointIndex: lastIndex,
              fillColor: '#C17A3C',
              strokeColor: '#C17A3C',
              size: 6,
            },
          ]
        : [],
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: '#9CA3AF', fontSize: '11px' },
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#9CA3AF', fontSize: '11px' },
        formatter: value => `${Math.round(value * 10) / 10}${unit}`,
      },
      min: 0,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: value => `${value}${unit}`,
        title: { formatter: () => '' },
      },
    },
  };

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={[{ name: 'Average', data: seriesData }]}
        type="area"
        height={300}
        width="100%"
      />
    </div>
  );
};

export default WellnessInsightsChart;
