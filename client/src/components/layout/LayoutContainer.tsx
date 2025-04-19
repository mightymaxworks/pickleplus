import { cn } from "@/lib/utils";

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
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}