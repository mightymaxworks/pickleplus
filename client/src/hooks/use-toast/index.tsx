// Basic temporary hook for testing, would be replaced by a proper toast implementation
import { useState } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    // Just log to console for now
    const message = `${title || ""} ${description || ""}`.trim();
    
    if (variant === "destructive") {
      console.error(message);
    } else if (variant === "success") {
      console.log(`%c${message}`, 'color: green; font-weight: bold');
    } else {
      console.log(message);
    }
    
    // Add to state (not used currently but would be in a real implementation)
    setToasts((prev) => [...prev, { title, description, variant }]);
  };

  return { toast, toasts };
}