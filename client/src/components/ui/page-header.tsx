import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageHeader({ className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 mb-6", className)} {...props} />
  );
}

interface PageHeaderHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PageHeaderHeading({
  className,
  ...props
}: PageHeaderHeadingProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground md:text-3xl",
        className
      )}
      {...props}
    />
  );
}

interface PageHeaderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PageHeaderDescription({
  className,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground md:text-base", className)}
      {...props}
    />
  );
}