'use client';
import React, { useState } from 'react';
import { MONTHLY_GOAL_TYPES } from '@/utils/constants';
import GoalCategories from './Categories';
import MonthlyGoalForm from './Form';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const MonthlyGoal = () => {
  const [selectedConcern, setSelectedConcern] = useState("");

  return (
    <div className="flex flex-col gap-7">
      <Section>
        <div className="flex flex-col">
          <h2 className="text-2xl text-dark font-bold">Set your Monthly Goal</h2>
          <div className="mt-2">
            Choose <span className="text-primary">One focus area</span> to track progress and see meaningful
            results.
          </div>
        </div>
      </Section>
      <Section>
        <GoalCategories selected={selectedConcern} setSelected={setSelectedConcern} />
      </Section>
      <Section>
        <MonthlyGoalForm selectedConcern={selectedConcern} />
      </Section>
    </div>
  );
};

export default MonthlyGoal;
