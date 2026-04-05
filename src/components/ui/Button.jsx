import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 text-sm"

  const variants = {
    primary: "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] border-[var(--ds-gray-1000)] hover:bg-transparent hover:text-[var(--ds-gray-1000)]",
    secondary: "bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] border-[var(--ds-gray-200)] hover:border-[var(--ds-gray-1000)] hover:text-[var(--ds-gray-1000)]",
    ghost: "border-transparent text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-900)]",
    error: "bg-[#e00] text-white border-[#e00] hover:bg-transparent hover:text-[#e00]",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-base",
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
