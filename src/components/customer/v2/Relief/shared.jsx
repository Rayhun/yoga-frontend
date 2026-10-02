import {
  RELIEF_CARD,
  RELIEF_CARD_HOVER,
  RELIEF_SECTION_LABEL,
} from './reliefDashboardUi';

export { RELIEF_CARD, RELIEF_CARD_HOVER, RELIEF_SECTION_LABEL };

export function SectionTitle({ title, className = '' }) {
  if (!title) return null;
  return <h2 className={`${RELIEF_SECTION_LABEL} ${className}`}>{title}</h2>;
}

export function EmptyState({ icon = '🌿', title, description }) {
  return (
    <div className={`${RELIEF_CARD} flex flex-col items-center px-6 py-14 text-center lg:px-10 lg:py-16`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl lg:h-20 lg:w-20 lg:text-4xl">
        {icon}
      </span>
      <h3 className="mt-4 font-serif text-xl text-gray-900 lg:text-2xl">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500 lg:max-w-md lg:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ContentPanel({ children, className = '' }) {
  return (
    <div className={`${RELIEF_CARD} p-5 md:p-6 lg:p-7 ${className}`}>{children}</div>
  );
}
