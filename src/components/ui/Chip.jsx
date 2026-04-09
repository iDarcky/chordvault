import React from 'react';
import { Chip as HeroChip } from "@heroui/react";
import { cn } from '../../lib/utils';

const Chip = React.forwardRef(({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}, ref) => {
  let heroVariant = "bordered";
  let heroColor = "default";

  switch (variant) {
    case 'success':
      heroVariant = "flat";
      heroColor = "success";
      break;
    case 'error':
      heroVariant = "flat";
      heroColor = "danger";
      break;
    case 'warning':
      heroVariant = "flat";
      heroColor = "warning";
      break;
    case 'brand':
      heroVariant = "flat";
      heroColor = "primary";
      break;
    default:
      heroVariant = "bordered";
      heroColor = "default";
  }

  let heroSize = "sm";
  if (size === 'lg') heroSize = "md";

  return (
    <HeroChip
      ref={ref}
      variant={heroVariant}
      color={heroColor}
      size={heroSize}
      radius="sm"
      className={cn("uppercase tracking-wider font-semibold", className)}
      {...props}
    >
      {children}
    </HeroChip>
  );
});

Chip.displayName = 'Chip';

export { Chip };
