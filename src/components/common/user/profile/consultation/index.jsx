import React from 'react';
import Spinner from '@/components/common/loader/Spinner';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import ConsultationCard from '@/components/lms/common/ConsultationCard';
import { GoPlus } from 'react-icons/go';

const UserProfileConsultations = ({
  filteredConsultations,
  isLoadingConsultations,
  setSearchText,
  onClickConsultation,
  isExpertView = false,
}) => {
  const router = useRouter();
  return (
    <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">1:1 Personal Consultation</h2>
        <div className="w-full md:w-auto flex gap-4 items-center justify-end flex-wrap-reverse">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Consultations"
            onChange={e => setSearchText(e.target.value || '')}
          />
          {isExpertView && (
            <Button
              size="lg"
              className="text-md"
              onClick={() => router.push('/portal/teacher/consultation/add')}
              Icon={GoPlus}
            >
              New Personal Consultation
            </Button>
          )}
        </div>
      </div>
      {isLoadingConsultations ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredConsultations.map(consultation => (
            <ConsultationCard
              key={consultation.id}
              consultation={consultation}
              onClick={() => onClickConsultation(consultation)}
              isExpertView={isExpertView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfileConsultations;
