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
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium cursor-pointer transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-[var(--ds-gray-1000)] text-[var(--ds-gray-100)] hover:bg-[var(--ds-gray-900)] focus:ring-[var(--ds-gray-900)]",
    secondary: "bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)] border border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-500)] focus:ring-[var(--ds-gray-400)]",
    ghost: "bg-transparent text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-200)] focus:ring-[var(--ds-gray-200)]",
    error: "bg-[var(--ds-red-100)] text-[var(--ds-red-1000)] border border-[var(--ds-red-400)] hover:bg-[var(--ds-red-200)] focus:ring-[var(--ds-red-400)]",
    warning: "bg-[var(--ds-amber-100)] text-[var(--ds-amber-1000)] border border-[var(--ds-amber-400)] hover:bg-[var(--ds-amber-200)] focus:ring-[var(--ds-amber-400)]",
    brand: "bg-[var(--ds-teal-900)] text-white hover:opacity-90 focus:ring-[var(--ds-teal-900)]",
  };

  const sizes = {
    xs: "h-7 px-2 text-label-11",
    sm: "h-8 px-3 text-label-12",
    md: "h-10 px-4 text-button-14",
    lg: "h-12 px-6 text-heading-16",
    icon: "h-10 w-10 p-0",
  };

  // Brand variant needs inline style to guarantee white text
  const brandStyle = variant === 'brand' ? { color: '#ffffff' } : undefined;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={brandStyle}
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
