import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center text-sm font-medium ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-grey-450 text-color rounded-lg hover:bg-grey-500",
        accent:
          "bg-primary whitespace-nowrap text-primary-foreground rounded-full px-6 w-fit font-medium uppercase",
        destructive: "bg-red-900 rounded-lg",
        gunmetalArrow:
          "bg-gunmetal rounded-full px-[12px] py-[6px] focus:outline-hidden",
        outline:
          "border border-(--grey-500) rounded-lg hover:bg-grey-450 hover:border-(--grey-100)",
        bottomline: "border-b border-primary text-sm rounded-none rounded-t",
        tabSelected:
          "border-b border-primary rounded-none rounded-t-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        secondary: "rounded-lg background-color",
        ghost: "rounded hover:text-white hover:bg-grey-450",
        link: "font-light text-base p-0! hover:underline",
        graphRounded:
          "block! font-normal! max-h-fit min-w-[28px] max-w-fit rounded rounded-full border-none px-2! py-1! text-sm uppercase disabled:cursor-auto disabled:bg-[var(--background)] disabled:opacity-100!",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={props.disabled || loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {props.children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
