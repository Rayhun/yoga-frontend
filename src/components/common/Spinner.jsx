import { useUI } from '@/context/UIProvider';
import { LuLoaderCircle } from 'react-icons/lu';

const Loader = ({ size = 30, color }) => {
  const { theme } = useUI();

  const spinnerColor = color || theme.colors.primary;

  return <LuLoaderCircle className="animate-spin" size={size} color={spinnerColor} />;
};

export default Loader;
