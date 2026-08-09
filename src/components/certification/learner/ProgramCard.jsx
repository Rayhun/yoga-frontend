const CREATOR_TYPE_LABELS = {
  qte: 'Coach',
  expert: 'Coach',
  institution: 'Institution',
};

const TARGET_AUDIENCE_LABELS = {
  career: 'Career Track',
  professional: 'Professional Track',
  both: 'Career & Professional',
};

const ProgramCard = ({ program, onClick }) => {
  const isFull = program.seat_limit !== null && program.seats_remaining === 0;
  const isFree = program.payment_type === 'free';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer ${
        isFull ? 'opacity-70' : 'hover:shadow-2xl hover:scale-[1.01]'
      }`}
      onClick={onClick}
    >
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          {program.creator_type && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
              {CREATOR_TYPE_LABELS[program.creator_type] || 'Coach'}
            </span>
          )}
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {TARGET_AUDIENCE_LABELS[program.target_audience] || program.target_audience}
          </span>
        </div>

        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">{program.title}</h4>

        {program.creator_display_name && <p className="text-sm text-gray-500">By {program.creator_display_name}</p>}

        <div className="text-sm text-gray-600">
          {program.module_count} module{program.module_count === 1 ? '' : 's'}
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">
            {isFree ? 'Free' : `${program.currency} ${program.price}`}
          </span>
          {isFull ? (
            <span className="text-sm font-semibold text-red-500">Full</span>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onClick();
              }}
              className="py-2 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;
