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
import { CheckCircle, XCircle, AlertTriangle, Info, Sparkles, Zap } from "lucide-react";

// Enhanced toast icon mapping with animations
const getToastIcon = (variant?: string) => {
  const baseClasses = "h-5 w-5 shrink-0 mt-0.5";
  
  switch (variant) {
    case "success":
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
        >
          <CheckCircle className={`${baseClasses} text-emerald-600`} />
        </motion.div>
      );
    case "destructive":
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.3, times: [0, 0.7, 1] }}
        >
          <XCircle className={`${baseClasses} text-red-600`} />
        </motion.div>
      );
    case "warning":
      return (
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <AlertTriangle className={`${baseClasses} text-amber-600`} />
        </motion.div>
      );
    case "default":
    default:
      return (
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Zap className={`${baseClasses} text-orange-600`} />
        </motion.div>
      );
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
              initial={{ 
                opacity: 0, 
                y: -50, 
                scale: 0.8,
                rotateX: -15
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                  delayChildren: 0.1
                }
              }}
              exit={{ 
                opacity: 0, 
                x: 400, 
                scale: 0.9,
                rotateX: 15,
                transition: {
                  duration: 0.25,
                  ease: "easeInOut"
                }
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { 
                  duration: 0.15,
                  type: "spring",
                  stiffness: 400
                }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Toast key={id} variant={variant as any} {...props} className="p-5 relative overflow-hidden">
                {/* Progress bar for auto-dismiss */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-blue-400"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
                <div className="flex space-x-3 w-full">
                  {/* Icon */}
                  <div className="shrink-0">
                    {getToastIcon(variant || "default")}
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