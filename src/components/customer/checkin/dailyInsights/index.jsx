import React from 'react';
import dayjs from 'dayjs';
import { MdOutlineDateRange } from 'react-icons/md';
import WellnessStats from './Stats';
import MonthlyPatternsChart from './chart';
import KeyInsights from './KeyInsights';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const DailyInsights = () => {
  return (
    <div className="flex flex-col gap-7">
      <Section>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Wellness Insights</h2>
          <div className="py-2 px-4 text-gray-400 text-center flex gap-2 items-center">
            <MdOutlineDateRange size={18} /> {dayjs().format('ddd, MMM, YYYY')}
          </div>
        </div>
      </Section>
      <WellnessStats />
      <Section>
        <MonthlyPatternsChart />
      </Section>
      <Section>
        <KeyInsights />
      </Section>
    </div>
  );
};

export default DailyInsights;
