import Spinner from './Spinner';

const LoadingWrapper = ({ isLoading = false, children, spinnerSize = 30 }) => {
  if (isLoading)
    return (
      <div className="text-center mt-5">
        <Spinner size={spinnerSize} />
      </div>
    );

  return children;
};

export default LoadingWrapper;
