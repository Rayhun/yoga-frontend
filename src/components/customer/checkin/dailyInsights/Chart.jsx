'use client';

import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { PiChartLine, PiTrendUp } from 'react-icons/pi';

const MonthlyPatternsChart = ({ data }) => {
  const categories = data?.map(item => item.date);
  const values = data?.map(item => item.value);

  const options = useMemo(() => {
    return{
      chart: {
        type: 'line',
        fontFamily: 'Satoshi, sans-serif',
        toolbar: { show: false },
        dropShadow: { 
          enabled: true,
          color: '#22c55e',
          top: 10,
          left: 0,
          blur: 4,
          opacity: 0.1
        },
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        lineCap: 'round'
      },
      grid: {
        xaxis: { 
          lines: { 
            show: true,
            strokeDashArray: 3,
            opacity: 0.3
          } 
        },
        yaxis: { 
          lines: { 
            show: true,
            strokeDashArray: 3,
            opacity: 0.3
          } 
        },
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: { 
            fontSize: '11px',
            colors: '#6b7280',
            fontFamily: 'Satoshi, sans-serif'
          },
        },
      },
      yaxis: {
        min: 0,
        max: 5, 
        tickAmount: 5,
        title: { style: { fontSize: '0px' } },
        labels: {
          style: {
            fontSize: '11px',
            colors: '#6b7280',
            fontFamily: 'Satoshi, sans-serif'
          }
        }
      },
      legend: { show: false },
      colors: ['#22c55e'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.3,
          gradientToColors: ['#16a34a'],
          inverseColors: false,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      markers: {
        size: 5,
        colors: '#fff',
        strokeWidth: 3,
        strokeColors: '#22c55e',
        hover: { 
          sizeOffset: 6,
          size: 7
        },
        fillOpacity: 1
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Satoshi, sans-serif'
        },
        y: {
          formatter: function (val) {
            return val + " / 5"
          }
        }
      }
    };
  }, [categories]) 

  const series = [
    {
      name: 'Wellness Score',
      data: values,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <PiChartLine className="text-emerald-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Monthly Patterns</h2>
            <p className="text-sm text-gray-600">Your wellness trends over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600">
          <PiTrendUp className="text-lg" />
          <span className="text-sm font-medium">Trending</span>
        </div>
      </div> */}

      {/* Chart Container */}
      <div className="relative">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div id="chartOne" className="relative">
            <ReactApexChart options={options} series={series} type="line" height={350} />
            
            {/* Chart Overlay Info */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Wellness Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Stats */}
      {/* {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Highest Score</p>
                <p className="text-lg font-semibold text-gray-800">
                  {Math.max(...values)} / 5
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-lg font-semibold text-gray-800">
                  {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)} / 5
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-sm">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-lg font-semibold text-gray-800">
                  {data.length} days
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Empty State */}
      {(!data || data.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiChartLine className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Chart Data Available</h3>
          <p className="text-gray-600">Start tracking your wellness to see patterns here.</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyPatternsChart;
