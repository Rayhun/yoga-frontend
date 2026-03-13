'use client';
import React from 'react';

const PerformanceBenchmark = ({ contentData, enrollmentData }) => {
  const metrics = [
    {
      label: 'Total Programs',
      value: contentData?.total_programs || 0,
      color: 'bg-primary',
    },
    {
      label: 'Published Programs',
      value: contentData?.published_programs || 0,
      color: 'bg-green-500',
    },
    {
      label: 'Total Guided Experiences',
      value: contentData?.total_events || 0,
      color: 'bg-blue-500',
    },
    // {
    //   label: 'Total Consultations',
    //   value: contentData?.total_consultations || 0,
    //   color: 'bg-purple-500',
    // },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
          Content Performance
        </h4>
        
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-black dark:text-white">
                  {metric.label}
                </span>
                <span className="text-sm text-gray-500">
                  {metric.value}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${metric.color}`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="font-medium text-black dark:text-white mb-2">
            Enrollment Summary
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Program Enrollments:</span>
              <span className="text-blue-600 font-medium">
                {enrollmentData?.program_enrollments || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Guided Experience Enrollments:</span>
              <span className="text-green-600 font-medium">
                {enrollmentData?.event_enrollments || 0}
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Consultation Enrollments:</span>
              <span className="text-purple-600 font-medium">
                {enrollmentData?.consultation_enrollments || 0}
              </span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Enrollments:</span>
              <span className="text-primary font-medium">
                {enrollmentData?.total_enrollments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceBenchmark;
