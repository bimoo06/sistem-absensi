import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link" | "glass"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-brand-600 text-white shadow hover:bg-brand-700 hover:shadow-md active:scale-95": variant === "default",
                        "border border-border bg-transparent shadow-sm hover:bg-surface-hover hover:text-foreground active:scale-95": variant === "outline",
                        "hover:bg-surface-hover hover:text-foreground active:scale-95": variant === "ghost",
                        "text-brand-600 underline-offset-4 hover:underline": variant === "link",
                        "glass text-foreground hover:bg-white/10 dark:hover:bg-slate-800/50 active:scale-95": variant === "glass",
                        "h-10 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-12 rounded-md px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
