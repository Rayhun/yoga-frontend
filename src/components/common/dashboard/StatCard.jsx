/**
 * One KPI tile: icon circle, big number, label, and an optional trend (`change_percent` + `change_direction`)
 * or `live_label` in the top-right corner. `subline` is an optional small line under the label (the
 * creator dashboard uses it for "N live"); it renders nothing when absent, so existing callers look the same.
 */
const EXPERT_VALUE_CLASSES = 'font-serif text-3xl font-semibold tracking-tight text-gray-900';

const StatCard = ({ stat, Icon, subline, valueClassName = EXPERT_VALUE_CLASSES }) => {
  const showChange = typeof stat.change_percent === 'number';
  const isUp = stat.change_direction !== 'down';

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {stat.live_label ? (
        <span className="absolute right-4 top-4 text-xs font-semibold text-[#2E7D32]">
          {stat.live_label}
        </span>
      ) : showChange ? (
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-0.5 text-xs font-semibold ${
            isUp ? 'text-[#2E7D32]' : 'text-red-500'
          }`}
        >
          <span aria-hidden>{isUp ? '▲' : '▼'}</span>
          {Math.abs(stat.change_percent)}%
        </span>
      ) : null}

      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: stat.icon_bg || '#F3F4F6', color: stat.icon_color || '#6B7280' }}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className={valueClassName}>{stat.value_display}</p>
      <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
      {subline ? <p className="mt-0.5 text-xs text-gray-500">{subline}</p> : null}
    </div>
  );
};

export default StatCard;
