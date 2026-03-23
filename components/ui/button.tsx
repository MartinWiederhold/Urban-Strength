import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:       "bg-white text-black hover:bg-white/90 hover:shadow-medium hover:scale-[1.02]",
        destructive:   "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:       "border border-white/20 bg-transparent text-white hover:bg-white/8 hover:text-white",
        secondary:     "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:         "hover:bg-white/8 hover:text-white text-white/70",
        link:          "text-white underline-offset-4 hover:underline",
        hero:          "rounded-full bg-white text-black font-semibold hover:bg-white/90 hover:shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.5)] hover:scale-[1.03] active:scale-[0.98]",
        "outline-white": "rounded-full border border-white/25 text-white bg-white/5 hover:bg-white/12 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-12 rounded-lg px-8 text-base",
        xl:      "h-14 px-10 text-[15px]",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
