/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { FaRegFileImage } from 'react-icons/fa6';

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-600',
  private: 'bg-amber-100 text-amber-700',
  public: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-600',
};

const MyProgramCard = ({ program }) => {
  return (
    <Link
      href={`/portal/teacher/certification/programs/builder/${program.id}`}
      className="bg-white dark:bg-boxdark rounded-2xl shadow-lg border border-gray-100 dark:border-strokedark overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col"
    >
      <div className="h-36 w-full bg-gray-100 dark:bg-form-input flex items-center justify-center overflow-hidden">
        {program.thumbnail ? (
          <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
        ) : (
          <FaRegFileImage className="text-4xl text-gray-300" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className={`self-start text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[program.status] || 'bg-gray-100 text-gray-600'}`}>
          {program.status}
        </span>
        <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
          {program.title || 'Untitled program'}
        </h4>
        <p className="text-xs text-gray-400 mt-auto">Updated {dayjs(program.updated_at).format('MMM D, YYYY')}</p>
      </div>
    </Link>
  );
};

export default MyProgramCard;
