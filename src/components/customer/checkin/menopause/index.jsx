'use client';
import React, { useState } from 'react';
import Calender from '@/components/common/Calender';
import { Slider } from '@mui/material';

const marks = [
  {
    value: 0,
    label: 'Severe',
  },
  {
    value: 25,
    label: 'Moderate',
  },
  {
    value: 50,
    label: 'Mild',
  },
  {
    value: 75,
    label: 'Slight',
  },
  {
    value: 100,
    label: 'None',
  },
];

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const Menopause = () => {
  return (
    <div className="flex flex-col gap-7">
      <Section>
        <h2 className="text-2xl text-dark font-bold">Menopause</h2>
      </Section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Section>
          <Calender />
        </Section>
        <Section>
          <h2 className="text-lg text-dark font-bold">Track Cycle</h2>
          <div>
            <Slider
              aria-label="Custom marks"
              defaultValue={0}
              getAriaValueText={(value) => console.log('value', value)}
              step={25}
              valueLabelDisplay="auto"
              marks={marks}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Menopause;
