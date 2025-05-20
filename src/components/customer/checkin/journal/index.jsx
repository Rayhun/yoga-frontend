import React from 'react';
import JournalForm from './Form';
import PastDiaries from './Diaries';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const Journal = () => {
  return (
    <div className="flex flex-col gap-7">
      <Section>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Wellness Journey</h2>
          <div className="py-2 px-4 rounded-xl bg-orange-500 text-white text-center">
            May Goal: Active Mindfulness
          </div>
        </div>
      </Section>
      <Section>
        <JournalForm />
      </Section>
      <Section>
        <PastDiaries />
      </Section>
    </div>
  );
};

export default Journal;
