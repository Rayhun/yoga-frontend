import LoadingWrapper from '@/components/common/loader/Wrapper';
import { getCocernList } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const GoalCategories = ({ selected, setSelected }) => {
  const { isFetching, data: concernList } = useQuery({
    queryFn: getCocernList,
    queryKey: [queryKeys.concernList],
  });

  const onSelect = item => {
    setSelected(pre => (pre === item ? '' : item));
  };

  useEffect(() => {
    if (concernList?.data?.data?.length > 0) setSelected(concernList?.data?.data?.at(0));
  }, [concernList?.data?.data, setSelected]);

  if (concernList?.data?.data?.length === 0 && !isFetching)
    return <div className="flex justify-center items-center h-full">No Concerns Found</div>;

  return (
    <LoadingWrapper isLoading={isFetching}>
      <div className="overflow-x-auto flex gap-2 no-scrollbar">
        {concernList?.data?.data?.map((concern, index) => (
          <div
            key={`${concern}-${index}`}
            className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
              selected === concern ? 'bg-primary border-primary text-white' : 'text-gray-400 border-gray-400'
            }`}
            onClick={() => onSelect(concern)}
          >
            {concern}
          </div>
        ))}
      </div>
    </LoadingWrapper>
  );
};

export default GoalCategories;
