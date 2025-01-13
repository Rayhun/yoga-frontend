import UsersList from '@/components/entities/users/UsersList';

export const metadata = {
  title: 'Users',
};

const Page = () => {
  return (
    <div>
      <UsersList />
    </div>
  );
};

export default Page;
