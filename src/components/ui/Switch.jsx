import React from 'react';
import { Switch as HeroSwitch } from "@heroui/react";
import { cn } from '../../lib/utils';

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  return (
    <HeroSwitch
      ref={ref}
      isSelected={checked}
      onValueChange={onCheckedChange}
      isDisabled={disabled}
      className={cn(className)}
      {...props}
    />
  );
});
Switch.displayName = "Switch";

export { Switch };
