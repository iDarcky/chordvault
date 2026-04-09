import React from 'react';
import { Card as HeroCard, CardContent } from "@heroui/react";
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroCard
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      <CardContent className="p-6">
        {children}
      </CardContent>
    </HeroCard>
  );
});

Card.displayName = "Card";

export { Card };
