import React from 'react';
import { Checkbox as HeroCheckbox } from "@heroui/react";
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, onCheckedChange, checked, disabled, ...props }, ref) => {
  return (
    <HeroCheckbox
      ref={ref}
      isSelected={checked}
      onValueChange={onCheckedChange}
      isDisabled={disabled}
      className={cn(className)}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
