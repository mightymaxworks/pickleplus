import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, Sparkles } from "lucide-react";

// Toast icon mapping
const getToastIcon = (variant?: string) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />;
    case "destructive":
      return <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />;
    case "default":
    default:
      return <Sparkles className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />;
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.8
                }
              }}
              exit={{ 
                opacity: 0, 
                x: 400, 
                scale: 0.95,
                transition: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.1 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Toast key={id} variant={variant as any} {...props} className="p-5">
                <div className="flex space-x-3 w-full">
                  {/* Icon */}
                  <div className="shrink-0">
                    {getToastIcon(variant)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-1 pr-8">
                    {title && (
                      <ToastTitle className="font-medium text-gray-900">
                        {title}
                      </ToastTitle>
                    )}
                    {description && (
                      <ToastDescription className="text-gray-600 text-sm leading-relaxed">
                        {description}
                      </ToastDescription>
                    )}
                  </div>
                  
                  {/* Action */}
                  {action && <div className="shrink-0">{action}</div>}
                </div>
                <ToastClose />
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
}