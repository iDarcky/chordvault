import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

const Button = React.forwardRef(({
  className,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] hover:bg-[var(--ds-gray-900)] focus:ring-[var(--ds-gray-900)]",
    secondary: "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] border border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-600)] focus:ring-[var(--ds-gray-400)]",
    ghost: "bg-transparent text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-200)] focus:ring-[var(--ds-gray-200)]",
    error: "bg-[var(--ds-error-soft)] text-[var(--ds-error-900)] border border-[var(--ds-error-border)] hover:bg-[var(--ds-error-100)] focus:ring-[var(--ds-error-400)]",
    warning: "bg-[var(--ds-warning-soft)] text-[var(--ds-warning-900)] border border-[var(--ds-warning-border)] hover:bg-[var(--ds-warning-100)] focus:ring-[var(--ds-warning-400)]",
    brand: "bg-[var(--color-brand)] text-white hover:opacity-90 focus:ring-[var(--color-brand)]",
  };

  const sizes = {
    xs: "h-7 px-2 text-label-11",
    sm: "h-8 px-3 text-label-12",
    md: "h-10 px-4 text-button-14",
    lg: "h-12 px-6 text-heading-16",
    icon: "h-10 w-10 p-0",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Spinner className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
