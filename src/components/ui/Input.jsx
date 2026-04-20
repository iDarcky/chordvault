import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({
  className,
  type = 'text',
  size = 'md',
  variant = 'default',
  prefix,
  suffix,
  disabled,
  ...props
}, ref) => {
  const variantStyles = {
    default: "bg-[var(--bg-1)] border-none ring-1 ring-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--accent)] shadow-sm",
    ghost: "bg-transparent border-none ring-1 ring-transparent focus-within:ring-2 focus-within:ring-[var(--border)]",
  };

  const sizeStyles = {
    sm: "text-copy-13",
    md: "text-copy-14",
  };

  const inputPadding = {
    sm: "px-2 py-1",
    md: "px-3 py-2",
  };

  return (
    <div className={cn(
      "flex items-center w-full rounded-xl transition-all duration-200 overflow-hidden",
      variantStyles[variant],
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      {prefix && (
        <div className={cn("flex items-center justify-center text-[var(--text-secondary)]", size === 'sm' ? "pl-3" : "pl-4")}>
          {prefix}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "w-full bg-transparent border-none outline-none placeholder:text-[var(--text-secondary)] text-[var(--text-primary)] transition-colors",
          inputPadding[size],
          sizeStyles[size],
          prefix && "pl-2",
          suffix && "pr-2"
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      {suffix && (
        <div className={cn("flex items-center justify-center text-[var(--text-secondary)]", size === 'sm' ? "pr-3" : "pr-4")}>
          {suffix}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
