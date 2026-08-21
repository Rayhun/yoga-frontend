'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper } from '@/components/common/details';

const JsonBlock = ({ value }) => (
  <pre className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:border-strokedark dark:bg-strokedark dark:text-bodydark1">
    {value == null ? '—' : JSON.stringify(value, null, 2)}
  </pre>
);

const MetaItem = ({ label, children }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{children}</p>
  </div>
);

const Badge = ({ children, variant = 'neutral' }) => {
  const styles = {
    active:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    inactive: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark2',
    neutral:
      'border-slate-200 bg-white text-slate-700 dark:border-strokedark dark:bg-boxdark dark:text-bodydark1',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

const OnboardingQuizDetails = ({ data = {} }) => {
  const router = useRouter();
  const variants = data.variants || [];

  return (
    <DetailsLayoutWrapper
      title={data.sets_key ? `Question · ${data.sets_key}` : 'Onboarding question'}
      onEdit={() => router.push(`/portal/admin/onboarding/quiz/${data.id}/edit`)}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50/60 p-6 shadow-sm dark:border-strokedark dark:from-meta-4 dark:via-boxdark dark:to-boxdark md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={data.is_active ? 'active' : 'inactive'}>
                  {data.is_active ? 'Active in flow' : 'Inactive'}
                </Badge>
                <Badge variant="neutral">Order {data.order ?? '—'}</Badge>
                <Badge variant="neutral">{data.branch_rule}</Badge>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {data.tag_text}
                {data.tag_emoji ? (
                  <span className="ml-2 inline-block align-middle text-2xl" aria-hidden>
                    {data.tag_emoji}
                  </span>
                ) : null}
              </h2>
              <p className="text-sm text-slate-600 dark:text-bodydark2">
                Sets key <span className="font-mono font-medium text-slate-800 dark:text-bodydark1">{data.sets_key}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem label="Sets key">{data.sets_key ?? '—'}</MetaItem>
            <MetaItem label="Branch rule">{data.branch_rule ?? '—'}</MetaItem>
            <MetaItem label="Tag emoji">{data.tag_emoji || '—'}</MetaItem>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Variants</h3>
              <p className="text-sm text-slate-600 dark:text-bodydark2">
                {variants.length} variant{variants.length === 1 ? '' : 's'} configured for this question.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {variants.map(v => (
              <article
                key={v.id ?? v.variant_id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-strokedark dark:bg-boxdark"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-5 py-4 dark:border-strokedark dark:from-meta-4 dark:to-meta-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-teal-800 dark:text-teal-400">{v.variant_id}</p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-bodydark2">
                      <span className="font-medium text-slate-800 dark:text-bodydark1">{v.type}</span>
                      {v.is_default ? (
                        <span className="ml-2 rounded-md bg-teal-100 px-1.5 py-0.5 text-teal-900 dark:bg-teal-900/25 dark:text-teal-300">
                          default
                        </span>
                      ) : null}
                      {!v.is_active ? (
                        <span className="ml-2 rounded-md bg-slate-200 px-1.5 py-0.5 text-slate-700 dark:bg-strokedark dark:text-bodydark2">
                          inactive
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 p-5 md:p-6">
                  <div>
                    <p className="text-base font-medium text-slate-900 dark:text-white">{v.question_text}</p>
                    {v.sub_text ? (
                      <p className="mt-2 text-sm text-slate-600 dark:text-bodydark2">{v.sub_text}</p>
                    ) : null}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">
                      show_if
                    </p>
                    <JsonBlock value={v.show_if} />
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">
                      Options
                    </p>
                    <ul className="flex list-none flex-col gap-3">
                      {(v.options || []).map(opt => (
                        <li
                          key={opt.id ?? `${v.variant_id}-${opt.value}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-strokedark dark:bg-meta-4"
                        >
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-base font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                            <span className="font-mono text-xs text-slate-500 dark:text-bodydark2">({opt.value})</span>
                            {opt.emoji ? (
                              <span className="text-lg" aria-hidden>
                                {opt.emoji}
                              </span>
                            ) : null}
                          </div>
                          {opt.sub_label ? (
                            <p className="mt-2 text-sm text-slate-600 dark:text-bodydark2">{opt.sub_label}</p>
                          ) : null}
                          <div className="mt-3">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">
                              sets
                            </p>
                            <JsonBlock value={opt.sets} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default OnboardingQuizDetails;
