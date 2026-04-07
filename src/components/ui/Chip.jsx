import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Geist-style chip — a small rectangular label tag.
 * More compact and squared than Badge (which is pill-shaped).
 *
 * Usage:
 *   <Chip>Main Service</Chip>
 *   <Chip variant="success">Confirmed</Chip>
 *   <Chip variant="warning" size="sm">Draft</Chip>
 */
const Chip = React.forwardRef(({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-900)] border-[var(--ds-gray-300)]',
    success: 'bg-[var(--ds-success-soft)] text-[var(--ds-success-900)] border-[var(--ds-success-border)]',
    error: 'bg-[var(--ds-error-soft)] text-[var(--ds-error-900)] border-[var(--ds-error-border)]',
    warning: 'bg-[var(--ds-warning-soft)] text-[var(--ds-warning-900)] border-[var(--ds-warning-border)]',
    brand: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] border-[var(--color-brand-border)]',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] tracking-wider',
    md: 'px-2 py-0.5 text-[11px] tracking-wide',
    lg: 'px-2.5 py-1 text-[12px] tracking-wide',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md border font-semibold uppercase leading-tight select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Chip.displayName = 'Chip';

export { Chip };
