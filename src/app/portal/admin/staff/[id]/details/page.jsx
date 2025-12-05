import StaffUserDetails from '@/components/entities/staff/StaffUserDetails';

export const metadata = {
  title: 'Staff User Details',
};

const Page = async ({ params }) => {
  const resolvedParams = await params;
  console.log('Details page params:', resolvedParams);
  console.log('Details page staffUserId:', resolvedParams.id);
  
  return (
    <div>
      <StaffUserDetails staffUserId={resolvedParams.id} />
    </div>
  );
};

export default Page;
