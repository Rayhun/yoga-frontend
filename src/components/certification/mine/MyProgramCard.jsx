/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { FaRegFileImage } from 'react-icons/fa6';
import { creatorRoutes, editLabel, pacingLabel, priceLabel, programStatusLabel } from '@/components/creator/dashboardModel';

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-600',
  private: 'bg-amber-100 text-amber-700',
  public: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-600',
};

const ACTION_CLASSES =
  'flex-1 text-center text-sm font-medium border border-gray-200 dark:border-strokedark rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-form-input';

const StatsRow = ({ program }) => {
  const facts = [
    `${program.modules_count ?? 0} ${program.modules_count === 1 ? 'module' : 'modules'}`,
    pacingLabel(program.pacing),
    priceLabel(program),
  ].filter(Boolean);
  return (
    <>
      <p className="text-xs text-gray-500 dark:text-gray-400">{facts.join(' · ')}</p>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Enrolled', program.enrolled ?? 0],
          ['Certified', program.certified ?? 0],
          ['Completion', `${program.completion_rate ?? 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-form-input">
            <dd className="text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
            <dt className="text-[11px] text-gray-500">{label}</dt>
          </div>
        ))}
      </dl>
    </>
  );
};

/**
 * `creatorType` ('qte' by default, or 'institution') picks the portal the Edit / Preview links point to.
 * `stats` switches on the dashboard variant: it adds the module / pacing / price line and the enrolled /
 * certified / completion numbers, shows "Published / Draft / Archived", and labels the main button
 * "Continue draft" or "Edit program".
 */
const MyProgramCard = ({ program, creatorType = 'qte', stats = false }) => {
  const routes = creatorRoutes(creatorType);
  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl shadow-lg border border-gray-100 dark:border-strokedark overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col">
      <div className="h-36 w-full bg-gray-100 dark:bg-form-input flex items-center justify-center overflow-hidden">
        {program.thumbnail ? (
          <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
        ) : (
          <FaRegFileImage className="text-4xl text-gray-300" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className={`self-start text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[program.status] || 'bg-gray-100 text-gray-600'}`}>
          {stats ? programStatusLabel(program.status) : program.status}
        </span>
        <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
          {program.title || 'Untitled program'}
        </h4>
        {stats ? <StatsRow program={program} /> : null}
        {program.updated_at ? (
          <p className="text-xs text-gray-400 mt-auto">Updated {dayjs(program.updated_at).format('MMM D, YYYY')}</p>
        ) : null}
        <div className="flex gap-2 pt-1">
          <Link href={routes.builder(program.id)} className={ACTION_CLASSES}>
            {stats ? editLabel(program.status) : 'Edit'}
          </Link>
          <Link href={routes.preview(program.id)} className={ACTION_CLASSES}>
            Preview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyProgramCard;
