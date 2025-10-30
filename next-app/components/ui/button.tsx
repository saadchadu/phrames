import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 untitled-ui-shadow-xs",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-100",
        "secondary-gray": "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:bg-gray-50",
        tertiary: "bg-transparent text-gray-600 hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-100",
        "tertiary-gray": "bg-transparent text-gray-500 hover:text-gray-600 hover:bg-gray-50 focus:bg-gray-50",
        "link-color": "bg-transparent text-primary-700 hover:text-primary-800 p-0 h-auto font-semibold",
        "link-gray": "bg-transparent text-gray-500 hover:text-gray-600 p-0 h-auto font-medium",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 active:bg-red-800",
        "destructive-secondary": "bg-white text-red-700 border border-red-300 hover:bg-red-50 focus:bg-red-50",
      },
      size: {
        sm: "h-9 px-3.5 py-2 text-sm",
        md: "h-10 px-4 py-2.5 text-sm",
        lg: "h-11 px-4.5 py-2.5 text-base",
        xl: "h-12 px-5 py-3 text-base",
        "2xl": "h-15 px-7 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
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