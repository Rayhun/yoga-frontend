import StaffUserForm from '@/components/entities/staff/StaffUserForm';

export const metadata = {
  title: 'Edit Staff User',
};

const Page = async ({ params }) => {
  const resolvedParams = await params;
  console.log('Edit page params:', resolvedParams);
  console.log('Edit page staffUserId:', resolvedParams.id);
  
  return (
    <div>
      <StaffUserForm staffUserId={resolvedParams.id} />
    </div>
  );
};

export default Page;
