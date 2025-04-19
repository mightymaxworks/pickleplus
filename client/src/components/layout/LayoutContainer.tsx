import { cn } from "@/lib/utils";
import React from "react";

interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function LayoutContainer({
  children,
  className,
  maxWidth = "xl",
  ...props
}: LayoutContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6",
        {
          "max-w-screen-sm": maxWidth === "sm",
          "max-w-screen-md": maxWidth === "md",
          "max-w-screen-lg": maxWidth === "lg",
          "max-w-screen-xl": maxWidth === "xl",
          "max-w-screen-2xl": maxWidth === "2xl",
          "max-w-full": maxWidth === "full",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}