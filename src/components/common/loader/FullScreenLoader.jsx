import CircularProgress from '@mui/material/CircularProgress';

const FullScreenLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark-2">
      <CircularProgress size={60} />
    </div>
  );
};

export default FullScreenLoader;
