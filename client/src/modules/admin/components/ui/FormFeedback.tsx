/**
 * PKL-278651-ADMIN-0014-UX
 * Form Feedback Component
 * 
 * This component provides enhanced form feedback with inline validation
 * and contextual error messages for better user experience.
 */

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Field validation state that can be shown during real-time validation
export type FieldValidationState = 'valid' | 'invalid' | 'pending' | 'none';

interface FormFieldWithFeedbackProps {
  name: string;
  label?: string;
  description?: string;
  validationState?: FieldValidationState;
  validationMessage?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  tooltip?: string;
  control: any; // Control from react-hook-form
}

export function FormFieldWithFeedback({
  name,
  label,
  description,
  validationState = 'none',
  validationMessage,
  children,
  className,
  labelClassName,
  required = false,
  tooltip,
  control,
}: FormFieldWithFeedbackProps) {
  const getValidationIcon = () => {
    switch (validationState) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('relative space-y-1', className)}>
          {label && (
            <div className="flex items-center gap-1">
              <FormLabel 
                className={cn(
                  'text-sm font-medium text-foreground',
                  required && 'after:content-["*"] after:ml-0.5 after:text-destructive',
                  labelClassName
                )}
              >
                {label}
              </FormLabel>
              
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground/70 hover:text-muted-foreground cursor-help">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs text-sm">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          
          <div className="relative">
            <FormControl>
              {children}
            </FormControl>
            
            {validationState !== 'none' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          
          {validationState === 'invalid' && validationMessage && (
            <p className="text-xs text-destructive mt-1">{validationMessage}</p>
          )}
          
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

// Inline feedback component for use outside of form fields
interface InlineFeedbackProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function InlineFeedback({ 
  type, 
  message,
  className,
  size = 'sm'
}: InlineFeedbackProps) {
  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />;
      case 'error':
      case 'warning':
      case 'info':
      default:
        return <AlertCircle className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />;
    }
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-1.5 rounded border px-2.5 py-1.5',
        getTypeClasses(),
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {getIcon()}
      <span className="flex-1">{message}</span>
    </div>
  );
}