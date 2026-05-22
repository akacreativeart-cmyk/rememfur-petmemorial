import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer overflow-hidden backdrop-blur-xl border border-white/40 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] hover:-translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:border-white/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(0,0,0,0.6)]",
  {
    variants: {
      variant: {
        default:
          "bg-[color-mix(in_oklab,var(--primary)_75%,transparent)] text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_88%,transparent)]",
        destructive:
          "bg-[color-mix(in_oklab,var(--destructive)_70%,transparent)] text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive)_85%,transparent)]",
        outline:
          "bg-[color-mix(in_oklab,var(--card)_45%,transparent)] text-foreground hover:bg-[color-mix(in_oklab,var(--card)_70%,transparent)]",
        secondary:
          "bg-[color-mix(in_oklab,var(--secondary)_60%,transparent)] text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_80%,transparent)]",
        ghost:
          "border-transparent shadow-none backdrop-blur-0 bg-transparent hover:backdrop-blur-md hover:bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] hover:text-accent-foreground hover:border-white/30 dark:hover:border-white/10",
        link:
          "border-transparent shadow-none backdrop-blur-0 bg-transparent text-primary underline-offset-4 hover:underline hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-11 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
