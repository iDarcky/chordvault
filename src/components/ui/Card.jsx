import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-6 transition-all duration-200 hover:border-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-200)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export { Card };
