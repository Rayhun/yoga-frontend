import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const CustomerProgramCard = ({ program, onClick }) => {
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
        <h4 className="text-lg font-semibold block truncate text-black dark:text-white">{program.title}</h4>
        <div className="flex gap-1 items-center text-sm text-gray-500">
          <p>{program.modules} modules</p>
          <GoDotFill size={8} />
          <p>{program.sessions} sessions</p>
        </div>
        <p className="break-words line-clamp-1 text-sm text-gray-400" title={program.description}>
          {program.experts.join(', ')}
        </p>
      </div>
    </div>
  );
};

export default CustomerProgramCard;
