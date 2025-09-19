'use client';
import { getPublicFrequentlyAskedQuestion } from '@/services/private/faqs';
import queryKeys from '@/utils/query-keys';
import React, { useState } from 'react';
import { GoPlus } from 'react-icons/go';
import LoadingWrapper from '../loader/Wrapper';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const FAQsList = () => {
  const [expanded, setExpanded] = useState(false);

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: getPublicFrequentlyAskedQuestion,
    queryKey: [queryKeys.publicFrequentlyAskedQuestions],
  });

  useHandleApiResponse(failureReason);

  const handleChange = panel => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = response?.data?.data || [];

  return (
    <div className="max-w-3xl mx-auto p-4 mt-8">
      <LoadingWrapper isLoading={isLoading}>
        <h2 className="text-center text-2xl text-gray-900 font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-white rounded-lg shadow-lg">
              <div
                className={`border-b border-gray-300 p-4 flex justify-between items-center cursor-pointer ${
                  expanded === `panel${faq?.id}` ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleChange(`panel${faq.id}`)(null, expanded !== `panel${faq.id}`)}
              >
                <h3 className="text-lg font-medium text-gray-800">{faq?.title}</h3>
                <GoPlus
                  className={`text-primary transform transition-transform ${
                    expanded === `panel${faq?.id}` ? 'rotate-45' : ''
                  }`}
                  size={24}
                />
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expanded === `panel${faq?.id}` ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="p-4 bg-gray-50">
                  <ControllableRichText className="text-gray-700 text-sm">{faq?.description || 'No answer provided'}</ControllableRichText>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default FAQsList;
