import * as React from "react"
import { Chip as HeroChip } from "@heroui/react";
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", children, ...props }) {
  let heroVariant = "flat";
  let heroColor = "default";

  switch (variant) {
    case 'secondary':
      heroVariant = "flat";
      break;
    case 'outline':
      heroVariant = "bordered";
      break;
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
      break;
  }

  return (
    <HeroChip
      variant={heroVariant}
      color={heroColor}
      className={cn(className)}
      {...props}
    >
      {children}
    </HeroChip>
  )
}

export { Badge }
