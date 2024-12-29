'use client';
import { useQuery } from '@tanstack/react-query';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { getSingleExpert } from '@/services/private/lms/experts';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const { data: response, isLoading } = useQuery({
    queryFn: () => getSingleExpert({ id: params.id }),
    queryKey: [queryKeys.lmsExperts, params.id],
  });

  if (isLoading) return <PageLoader />;

  const expertDetails = response.data.data || {};

  return (
    <div>
      <PageHeader title="Expert Details" />
      <DetailsLayoutWrapper title="Expert">
        <div className="flex flex-col gap-5">
          <DetailsRecord label="Name">{expertDetails.name}</DetailsRecord>
          <DetailsRecord label="Email">{expertDetails.email}</DetailsRecord>
          <DetailsRecord label="Title">{expertDetails.title}</DetailsRecord>
          <DetailsRecord label="Description">{expertDetails.description}</DetailsRecord>
          <DetailsRecord label="Categories">
            <div className="flex gap-2">
              {expertDetails.categories.map(category => (
                <Chip
                  key={category.id}
                  label={category.name}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          <DetailsRecord label="Tags">
            <div className="flex gap-2">
              {expertDetails.tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          {expertDetails?.file_link ? (
            <DetailsRecord label="Avatar">
              <Avatar alt={expertDetails.name} src={expertDetails.file_link} />
            </DetailsRecord>
          ) : null}
        </div>
      </DetailsLayoutWrapper>
    </div>
  );
};

export default Page;
