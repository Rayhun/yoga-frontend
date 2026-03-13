'use client';
import React from 'react';

const ExpertPerformanceTable = ({ expertData }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
          Top Performing Experts
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Expert
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Total Enrollments
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Completed
                </th>
                <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {expertData?.map((expert, index) => (
                <tr key={index}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {expert.expert_name?.charAt(0) || 'E'}
                        </span>
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-medium">
                          {expert.expert_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {expert.expert_email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {expert.total_enrollments}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {expert.completed_enrollments}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center">
                      <span className="text-green-600 font-medium">
                        {expert.completion_rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No expert data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpertPerformanceTable;
