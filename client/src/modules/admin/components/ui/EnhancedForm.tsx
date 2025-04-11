/**
 * PKL-278651-ADMIN-0014-UX
 * Enhanced Form Component
 * 
 * This component provides an improved form experience with real-time validation,
 * better error handling, and accessibility features for admin interfaces.
 */

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm, UseFormReturn, FieldValues, DefaultValues, Path, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormFieldWithFeedback, FieldValidationState, InlineFeedback } from './FormFeedback';
import { StatusMessage } from './StatusMessage';
import { cn } from '@/lib/utils';

export interface EnhancedFormProps<
  TFormValues extends FieldValues,
  Schema extends z.ZodType<any, any>
> {
  schema: Schema;
  defaultValues: DefaultValues<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  children: (form: UseFormReturn<TFormValues>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  successMessage?: string;
  className?: string;
  formId?: string;
  formDescription?: string;
  showResetButton?: boolean;
  resetButtonText?: string;
  buttonPosition?: 'top' | 'bottom' | 'both';
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  autoFocusFirstField?: boolean;
  liveValidation?: boolean;
  preventEnterSubmit?: boolean;
}

export function EnhancedForm<
  TFormValues extends FieldValues,
  Schema extends z.ZodType<any, any>
>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  isSubmitting = false,
  submitError,
  successMessage,
  className,
  formId,
  formDescription,
  showResetButton = false,
  resetButtonText = 'Reset',
  buttonPosition = 'bottom',
  validationMode = 'onBlur',
  autoFocusFirstField = false,
  liveValidation = true,
  preventEnterSubmit = false,
}: EnhancedFormProps<TFormValues, Schema>) {
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: validationMode,
  });
  
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<string, FieldValidationState>>({});
  
  // Reset form to default values
  const handleReset = () => {
    form.reset(defaultValues);
    setFieldValidation({});
  };
  
  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      setSuccess(true);
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: submitError || "Failed to submit form. Please try again.",
      });
    }
  });
  
  // Prevent enter key from submitting form if specified
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (preventEnterSubmit && e.key === 'Enter' && e.target instanceof HTMLElement) {
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }
  };
  
  // Handle live validation on field changes
  useEffect(() => {
    if (liveValidation) {
      const subscription = form.watch((value, { name, type }) => {
        if (name && type === 'change') {
          // Get field errors for the specified field
          const fieldName = name as string;
          const hasError = !!form.formState.errors[fieldName as keyof typeof form.formState.errors];
          
          // Check if the field has been touched
          const isTouched = form.getFieldState(fieldName as Path<TFormValues>).isTouched;
          
          // Update validation state if the field has been touched
          if (isTouched) {
            setFieldValidation(prev => ({
              ...prev,
              [fieldName]: hasError ? 'invalid' : 'valid'
            }));
          }
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, liveValidation]);
  
  // Auto-focus first field if specified
  useEffect(() => {
    if (autoFocusFirstField) {
      setTimeout(() => {
        const firstInput = document.querySelector(`form[id="${formId || 'enhanced-form'}"] input:not([type="hidden"]):not([disabled]), form[id="${formId || 'enhanced-form'}"] textarea:not([disabled]), form[id="${formId || 'enhanced-form'}"] select:not([disabled])`);
        if (firstInput instanceof HTMLElement) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [formId, autoFocusFirstField]);
  
  // Reset success state when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (success) setSuccess(false);
    });
    
    return () => subscription.unsubscribe();
  }, [form, success]);
  
  const formButtons = (
    <div className="flex justify-end space-x-2 mt-6">
      {showResetButton && (
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          {resetButtonText}
        </Button>
      )}
      
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
      )}
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="min-w-[100px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  );
  
  return (
    <Form {...form}>
      <form 
        id={formId || 'enhanced-form'} 
        onSubmit={handleSubmit}
        className={cn('space-y-4', className)} 
        onKeyDown={handleKeyDown}
        noValidate
      >
        {formDescription && (
          <FormDescription className="text-sm text-muted-foreground mb-4">
            {formDescription}
          </FormDescription>
        )}
        
        <AnimatePresence>
          {submitError && !success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StatusMessage
                type="error"
                message={submitError}
              />
            </motion.div>
          )}
          
          {successMessage && success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StatusMessage
                type="success"
                message={successMessage}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Display buttons at top if specified */}
        {(buttonPosition === 'top' || buttonPosition === 'both') && formButtons}
        
        {/* Form content */}
        {children(form)}
        
        {/* Display buttons at bottom if specified */}
        {(buttonPosition === 'bottom' || buttonPosition === 'both') && formButtons}
        
        {/* Form status indicators */}
        <div aria-live="polite" className="sr-only">
          {isSubmitting && 'Form is submitting. Please wait.'}
          {success && 'Form has been successfully submitted.'}
          {submitError && `Form submission error: ${submitError}`}
        </div>
      </form>
    </Form>
  );
}

export { FormFieldWithFeedback, InlineFeedback, type FieldValidationState };