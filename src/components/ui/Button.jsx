import { cn } from '../../lib/utils';

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const variants = {
    primary: 'bg-[var(--geist-foreground)] text-[var(--geist-background)] hover:opacity-90',
    secondary: 'bg-[var(--accents-1)] text-[var(--geist-foreground)] border border-[var(--geist-border)] hover:bg-[var(--accents-2)]',
    ghost: 'bg-transparent text-[var(--geist-foreground)] hover:bg-[var(--accents-1)]',
    brand: 'bg-brand text-white hover:opacity-90',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-geist-button font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
