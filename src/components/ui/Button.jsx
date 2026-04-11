import React from 'react';
import { Button as HeroButton } from "@heroui/react";
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({
  className,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}, ref) => {

  // Map legacy variants to HeroUI variants/colors
  let heroVariant = "solid";
  let heroColor = "default";

  switch (variant) {
    case 'primary':
      heroVariant = "solid";
      heroColor = "primary";
      break;
    case 'secondary':
      heroVariant = "bordered";
      heroColor = "default";
      break;
    case 'ghost':
      heroVariant = "light";
      heroColor = "default";
      break;
    case 'error':
      heroVariant = "solid";
      heroColor = "danger";
      break;
    case 'warning':
      heroVariant = "solid";
      heroColor = "warning";
      break;
    case 'brand':
      heroVariant = "solid";
      heroColor = "primary";
      break;
    default:
      heroVariant = "bordered";
      heroColor = "default";
  }

  // Map legacy sizes to HeroUI sizes
  let heroSize = "md";
  let isIconOnly = false;
  switch (size) {
    case 'xs':
    case 'sm':
      heroSize = "sm";
      break;
    case 'md':
      heroSize = "md";
      break;
    case 'lg':
      heroSize = "lg";
      break;
    case 'icon':
      heroSize = "md";
      isIconOnly = true;
      break;
  }

  return (
    <HeroButton
      ref={ref}
      variant={heroVariant}
      color={heroColor}
      size={heroSize}
      isIconOnly={isIconOnly}
      isLoading={loading}
      isDisabled={disabled}
      className={cn(className)}
      {...props}
    >
      {children}
    </HeroButton>
  );
});

Button.displayName = "Button";

export { Button };
