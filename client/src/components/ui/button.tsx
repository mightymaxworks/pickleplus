import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { hapticFeedback } from "@/lib/mobile-utils";

// Define the button variants using cva (class-variance-authority)
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'none';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "default",
  size = "default",
  className = "",
  children,
  asChild = false,
  haptic = 'light',
  onClick,
  ...props
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic !== 'none' && haptic) {
      hapticFeedback[haptic]();
    }
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot 
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";