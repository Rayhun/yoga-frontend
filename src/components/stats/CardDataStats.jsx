import React from 'react';

const CardDataStats = ({ 
  title, 
  total, 
  rate, 
  levelUp, 
  levelDown, 
  highlight = null, 
  children, 
  onClick,
  gradient = 'from-blue-500 to-purple-600',
  iconBg = 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
}) => {
  return (
    <div 
      className={`group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white px-6 py-6 shadow-sm transition-all duration-300 dark:border-gray-700/50 dark:bg-gray-800/50 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-primary/20' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
      
      {/* Decorative Corner Element */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          {React.cloneElement(children, { 
            className: `${children.props.className || ''}`,
            size: 24
          })}
        </div>

        {/* Content */}
        <div className="mt-5 flex items-end justify-between">
          <div className='flex flex-col gap-1.5'>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {total || '0'}
            </h4>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </span>
            {highlight && (
              <span className='text-xs font-medium text-gray-500 dark:text-gray-500'>
                {highlight}
              </span>
            )}
          </div>

          {rate && (
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                levelUp ? 'text-green-600 dark:text-green-400' : 
                levelDown ? 'text-red-600 dark:text-red-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}
            >
              {rate}

              {levelUp && (
                <svg
                  className="fill-green-600 dark:fill-green-400"
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                    fill=""
                  />
                </svg>
              )}
              {levelDown && (
                <svg
                  className="fill-red-600 dark:fill-red-400"
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                    fill=""
                  />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
