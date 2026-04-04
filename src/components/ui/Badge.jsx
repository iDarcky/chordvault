import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-accents-2 bg-accents-1 text-foreground hover:bg-accents-2",
    secondary: "border-transparent bg-accents-2 text-foreground hover:bg-accents-3",
    destructive: "border-transparent bg-geist-error text-white hover:opacity-90",
    outline: "text-foreground",
    success: "border-geist-success text-geist-success bg-geist-success/10",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accents-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
