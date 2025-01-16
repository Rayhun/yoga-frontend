import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const ProgramCard = ({ program, onClick }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default cursor-pointer overflow-hidden dark:bg-boxdark"
      onClick={onClick}
    >
      <Image
        width={200}
        height={200}
        src={program.image}
        alt="image"
        className="w-full h-52 object-cover rounded-t-lg"
      />

      <div className="p-4 flex flex-col gap-1">
        <h4 className="text-xl font-semibold block truncate text-black dark:text-white">{program.title}</h4>
        <div className="flex gap-2 items-center text-gray-400">
          <p>5 modules</p>
          <GoDotFill size={10} />
          <p>25 sessions</p>
        </div>
        <p className="break-words line-clamp-2 text-gray-400" title={program.description}>
          {program.description}
        </p>
      </div>
    </div>
  );
};

export default ProgramCard;
