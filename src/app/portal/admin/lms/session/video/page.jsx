import VideoSessionsList from '@/components/lms/session/video/admin/VideoSessionsList';

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
