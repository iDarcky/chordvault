import * as React from "react"
import { Avatar as HeroAvatar } from "@heroui/react";
import { cn } from "../../lib/utils"

// Radix Avatar wrapper compatibility
// <Avatar><AvatarImage src="..." /><AvatarFallback>US</AvatarFallback></Avatar>

// Extract src from AvatarImage and fallback string from AvatarFallback
const Avatar = React.forwardRef(({ className, children, ...props }, ref) => {
  let src = undefined;
  let fallback = undefined;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    if (child.type === AvatarImage) {
      src = child.props.src;
    }
    if (child.type === AvatarFallback) {
      fallback = child.props.children;
    }
  });

  return (
    <HeroAvatar
      ref={ref}
      src={src}
      name={typeof fallback === 'string' ? fallback : undefined}
      showFallback={!!fallback}
      fallback={typeof fallback !== 'string' ? fallback : undefined}
      className={cn(className)}
      {...props}
    />
  );
})
Avatar.displayName = "Avatar"

const AvatarImage = () => null;
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = () => null;
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback }
