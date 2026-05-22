import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer overflow-hidden isolate",
    "backdrop-blur-xl backdrop-saturate-150 border border-white/45 dark:border-white/15",
    "transition-all duration-300 ease-out hover:-translate-y-px active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&>*]:relative [&>*]:z-10",
    // gloss highlight
    "before:absolute before:inset-0 before:-z-0 before:rounded-full before:pointer-events-none",
    "before:bg-[radial-gradient(120%_70%_at_50%_-20%,rgba(255,255,255,0.7),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.35)_0%,transparent_45%)]",
    "before:mix-blend-screen",
    // inner shine + soft drop
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.06),0_14px_30px_-14px_rgba(0,0,0,0.35)]",
    "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(255,255,255,0.05),0_14px_30px_-14px_rgba(0,0,0,0.7)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--cta)_92%,white_8%),color-mix(in_oklab,var(--cta-deep)_95%,black_5%))] text-primary-foreground hover:brightness-110",
        destructive:
          "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--destructive)_88%,white_12%),var(--destructive))] text-destructive-foreground hover:brightness-110",
        outline:
          "bg-[color-mix(in_oklab,var(--card)_45%,transparent)] text-foreground hover:bg-[color-mix(in_oklab,var(--card)_70%,transparent)]",
        secondary:
          "bg-[color-mix(in_oklab,var(--secondary)_70%,transparent)] text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,transparent)]",
        ghost:
          "border-transparent shadow-none backdrop-blur-0 bg-transparent before:hidden hover:backdrop-blur-md hover:bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] hover:text-accent-foreground hover:border-white/30 dark:hover:border-white/10",
        link:
          "border-transparent shadow-none backdrop-blur-0 bg-transparent before:hidden text-primary underline-offset-4 hover:underline hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-11 rounded-full px-8 text-base",
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
