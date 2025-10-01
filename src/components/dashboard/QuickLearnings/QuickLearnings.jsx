'use client';
import React from 'react';
import Link from 'next/link';
import ProgramCard from '@/components/lms/program/customer/ProgramCard';
import { useRouter } from 'next/navigation';

const QuickLearningsSection = ({ title, viewAllLink, items }) => {
  const router = useRouter();
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Link href={viewAllLink} className="text-sm text-primary hover:text-primary hover:underline">
          View all
        </Link>
      </div>

      {/* Cards Container */}
      <div className='overflow-x-auto no-scrollbar'>
        <div className="no-scrollbar grid grid-flow-col auto-cols-[300px] gap-4">
          {items?.map(item => (
              <ProgramCard
                key={item.id} 
                program={item}
                onClick={() => router.push(`/portal/customer/lms/program/${item.id}/details`)}
              />
          )) || <p className="text-gray-500">No items available</p>}
        </div>
      </div>
    </div>
  );
};

export default QuickLearningsSection;
