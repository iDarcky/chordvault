import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({
  className,
  type = 'text',
  prefix,
  suffix,
  disabled,
  ...props
}, ref) => {
  return (
    <div className={cn(
      "flex items-center w-full rounded-md bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] transition-all duration-100 focus-within:ring-2 focus-within:ring-[var(--ds-gray-400)] focus-within:border-[var(--ds-gray-600)]",
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      {prefix && (
        <div className="pl-3 flex items-center justify-center text-[var(--ds-gray-900)]">
          {prefix}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 text-copy-14 bg-transparent border-none outline-none placeholder:text-[var(--ds-gray-700)] text-[var(--ds-gray-1000)]",
          prefix && "pl-2",
          suffix && "pr-2"
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      {suffix && (
        <div className="pr-3 flex items-center justify-center text-[var(--ds-gray-900)]">
          {suffix}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
