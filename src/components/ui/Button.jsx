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
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

  const variants = {
    primary: "bg-[var(--text-primary)] text-[var(--bg-1)] hover:bg-[var(--text-secondary)]",
    secondary: "bg-[var(--bg-2)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)] hover:border-[var(--text-secondary)]",
    ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-2)] hover:text-[var(--text-primary)]",
    error: "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20",
    brand: "bg-[var(--accent)] text-white hover:opacity-90",
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
