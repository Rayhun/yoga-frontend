'use client';
import ControllableText from '@/components/common/details/ControllableText';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { getCustomerJournalList } from '@/services/private/customer/journal';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React from 'react';
import { FaRegHeart } from 'react-icons/fa';
const PastDiaries = () => {
  const {
    isLoading,
    data: journals,
  } = useQuery({
    queryFn: getCustomerJournalList,
    queryKey: [queryKeys.journalList],
  });

  return (
    <LoadingWrapper isLoading={isLoading}>
      <h4 className="text-xl text-dark font-semibold">Past Diaries</h4>
      <div className="space-y-4 p-6 max-h-[500px] overflow-y-auto no-scrollbar">
        {journals?.data?.map((item, index) => (
          <div key={index} className="border bg-white rounded-lg shadow p-4 flex gap-3 items-start">
            <div className="text-orange-400 mt-1 bg-orange-100 rounded-full p-1">
              <FaRegHeart size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {dayjs(item.date).format('dddd MMMM D')}
                {dayjs(item.date).isSame(dayjs(), 'day') ? ' (Today)' : ''}
              </p>
              <ControllableText>{item?.description}</ControllableText>
            </div>
          </div>
        ))}
      </div>
    </LoadingWrapper>
  );
};

export default PastDiaries;
