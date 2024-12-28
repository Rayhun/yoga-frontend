import { useMemo } from 'react';
import Spinner from '@/components/common/loader/Spinner';
import { useUI } from '@/context/UIProvider';

const BUTTON_VARIANT = {
  primary: 'primary',
  secondary: 'secondary',
};

const BUTTON_SIZE = {
  xs: 'xs',
  sm: 'sm',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
  '3xl': '3xl',
  '4xl': '4xl',
  '5xl': '5xl',
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
    if (size === BUTTON_SIZE.xs) return 'px-1 py-0.5';
    if (size === BUTTON_SIZE.sm) return 'px-2 py-1';
    if (size === BUTTON_SIZE.md) return 'px-3 py-1.5';
    if (size === BUTTON_SIZE.lg) return 'px-4 py-2';
    if (size === BUTTON_SIZE.xl) return 'px-5 py-2.5';
    if (size === BUTTON_SIZE['2xl']) return 'px-6 py-3';
    if (size === BUTTON_SIZE['3xl']) return 'px-7 py-3.5';
    if (size === BUTTON_SIZE['4xl']) return 'px-8 py-4';
    if (size === BUTTON_SIZE['5xl']) return 'px-9 py-4.5';

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
