import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import { getLessonHref } from '@/components/certification/session/lessonTypes';
import { metaLabel } from '@/components/certification/learner/catalogModel';
import { credentialBlocks, curriculumModel, overviewModel } from './detailTabs';

const SECTION_TITLE = 'text-lg font-bold text-gray-900 dark:text-white mb-3';

export const OverviewPanel = ({ program }) => {
  const { description, objectives, facts } = overviewModel(program);
  if (!description && objectives.length === 0 && facts.length === 0) {
    return <p className="text-gray-500">No overview has been provided for this program yet.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      {description && <p className="whitespace-pre-line dark:text-white">{description}</p>}
      {facts.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {facts.map(fact => (
            <div key={fact.label} className="rounded-xl border border-gray-100 dark:border-strokedark p-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">{fact.label}</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {objectives.length > 0 && (
        <div>
          <h3 className={SECTION_TITLE}>What you will learn</h3>
          <ul className="list-disc ps-5 grid grid-cols-1 md:grid-cols-2 gap-2 dark:text-white">
            {objectives.map(objective => <li key={objective}>{objective}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

const LessonRow = ({ lesson, href }) => {
  const Icon = lesson.chip.icon;
  const content = (
    <>
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${lesson.chip.className}`} data-chip={lesson.chip.type}>
        <Icon size={12} aria-hidden="true" /> {lesson.chip.label}
      </span>
      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{lesson.title}</span>
      {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration}</span>}
    </>
  );
  const className = 'flex min-h-[44px] items-center gap-3 py-2';
  return href ? <Link href={href} className={`${className} hover:text-primary`}>{content}</Link> : <div className={className}>{content}</div>;
};

// Outline only: module/lesson titles, types and durations. Lesson content and URLs are never read here.
export const CurriculumPanel = ({ program, isEnrolled, programId }) => {
  const { modules, moduleCount, lessonCount, totalDuration } = curriculumModel(program, isEnrolled);
  if (modules.length === 0) return <p className="text-gray-500">The curriculum has not been published yet.</p>;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {metaLabel({ module_count: moduleCount, lesson_count: lessonCount })}
        {totalDuration && ` • ${totalDuration}`}
      </p>
      <ol className="flex flex-col gap-4">
        {modules.map(module => (
          <li key={module.id} className="rounded-xl border border-gray-100 dark:border-strokedark p-4">
            <div className="flex items-center gap-2">
              {module.locked && <FiLock size={16} className="text-gray-500" aria-label="Locked" />}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {!module.locked ? (
                  <Link href={`/portal/customer/certification/module/${module.id}/details?program=${programId}`} className="hover:text-primary">
                    {module.title}
                  </Link>
                ) : module.title}
              </h3>
            </div>
            {module.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{module.description}</p>}
            {module.lessons.length > 0 && (
              <ul className="mt-2 divide-y divide-gray-100 dark:divide-strokedark">
                {module.lessons.map(lesson => (
                  <li key={lesson.id} className="flex items-center gap-2">
                    {module.locked && <FiLock size={14} className="shrink-0 text-gray-400" aria-hidden="true" />}
                    <div className="flex-1">
                      <LessonRow lesson={lesson} href={module.locked ? null : getLessonHref(lesson.id, programId)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

// Each block renders only when the API gave data for it; see detailTabs.credentialBlocks.
export const CredentialsPanel = ({ program }) => {
  const blocks = credentialBlocks(program);
  if (blocks.length === 0) return <p className="text-gray-500">Credential details have not been published for this program yet.</p>;
  return (
    <dl className="grid grid-cols-1 gap-4">
      {blocks.map(block => (
        <div key={block.key} data-block={block.key} className="rounded-xl border border-gray-100 dark:border-strokedark p-4">
          <dt className="text-xs uppercase tracking-wide text-gray-500">{block.label}</dt>
          <dd className={`mt-1 text-gray-900 dark:text-white ${block.kind === 'paragraph' ? 'whitespace-pre-line text-sm' : 'font-semibold'}`}>{block.value}</dd>
        </div>
      ))}
    </dl>
  );
};
