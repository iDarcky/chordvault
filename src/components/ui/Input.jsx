import React from 'react';
import { Input as HeroInput } from "@heroui/react";
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

  let heroVariant = "bordered";
  if (variant === 'ghost') heroVariant = "underlined";

  let heroSize = "md";
  if (size === 'sm') heroSize = "sm";
  if (size === 'lg') heroSize = "lg";

  return (
    <HeroInput
      ref={ref}
      type={type}
      variant={heroVariant}
      size={heroSize}
      isDisabled={disabled}
      startContent={prefix}
      endContent={suffix}
      className={cn(className)}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
