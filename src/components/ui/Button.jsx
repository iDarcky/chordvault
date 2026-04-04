import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants = {
    primary: "bg-foreground text-background hover:bg-accents-7",
    secondary: "bg-background text-foreground border border-accents-2 hover:border-foreground",
    success: "bg-geist-success text-white hover:opacity-90",
    error: "bg-geist-error text-white hover:opacity-90",
    ghost: "bg-transparent text-accents-5 hover:text-foreground",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-geist font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accents-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
