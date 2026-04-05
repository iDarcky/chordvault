import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
    secondary: "border-transparent bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)]",
    outline: "text-[var(--ds-gray-900)] border-[var(--ds-gray-200)]",
    success: "bg-[#0070f3] text-white border-transparent",
    error: "bg-[#e00] text-white border-transparent",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ds-gray-400)] focus:ring-offset-2", variants[variant], className)} {...props} />
  )
}

export { Badge }
