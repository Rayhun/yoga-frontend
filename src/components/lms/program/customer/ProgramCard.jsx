import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const ProgramCard = ({ program, onClick, isExpertView = false }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default overflow-hidden dark:bg-boxdark"
      // onClick={onClick}
    >
      <div className="aspect-[16/9]">
        <Image
          width={200}
          height={200}
          src={program.image}
          alt="image"
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h4 className="text-lg font-semibold block truncate text-black dark:text-white">{program.title}</h4>
        <div className="flex gap-1 flex-wrap items-center text-sm text-gray-500">
          {program?.is_paid && program?.price && (
            <>
              <p>{`${program.currency_symbol || '$'} ${program.price}`}</p>
              <GoDotFill size={8} />
            </>
          )}
          <p>{program.modules} modules</p>
          <GoDotFill size={8} />
          <p>{program.sessions} sessions</p>
        </div>
        <p className="break-words line-clamp-1 text-sm text-gray-400" title={program.description}>
          {program.experts.join(', ') || 'No experts'}
        </p>
        {program?.is_enroll || program?.status === 'InProgress' || isExpertView ? (
          <button
            onClick={onClick}
            className="w-full mt-4 py-1 px-4 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            View Details
          </button>
        ) : (
          <button
            onClick={onClick}
            className="w-full mt-4 py-1 px-4 border border-primary text-primary rounded-xl bg-primary text-white transition-colors duration-200 font-medium text-sm"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgramCard;
