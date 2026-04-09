import React from 'react';
import { Button as HeroButton } from "@heroui/react";
import { cn } from '../../lib/utils';

const IconButton = React.forwardRef(({
  className,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  children,
  ...props
}, ref) => {
  let heroVariant = "light";
  let heroColor = "default";

  switch (variant) {
    case 'default':
      heroVariant = "bordered";
      break;
    case 'active':
      heroVariant = "flat";
      heroColor = "primary";
      break;
    case 'error':
      heroVariant = "light";
      heroColor = "danger";
      break;
    default:
      heroVariant = "light";
      break;
  }

  let heroSize = "sm";
  if (size === 'xs') heroSize = "sm"; // HeroUI doesn't have xs, stick to sm
  if (size === 'md') heroSize = "md";
  if (size === 'lg') heroSize = "lg";

  return (
    <HeroButton
      ref={ref}
      isIconOnly
      variant={heroVariant}
      color={heroColor}
      size={heroSize}
      isDisabled={disabled}
      className={cn(className)}
      {...props}
    >
      {children}
    </HeroButton>
  );
});

IconButton.displayName = "IconButton";

export { IconButton };
