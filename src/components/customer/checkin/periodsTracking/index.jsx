'use client'
import React, { useState } from 'react';
import Calender from '@/components/common/Calender';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const PeriodsTracking = () => {
    const [selectedDates, setSelectedDates] = useState([]);

  const handleDateChange = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    setSelectedDates((prev) =>
      prev.includes(formattedDate)
        ? prev.filter((d) => d !== formattedDate)
        : [...prev, formattedDate]
    );
  };

  console.log(selectedDates);

  const isDateSelected = (date) => {
    return selectedDates.includes(date.format('YYYY-MM-DD'));
  };
  return (
    <div className="flex flex-col gap-7">
      <Section>
        <h2 className="text-2xl text-dark font-bold">Track Cycle</h2>
      </Section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Section>
          <Calender
            date={null}
            renderDay={(day, _value, DayComponentProps) => {
              const selected = isDateSelected(day);
              console.log(selected);
              return (
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    margin: 2,
                    borderRadius: '50%',
                    backgroundColor: selected ? '#4caf50' : undefined,
                  }}
                >
                  <DayComponentProps.Day {...DayComponentProps} />
                </div>
              );
            }}
            onChnage={handleDateChange}
          />
        </Section>
        <Section>
          <h2 className="text-2xl text-dark font-bold">Track Cycle</h2>
        </Section>
      </div>
    </div>
  );
};

export default PeriodsTracking;
