import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants = {
    primary: "bg-foreground text-background hover:opacity-90 active:scale-[0.98]",
    secondary: "bg-background text-foreground border border-accents-2 hover:border-accents-5 active:scale-[0.98]",
    success: "bg-geist-success text-white hover:opacity-90 active:scale-[0.98]",
    error: "bg-geist-error text-white hover:opacity-90 active:scale-[0.98]",
    ghost: "bg-transparent text-accents-5 hover:text-foreground hover:bg-accents-1",
  }

  const sizes = {
    sm: "h-8 px-4 text-[11px] font-bold uppercase tracking-widest",
    md: "h-10 px-6 text-[12px] font-black uppercase tracking-widest",
    lg: "h-12 px-8 text-sm font-black uppercase tracking-[0.1em]",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-geist transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accents-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none font-sans",
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
