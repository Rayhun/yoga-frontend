import React from 'react';
import ProgramCard from '@/components/lms/program/customer/ProgramCard';
import Spinner from '@/components/common/loader/Spinner';

const UserProfilePrograms = ({ filteredPrograms, isLoadingPrograms, setSearchText, onClickProgram, isExpertView = false }) => {

  return (
    <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
      <div className="flex gap-4 items-center justify-end">
        <input
          className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Search Programs"
          onChange={e => setSearchText(e.target.value || '')}
        />
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