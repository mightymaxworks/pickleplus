import React from "react";

interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles = "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input";
  
  const thumbStyles = "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0";
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={`${baseStyles} ${className}`}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      {...props}
    >
      <span className={thumbStyles} />
    </button>
  );
};