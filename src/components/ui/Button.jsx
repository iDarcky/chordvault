import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ className, variant = 'secondary', size = 'md', ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const variants = {
    primary: "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] hover:bg-[var(--ds-gray-900)]",
    secondary: "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] border border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-200)]",
    ghost: "hover:bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]",
    error: "bg-[var(--ds-error-600)] text-white hover:bg-[var(--ds-error-700)]",
  };

  const sizes = {
    sm: "h-8 px-3 text-label-12",
    md: "h-10 px-4 text-button-14",
    lg: "h-12 px-6 text-heading-16",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
