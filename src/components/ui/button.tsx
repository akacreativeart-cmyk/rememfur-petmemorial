import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Shared semantic buttons: each variant adapts to dark memorial scenes and warm pages.
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold cursor-pointer select-none",
    "uppercase tracking-[0.18em] antialiased",
    "transition-[background-color,color,transform,opacity,box-shadow] duration-200 ease-out active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--cta)_60%,transparent)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary CTA — purple (kept per project memory)
        default:
          "bg-[var(--cta)] text-[var(--cta-foreground)] shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--cta)_60%,transparent)] hover:bg-[color-mix(in_oklab,var(--cta)_92%,white_8%)]",
        // Brand emphasis — follows the active theme's CTA colors.
        gold:
          "bg-[var(--cta)] text-[var(--cta-foreground)] shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--cta)_55%,transparent)] hover:bg-[color-mix(in_oklab,var(--cta)_90%,white_10%)]",
        destructive:
          "bg-[var(--destructive)] text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive)_92%,white_8%)]",
        outline:
          "border border-border bg-background/70 text-foreground hover:bg-muted hover:text-foreground",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        link:
          "bg-transparent text-[var(--gold,var(--cta))] underline-offset-4 hover:underline px-0 h-auto normal-case tracking-normal",
      },
      size: {
        default: "h-11 px-7 text-[11px]",
        sm:      "h-9 px-5 text-[10px]",
        lg:      "h-12 px-8 text-[12px]",
        icon:    "h-10 w-10 [&_svg]:size-[18px]",
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
