import React from 'react';
import { Separator as HeroSeparator } from "@heroui/react";
import { cn } from '../../lib/utils';

const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <HeroSeparator
    ref={ref}
    orientation={orientation}
    className={cn(className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
