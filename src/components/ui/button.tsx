import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Cinematic night-sky buttons: pill, uppercase, wide tracking — Jost.
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
        // Warm gold gradient — for editorial moments (e.g. "Light a candle")
        gold:
          "text-[#1a1206] bg-[linear-gradient(135deg,#d4b378,#f0a868)] shadow-[0_6px_22px_-8px_rgba(212,179,120,0.45)] hover:brightness-105",
        destructive:
          "bg-[var(--destructive)] text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive)_92%,white_8%)]",
        // Hairline pill that reads on the dark sky
        outline:
          "bg-transparent text-[var(--cr,inherit)] border border-[color-mix(in_oklab,white_14%,transparent)] hover:bg-white/[0.06]",
        secondary:
          "bg-white/[0.06] text-foreground border border-[color-mix(in_oklab,white_10%,transparent)] hover:bg-white/[0.1]",
        ghost:
          "bg-transparent text-foreground hover:bg-white/[0.06]",
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
