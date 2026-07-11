'use client';

const GEM_STYLES = [
  { gradient: 'from-emerald-300/30 to-emerald-500/10', border: 'border-emerald-300/40' },
  { gradient: 'from-amber-200/35 to-orange-400/10', border: 'border-amber-300/40' },
  { gradient: 'from-teal-200/30 to-cyan-400/10', border: 'border-teal-300/40' },
];

const JoinCircleMetrics = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="pt-1">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => {
          const style = GEM_STYLES[index % GEM_STYLES.length];
          const isCenter = index === 1;

          return (
            <div
              key={item.label || index}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b p-3 text-center transition-transform hover:scale-105 ${style.gradient} ${style.border} ${
                isCenter ? '-translate-y-1 shadow-lg' : ''
              }`}
            >
              <div className="pointer-events-none absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white/10 blur-sm" />
              <p className="relative font-serif text-xl font-bold text-white">{item.value}</p>
              <p className="relative mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/70">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JoinCircleMetrics;
