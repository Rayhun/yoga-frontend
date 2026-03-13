import LoadingWrapper from '@/components/common/loader/Wrapper';
import { getCocernList } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const GoalCategories = ({ selected, setSelected }) => {
  const { isFetching, data: concernList } = useQuery({
    queryFn: getCocernList,
    queryKey: [queryKeys.concernList],
  });
  
  const scrollRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const onSelect = item => {
    setSelected(pre => (pre === item ? '' : item));
  };

  useEffect(() => {
    if (concernList?.data?.data?.length > 0) setSelected(concernList?.data?.data?.at(0));
  }, [concernList?.data?.data, setSelected]);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [concernList?.data?.data]);

  if (concernList?.data?.data?.length === 0 && !isFetching)
    return <div className="flex justify-center items-center h-full">No Concerns Found</div>;

  return (
    <LoadingWrapper isLoading={isFetching}>
      <div className="relative">
        <div 
          ref={scrollRef}
          className="overflow-x-auto flex gap-2 scrollbar-thin"
        >
          {concernList?.data?.data?.map((concern, index) => (
            <div
              key={`${concern}-${index}`}
              className={`text-xs md:text-sm border text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
                selected === concern ? 'bg-primary border-primary text-white' : 'text-gray-400 border-gray-400'
              }`}
              onClick={() => onSelect(concern)}
            >
              {concern}
            </div>
          ))}
        </div>
        
        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Scroll for more</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default GoalCategories;
