import AudioSessionsList from '@/components/lms/session/audio/AudioSessionsList';

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
