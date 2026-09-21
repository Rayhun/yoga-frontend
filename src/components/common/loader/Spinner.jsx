'use client';
import { useUI } from '@/context/UIProvider';
import CircularProgress from '@mui/material/CircularProgress';

const Spinner = ({ size = 30, color, thickness = 4 }) => {
  const { theme } = useUI();

  const spinnerColor = color || theme?.colors?.primary || '#16a34a';

  return <CircularProgress size={size} thickness={thickness} sx={{ color: spinnerColor }} />;
};

export default Spinner;
