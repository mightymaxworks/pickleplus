/**
 * PKL-278651-ADMIN-0014-UX
 * Status Message Component
 * 
 * This component provides enhanced status messaging for improved user feedback,
 * including error, success, warning, and info states with rich content support.
 */

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

export type StatusType = 'error' | 'success' | 'info' | 'warning' | 'loading';

interface StatusMessageProps {
  type: StatusType;
  title?: string;
  message: ReactNode;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  icon?: ReactNode;
  isVisible?: boolean;
  animate?: boolean;
}

export function StatusMessage({
  type,
  title,
  message,
  onDismiss,
  action,
  className,
  icon,
  isVisible = true,
  animate = true
}: StatusMessageProps) {
  // Determine icons and colors based on status type
  const getStatusIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      case 'loading':
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getStatusClassName = () => {
    switch (type) {
      case 'error':
        return 'bg-destructive/15 text-destructive border-destructive/50';
      case 'success':
        return 'bg-green-500/15 text-green-500 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/15 text-yellow-500 border-yellow-500/50';
      case 'loading':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/50';
      case 'info':
      default:
        return 'bg-primary/15 text-primary border-primary/50';
    }
  };
  
  const getDefaultTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'error':
        return 'Error';
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'loading':
        return 'Loading';
      default:
        return '';
    }
  };

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: -10, height: 0, margin: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', margin: '0.5rem 0' },
    exit: { opacity: 0, height: 0, margin: 0, transition: { duration: 0.2 } }
  };

  const StatusContent = () => (
    <Alert className={cn(getStatusClassName(), className)}>
      <div className="flex items-start">
        <span className="mr-2 mt-0.5">{getStatusIcon()}</span>
        <div className="flex-1">
          {getDefaultTitle() && (
            <AlertTitle className="mb-1 font-medium">{getDefaultTitle()}</AlertTitle>
          )}
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
          
          {/* Action buttons if provided */}
          {(action || onDismiss) && (
            <div className="flex gap-2 mt-2">
              {action && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={action.onClick}
                  className="h-8 px-3 py-1"
                >
                  {action.label}
                </Button>
              )}
              
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onDismiss}
                  className="h-8 px-3 py-1"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );

  // Return with or without animation based on props
  if (!isVisible) return null;
  
  if (animate) {
    return (
      <AnimatePresence>
        <motion.div
          key={`status-${type}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <StatusContent />
        </motion.div>
      </AnimatePresence>
    );
  }
  
  return <StatusContent />;
}