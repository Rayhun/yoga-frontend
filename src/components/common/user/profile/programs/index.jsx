import React from 'react';
import ProgramCard from '@/components/lms/program/customer/ProgramCard';
import Spinner from '@/components/common/loader/Spinner';
import { GoPlus } from 'react-icons/go';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

const UserProfilePrograms = ({
  filteredPrograms,
  isLoadingPrograms,
  setSearchText,
  onClickProgram,
  isExpertView = false,
}) => {
  const router = useRouter();
  return (
    <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Programs</h2>
        <div className="w-full md:w-auto flex gap-4 items-center justify-end flex-wrap-reverse">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Programs"
            onChange={e => setSearchText(e.target.value || '')}
          />
          {isExpertView && (
            <Button
              size="lg"
              className="text-md flex gap-2"
              onClick={() => router.push('/portal/teacher/program/upload')}
              Icon={GoPlus}
            >
              Upload Programs
            </Button>
          )}
        </div>
      </div>
      {isLoadingPrograms ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onClick={() => onClickProgram(program)}
              isExpertView={isExpertView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePrograms;
