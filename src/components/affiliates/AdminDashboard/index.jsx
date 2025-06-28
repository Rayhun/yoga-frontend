'use client';
import React from 'react';
import ChartOne from '../../charts/ChartOne';
import ChartTwo from '../../charts/ChartTwo';
import CardDataStats from '../../stats/CardDataStats';
import { FiUserCheck, FiDollarSign } from 'react-icons/fi';
import { TbUsers } from 'react-icons/tb';
import { TbUsersGroup } from "react-icons/tb";



const AdminAffiliatedDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Affiliates" total="247" highlight="+12 this month" rate="+12" levelUp>
          <TbUsers className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="Active Affiliates" total="189" rate="+8" highlight="+8 this month" levelUp>
          <FiUserCheck className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="Total Commission Owed" total="$24,580" rate="+ $3,200" highlight="+$3200 this month" levelUp>
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Total Refferrals"
          total="1,342"
          rate="+89"
          highlight="20% + $5 bonus"
          levelUp
        >
          <TbUsersGroup className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
      </div>
    </>
  );
};

export default AdminAffiliatedDashboard;
