import { PageHeader } from '@/components/common/page';
import GroupForm from '@/components/chat/group/GroupForm';

export const metadata = {
  title: 'Add New Group',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Group" />
      <GroupForm />
    </div>
  );
};

export default Page;
