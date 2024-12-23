import Spinner from '@/components/common/Spinner';

const FullScreenLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <Spinner size={60} />
    </div>
  );
};

export default FullScreenLoader;
