import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-2 text-copy-14 text-[var(--ds-gray-1000)] transition-all placeholder:text-[var(--ds-gray-600)] focus:border-[var(--ds-gray-900)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
