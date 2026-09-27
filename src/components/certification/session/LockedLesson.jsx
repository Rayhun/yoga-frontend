import Link from 'next/link';
import { FiLock } from 'react-icons/fi';

const LockedLesson = ({ reason, backHref }) => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-lg shadow-md text-center dark:bg-boxdark">
    <div className="rounded-full bg-gray-100 p-5 dark:bg-gray-700">
      <FiLock size={36} className="text-gray-500" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">This lesson is locked</h3>
    <p className="max-w-md text-gray-600 dark:text-gray-300">
      {reason || 'This lesson will unlock as you progress through the program.'}
    </p>
    {backHref ? (
      <Link href={backHref} className="text-primary font-medium hover:underline">
        Back to the program
      </Link>
    ) : null}
  </div>
);

export default LockedLesson;
