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
  Icon,
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
      return 'border-stroke bg-gray-100 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50';

    return '';
  }, [variant]);

  const buttonSizeClasses = useMemo(() => {
    if (size === BUTTON_SIZE.xs) return 'px-1 py-0.5 text-xs';
    if (size === BUTTON_SIZE.sm) return 'px-2 py-1 text-xs';
    if (size === BUTTON_SIZE.md) return 'px-3 py-1.5 text-sm';
    if (size === BUTTON_SIZE.lg) return 'px-4 py-2 text-sm';
    if (size === BUTTON_SIZE.xl) return 'px-5 py-2.5 text-md';
    if (size === BUTTON_SIZE['2xl']) return 'px-6 py-3 text-md';
    if (size === BUTTON_SIZE['3xl']) return 'px-7 py-3.5 text-lg';
    if (size === BUTTON_SIZE['4xl']) return 'px-8 py-4 text-lg';
    if (size === BUTTON_SIZE['5xl']) return 'px-9 py-4.5 text-lg';

    return '';
  }, [size]);

  const variantContrastColor = useMemo(() => {
    if (variant === BUTTON_VARIANT.primary) return theme.colors?.stroke;
    if (variant === BUTTON_VARIANT.secondary) return theme.colors?.primary;
    return theme.colors?.primary;
  }, [theme.colors, variant]);

  const iconSize = useMemo(() => {
    if ([BUTTON_SIZE.xs, BUTTON_SIZE.sm].includes(size)) return 14;
    if ([BUTTON_SIZE.md, BUTTON_SIZE.lg].includes(size)) return 18;
    if ([BUTTON_SIZE.xl, BUTTON_SIZE['2xl']].includes(size)) return 22;
    if ([BUTTON_SIZE['3xl'], BUTTON_SIZE['4xl'], BUTTON_SIZE['5xl']].includes(size)) return 28;

    return 16;
  }, [size]);

  const StartIcon = isLoading ? Spinner : Icon;

  return (
    <button
      {...rest}
      className={`${defaultButtonClasses} ${buttonVariantClasses} ${buttonSizeClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={isLoading || disabled}
    >
      {StartIcon ? <StartIcon size={iconSize} color={variantContrastColor} /> : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
