'use client';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getMyPrograms } from '@/services/private/certification/program';
import { getGradingQueue, gradeSubmission } from '@/services/private/certification/grading';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import GradingReviewDrawer from './GradingReviewDrawer';
import { SubmissionStatusBadge } from './SubmissionContent';

const PAGE_SIZE = 20;
const STATUS_FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'needs_revision', label: 'Needs revision' },
  { value: 'passed', label: 'Passed' },
  { value: 'all', label: 'All' },
];

/**
 * Grading Queue (KAN-96 "GradingQueueTable") — assignment submissions on the coach's own
 * programs, oldest first. Filter by status and program; a review opens GradingReviewDrawer and the
 * row leaves the pending list as soon as it's graded (list refetch, no page reload).
 */
const GradingQueueTable = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [programId, setProgramId] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);

  const queueQuery = useQuery({
    queryFn: () => getGradingQueue({ status, program_id: programId || undefined, limit: PAGE_SIZE, offset }),
    queryKey: [queryKeys.certificationGradingQueue, status, programId, offset],
  });
  const programsQuery = useQuery({ queryFn: getMyPrograms, queryKey: [queryKeys.certificationMyPrograms] });
  useHandleApiResponse(queueQuery.failureReason);

  const { mutateAsync: grade, isPending: isGrading } = useMutation({ mutationFn: gradeSubmission });

  const page = queueQuery.data?.data;
  const submissions = page?.results || [];
  const programs = programsQuery.data?.data || [];

  const handleGrade = async payload => {
    try {
      const { data } = await grade({ id: selected.id, payload });
      toast.success(data?.message || 'Review saved');
      setSelected(null);
      await queryClient.invalidateQueries([queryKeys.certificationGradingQueue]);
    } catch (error) {
      toastApiError(error);
    }
  };

  const columns = useMemo(
    () => [
      { header: 'Learner', accessorKey: 'learner_name' },
      { header: 'Program', accessorKey: 'program_title' },
      {
        header: 'Lesson',
        accessorKey: 'lesson_title',
        cell: ({ row }) => `${row.original.module_title} › ${row.original.lesson_title}`,
      },
      {
        header: 'Submitted',
        accessorKey: 'submitted_at',
        cell: ({ row }) => `${new Date(row.original.submitted_at).toLocaleDateString()} · #${row.original.attempt_number}`,
      },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <SubmissionStatusBadge status={row.original.status} /> },
      {
        id: 'review',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelected(row.original)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:border-primary hover:text-primary"
          >
            {row.original.status === 'pending' ? 'Review' : 'View'}
          </button>
        ),
      },
    ],
    []
  );

  const changeFilter = setter => value => {
    setter(value);
    setOffset(0);
  };

  return (
    <div>
      <PageHeader title="Grading Queue" />
      <p className="-mt-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
        Assignment submissions from learners in your certification programs. Quizzes are graded automatically.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeFilter(setStatus)(filter.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                status === filter.value ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by program"
          value={programId}
          onChange={event => changeFilter(setProgramId)(event.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-strokedark dark:bg-boxdark"
        >
          <option value="">All programs</option>
          {programs.map(program => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
      </div>

      <BasicTable isLoading={queueQuery.isLoading} columns={columns} data={submissions} />
      {!queueQuery.isLoading && submissions.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">Nothing here — no submissions match these filters.</p>
      ) : null}

      {page?.count > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <span className="text-gray-500">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, page.count)} of {page.count}
          </span>
          <button type="button" disabled={!page.previous} onClick={() => setOffset(offset - PAGE_SIZE)} className="rounded-md border px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          <button type="button" disabled={!page.next} onClick={() => setOffset(offset + PAGE_SIZE)} className="rounded-md border px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </div>
      ) : null}

      <GradingReviewDrawer submission={selected} isSubmitting={isGrading} onClose={() => setSelected(null)} onGrade={handleGrade} />
    </div>
  );
};

export default GradingQueueTable;
