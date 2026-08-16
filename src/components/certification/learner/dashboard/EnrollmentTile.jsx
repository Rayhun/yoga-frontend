import LinearProgress from '@mui/material/LinearProgress';
import { FaRegFileImage } from 'react-icons/fa';
import { BiCheckCircle } from 'react-icons/bi';

const BUTTON_LABEL = {
  active_started: 'Continue Learning',
  active_not_started: 'Start Learning',
  completed: 'View Program',
};

const EnrollmentTile = ({ enrollment, onClick }) => {
  const { program, status, progress_percent: progressPercent, module_count: moduleCount } = enrollment;
  const isCompleted = status === 'completed';
  const buttonKey = isCompleted ? 'completed' : progressPercent > 0 ? 'active_started' : 'active_not_started';

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer hover:shadow-2xl hover:scale-[1.01]"
      onClick={onClick}
    >
      <div className="h-32 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {program.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
        ) : (
          <FaRegFileImage className="text-4xl text-gray-300" />
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 w-fit">
            <BiCheckCircle className="text-base" /> Completed
          </span>
        )}

        <h4 className="text-base font-bold text-gray-900 line-clamp-2">{program.title}</h4>
        {program.creator_display_name && <p className="text-sm text-gray-500">By {program.creator_display_name}</p>}
        <p className="text-xs text-gray-400">
          {moduleCount} module{moduleCount === 1 ? '' : 's'}
        </p>

        <div className="flex-1" />

        {!isCompleted && (
          <div className="flex flex-col gap-1.5">
            <LinearProgress
              variant="determinate"
              color="secondary"
              className="rounded-full !h-2"
              value={Number(progressPercent) || 0}
            />
            <p className="text-xs text-gray-500">{Math.round(Number(progressPercent) || 0)}% complete</p>
          </div>
        )}

        <button
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
          className="mt-1 py-2 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
        >
          {BUTTON_LABEL[buttonKey]}
        </button>
      </div>
    </div>
  );
};

export default EnrollmentTile;
