'use client';
import React from 'react';
import ChartOne from '../../charts/ChartOne';
import ChartTwo from '../../charts/ChartTwo';
import CardDataStats from '../../stats/CardDataStats';
import { FiMousePointer, FiDollarSign } from 'react-icons/fi';
import { TbUsers } from 'react-icons/tb';
import { PiShoppingCartSimple } from 'react-icons/pi';

const AffiliateUserDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Clicks" total="1,247" highlight="Last 30 days" rate="12%" levelUp>
          <FiMousePointer className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="New Signups" total="89" rate="8%" highlight="7.1 conversion rate" levelUp>
          <TbUsers className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="First Purchase" total="23" rate="15%" highlight="Converted customer" levelUp>
          <PiShoppingCartSimple className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Commission Earned"
          total="$936"
          rate="0.95%"
          highlight="20% + $5 bonus"
          levelDown
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
      </div>
    </>
  );
};

export default AffiliateUserDashboard;
