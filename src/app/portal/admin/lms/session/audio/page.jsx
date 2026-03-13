import AudioSessionsList from '@/components/lms/session/audio/admin/AudioSessionsList';

export const metadata = {
  title: 'Audio Sessions',
};

const Page = () => {
  return (
    <div>
      <AudioSessionsList />
    </div>
  );
};

export default Page;
