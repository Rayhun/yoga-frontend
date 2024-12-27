import { useMemo } from 'react';
import Spinner from '@/components/common/loader/Spinner';
import { useUI } from '@/context/UIProvider';

const BUTTON_VARIANT = {
  primary: 'primary',
  secondary: 'secondary',
};

const BUTTON_SIZE = {
  small: 'small',
  medium: 'medium',
  large: 'large',
};

const Button = ({
  variant = BUTTON_VARIANT.primary,
  size = BUTTON_SIZE.medium,
  className = '',
  disabled,
  isLoading = false,
  fullWidth = false,
  children,
  ...rest
}) => {
  const { theme } = useUI();

  const defaultButtonClasses =
    'rounded-lg border flex justify-center items-center gap-2 disabled:opacity-[0.5] disabled:bg-initial disabled:cursor-not-allowed';

  const buttonVariantClasses = useMemo(() => {
    if (variant === BUTTON_VARIANT.primary)
      return 'border-primary bg-primary text-white transition hover:bg-opacity-90';
    if (variant === BUTTON_VARIANT.secondary)
      return 'border-stroke bg-gray hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50';

    return '';
  }, [variant]);

  const buttonSizeClasses = useMemo(() => {
    if (size === BUTTON_SIZE.small) return 'px-2 py-1';
    if (size === BUTTON_SIZE.medium) return 'px-3 py-1.5';
    if (size === BUTTON_SIZE.large) return 'px-4 py-2';

    return '';
  }, [size]);

  const variantContrastColor = useMemo(() => {
    if (variant === BUTTON_VARIANT.primary) return theme.colors?.stroke;
    if (variant === BUTTON_VARIANT.secondary) return theme.colors?.primary;
    return theme.colors?.primary;
  }, [theme.colors, variant]);

  return (
    <button
      {...rest}
      className={`${defaultButtonClasses} ${buttonVariantClasses} ${buttonSizeClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={isLoading || disabled}
    >
      {isLoading ? <Spinner size={24} color={variantContrastColor} /> : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
