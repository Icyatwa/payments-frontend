// components/ui/badge.jsx
import * as React from "react"

const Badge = React.forwardRef(({ 
  className,
  variant = "default",
  ...props
}, ref) => {
  const variants = {
    default: "bg-primary hover:bg-primary/80 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    destructive: "bg-destructive hover:bg-destructive/80 text-destructive-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }