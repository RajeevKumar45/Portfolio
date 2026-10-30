import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'md' | 'lg';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-200 ease-out [&_svg]:size-[1.05em] [&_svg]:shrink-0';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-fg text-canvas shadow-[0_1px_2px_rgb(28_25_23/0.2),0_10px_24px_-12px_rgb(28_25_23/0.55)] hover:bg-stone-800',
  secondary: 'border border-line-strong bg-surface text-fg hover:border-fg/30 hover:bg-sunken',
};

const sizes: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
};

/** Class names for links and buttons that share the button look. */
export function buttonClasses(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra?: string): string {
  return cn(base, variants[variant], sizes[size], extra);
}
