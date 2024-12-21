import { useMemo } from 'react';
import Spinner from '@/components/common/Spinner';
import { useUI } from '@/context/UIProvider';

const BUTTON_VARIANT = {
  primary: 'primary',
  secondary: 'secondary',
};

const Button = ({
  variant = BUTTON_VARIANT.primary,
  className,
  disabled,
  isLoading = false,
  children,
  ...rest
}) => {
  const { theme } = useUI();

  const defaultButtonClass =
    'w-full rounded-lg border flex justify-center items-center gap-2 disabled:opacity-[0.5]';

  const buttonVariantClasses = useMemo(() => {
    if (variant === BUTTON_VARIANT.primary)
      return `${defaultButtonClass} border-primary bg-primary p-4 text-white transition hover:bg-opacity-90`;
    if (variant === BUTTON_VARIANT.secondary)
      return `${defaultButtonClass} border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50`;

    return defaultButtonClass;
  }, [variant]);

  const variantContrastColor = useMemo(() => {
    if (variant === BUTTON_VARIANT.primary) return theme.colors?.stroke;
    if (variant === BUTTON_VARIANT.secondary) return theme.colors?.primary;
    return theme.colors?.primary;
  }, [theme.colors, variant]);

  return (
    <button {...rest} className={`${buttonVariantClasses} ${className}`} disabled={isLoading || disabled}>
      {isLoading ? <Spinner size={24} color={variantContrastColor} /> : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
