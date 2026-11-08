'use client';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { buildBarChartOptions, buildChartSeries, yAxisScale } from './dashboardModel';

/** Grouped bars (enrollments, completions per week) coloured from the MUI theme palette, whole-number y-axis. */
const ActivityBarChart = ({ weekly = [] }) => {
  const { palette } = useTheme();
  const { categories, series } = buildChartSeries(weekly);

  const options = buildBarChartOptions(palette, categories, yAxisScale(series));

  return <ReactApexChart options={options} series={series} type="bar" height={options.chart.height} />;
};

export default ActivityBarChart;
