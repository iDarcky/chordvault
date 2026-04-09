import React from 'react';
import { Spinner as HeroSpinner } from "@heroui/react";
import { cn } from '../../lib/utils';

export function Spinner({ className, ...props }) {
  return (
    <HeroSpinner size="sm" className={cn(className)} {...props} />
  );
}
