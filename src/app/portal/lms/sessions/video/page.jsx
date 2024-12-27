import VideoSessionsList from '@/components/lms/sessions/video/VideoSessionsList';

export const metadata = {
  title: 'Video Sessions',
};

const Page = () => {
  return (
    <div>
      <VideoSessionsList />
    </div>
  );
};

export default Page;
