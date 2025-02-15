import Spinner from './Spinner';

const LoadingWrapper = ({ isLoading = false, children }) => {
  if (isLoading)
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );

  return children;
};

export default LoadingWrapper;
