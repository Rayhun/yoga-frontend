'use client';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';
import MyProgramCard from '@/components/certification/mine/MyProgramCard';
import CardShell from './CardShell';
import { creatorRoutes } from './dashboardModel';

const NEW_PROGRAM_CLASSES =
  'flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-500 transition hover:border-green-600 hover:text-green-700 dark:border-gray-600';

export const NewProgramCard = ({ creatorType }) => (
  <Link href={creatorRoutes(creatorType).newProgram} className={NEW_PROGRAM_CLASSES}>
    <FaPlus aria-hidden />
    <span className="text-sm font-semibold">New certification program</span>
  </Link>
);

/** Shown instead of the chart, funnel and program grid while the creator has no program at all. */
export const CreateFirstProgramCard = ({ creatorType, className }) => (
  <CardShell title="Create your first certification program" className={className}>
    <p className="max-w-xl text-sm text-gray-600 dark:text-gray-300">
      Build a program with modules, lessons and a certificate. Once learners enroll, their progress, completions
      and certificates show up here.
    </p>
    <Link
      href={creatorRoutes(creatorType).newProgram}
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
    >
      <FaPlus className="text-xs" aria-hidden /> New certification program
    </Link>
  </CardShell>
);

export const ProgramsSection = ({ programs = [], creatorType, loading, error, onRetry }) => (
  <CardShell title="Your programs" loading={loading} error={error} onRetry={onRetry} skeletonLines={4}>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {programs.map(program => (
        <MyProgramCard key={program.id} program={program} creatorType={creatorType} stats />
      ))}
      <NewProgramCard creatorType={creatorType} />
    </div>
  </CardShell>
);
