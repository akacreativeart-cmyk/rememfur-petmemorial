import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Apple-style buttons: clean, pill-shaped, solid fill, minimal effects.
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium cursor-pointer select-none",
    "tracking-[-0.01em] antialiased",
    "transition-[background-color,color,transform,opacity] duration-200 ease-out active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--cta)_30%,transparent)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Apple's signature blue, flat — no gradient, no gloss, no border.
        default:
          "bg-[var(--cta)] text-primary-foreground hover:bg-[color-mix(in_oklab,var(--cta)_92%,white_8%)]",
        destructive:
          "bg-[var(--destructive)] text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive)_92%,white_8%)]",
        // Translucent "secondary" pill — Apple's frosted style on dark hero
        outline:
          "bg-white/10 text-white backdrop-blur-xl border border-white/15 hover:bg-white/15",
        secondary:
          "bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_12%,transparent)]",
        ghost:
          "bg-transparent text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]",
        link:
          "bg-transparent text-[var(--cta)] underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        default: "h-10 px-5 text-[15px]",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-12 px-7 text-[17px]",
        icon: "h-10 w-10",
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
