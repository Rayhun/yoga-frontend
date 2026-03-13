import Spinner from '@/components/common/loader/Spinner';

const FullScreenLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark-2">
      <Spinner size={60} />
    </div>
  );
};

export default FullScreenLoader;
