export const RELIEF_CARD =
  'rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)]';

export const RELIEF_CARD_HOVER =
  `${RELIEF_CARD} transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]`;

export const RELIEF_SECTION_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400';

export function SectionTitle({ title, className = '' }) {
  if (!title) return null;
  return <h2 className={`${RELIEF_SECTION_LABEL} ${className}`}>{title}</h2>;
}

export function EmptyState({ icon = '🌿', title, description }) {
  return (
    <div className={`${RELIEF_CARD} flex flex-col items-center px-6 py-14 text-center`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
        {icon}
      </span>
      <h3 className="mt-4 font-serif text-xl text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

export function ContentPanel({ children, className = '' }) {
  return (
    <div className={`${RELIEF_CARD} p-5 md:p-6 ${className}`}>{children}</div>
  );
}
