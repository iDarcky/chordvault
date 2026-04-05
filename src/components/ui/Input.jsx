import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] px-3 py-2 text-sm ring-offset-[var(--ds-background-100)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--ds-gray-400)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ds-gray-900)] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
