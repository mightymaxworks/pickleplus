/**
 * PKL-278651-TOURN-0001-FORM
 * Multi-Step Tournament Creation Wizard
 * 
 * A user-friendly step-by-step wizard for creating tournaments
 * Implements Framework 5.0 principles for form validation and error handling
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Check, CalendarIcon, InfoIcon, LayoutIcon } from 'lucide-react';

// Dynamic imports to avoid circular dependencies
import { lazy, Suspense } from 'react';

// Simple lazy loading of components
const TournamentBasicInfoStep = lazy(() => import('./wizard-steps/TournamentBasicInfoStep'));
const TournamentStructureStep = lazy(() => import('./wizard-steps/TournamentStructureStep'));
const TournamentSchedulingStep = lazy(() => import('./wizard-steps/TournamentSchedulingStep'));

/**
 * Tournament form schema
 * Carefully designed to match the actual database schema columns
 * Following Framework 5.0 principles - added validation and error handling
 */
const tournamentFormSchema = z.object({
  // Required fields that exist in the database
  name: z.string().min(3, { message: 'Tournament name must be at least 3 characters' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  status: z.enum(['draft', 'published']),
  
  // Optional fields that exist in the database 
  description: z.string().optional(),
  location: z.string().optional(), 
  
  // Required fields with defaults (match database schema exactly)
  format: z.string().default('doubles'),
  division: z.string().default('open'),
  level: z.string().default('club'),
  
  // UI-only field (not in database schema)
  registrationOpen: z.boolean().default(true),
});

export type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

type CreateTournamentWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTournamentWizard({ open, onOpenChange }: CreateTournamentWizardProps) {
  const queryClient = useQueryClient();
  
  // Track the current step
  const [step, setStep] = useState(0);
  const totalSteps = 3;
  
  // Calculate progress percentage
  const progress = ((step + 1) / totalSteps) * 100;
  
  // Step indicators
  const steps = [
    {
      label: 'Basic Info',
      icon: InfoIcon,
      description: 'Tournament name and description'
    },
    {
      label: 'Structure',
      icon: LayoutIcon,
      description: 'Format, division, and skill level'
    },
    {
      label: 'Schedule',
      icon: CalendarIcon,
      description: 'Dates and registration settings'
    }
  ];
  
  // Determine which form fields to validate at each step
  const stepValidationFields = {
    0: ['name', 'description', 'location', 'status'],
    1: ['format', 'division', 'level'],
    2: ['startDate', 'endDate', 'registrationOpen']
  };
  
  // Default form values - updated to include all required fields from schema
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const defaultValues: Partial<TournamentFormValues> = {
    name: '',
    description: '',
    location: '',
    status: 'draft',
    registrationOpen: true,
    startDate: today,
    endDate: tomorrow,
    format: 'doubles',
    division: 'open',
    level: 'club',
  };
  
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
    mode: 'onChange', // Validate fields on change
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TournamentFormValues) => {
      console.log('[Tournament] Preparing to create tournament with data:', values);
      
      // First, fetch the CSRF token
      console.log('[Tournament] Fetching CSRF token');
      const csrfResponse = await fetch('/api/auth/csrf-token', {
        credentials: 'include'
      });
      
      if (!csrfResponse.ok) {
        console.error('[Tournament] Failed to fetch CSRF token:', csrfResponse.status, csrfResponse.statusText);
        throw new Error('Failed to fetch CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      console.log('[Tournament] Successfully obtained CSRF token');
      
      // Now send the actual tournament creation request with the token
      console.log('[Tournament] Sending tournament creation request');
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Tournament] Error creating tournament:', response.status, response.statusText, errorBody);
        throw new Error(`Failed to create tournament: ${response.status} ${response.statusText}`);
      }
      
      console.log('[Tournament] Tournament created successfully');
      return response.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Reset wizard to first step
      setStep(0);

      // Invalidate tournaments query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });

      // Show success toast
      toast({
        title: 'Tournament created',
        description: 'Your tournament has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('[Tournament] Error in mutation handler:', error);
      
      // Extract a more user-friendly message from the error
      let errorMessage = 'An unexpected error occurred.';
      let errorDetails = '';
      
      // Enhanced error handling logic (Framework 5.0 principle)
      try {
        if (error.message) {
          errorMessage = error.message;
          
          // If it's a CSRF token error, provide more specific guidance
          if (errorMessage.includes('CSRF')) {
            errorMessage = 'Security validation failed. Please try refreshing the page and submitting again.';
          }
          
          // If it's a database schema mismatch error
          if (errorMessage.includes('Database schema mismatch')) {
            errorMessage = 'Database schema issue detected. Please contact support.';
            errorDetails = error.message;
          }
          
          // If it contains a structured error response
          if (error.response) {
            try {
              const responseData = JSON.parse(error.response);
              if (responseData.message) {
                errorMessage = responseData.message;
              }
              if (responseData.errors) {
                errorDetails = JSON.stringify(responseData.errors, null, 2);
              }
            } catch (parseError) {
              console.warn('[Tournament] Could not parse error response:', parseError);
            }
          }
        }
      } catch (handlingError) {
        console.error('[Tournament] Error while handling error:', handlingError);
      }
      
      // Log detailed diagnostics (Framework 5.0 principle: Always log the context)
      console.log('[Tournament] Current form values:', form.getValues());
      console.log('[Tournament] Form validation state:', form.formState);
      console.log('[Tournament] Error details:', errorDetails || 'No detailed error information available');
      
      toast({
        title: 'Failed to create tournament',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
  
  // Navigation functions
  const nextStep = async () => {
    // Validate the current step's fields
    const fieldsToValidate = stepValidationFields[step as keyof typeof stepValidationFields];
    
    // Check if the current step's fields are valid
    const result = await form.trigger(fieldsToValidate as any);
    
    if (result) {
      // Special validation for the last step
      if (step === 2) {
        const values = form.getValues();
        // Make sure end date is not before start date
        if (values.endDate < values.startDate) {
          form.setError('endDate', {
            type: 'manual',
            message: 'End date cannot be before start date',
          });
          return;
        }
      }
      
      if (step < totalSteps - 1) {
        setStep(prev => prev + 1);
      } else {
        // If this is the last step, submit the form
        submitForm();
      }
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };
  
  // Form submission
  const submitForm = () => {
    form.handleSubmit((values) => {
      mutate(values);
    })();
  };
  
  // Render the current step with proper Suspense boundaries
  const renderStep = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2">Loading step...</span>
        </div>
      }>
        {step === 0 && <TournamentBasicInfoStep form={form} />}
        {step === 1 && <TournamentStructureStep form={form} />}
        {step === 2 && <TournamentSchedulingStep form={form} />}
      </Suspense>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="tournament-wizard-description"
      >
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogDescription id="tournament-wizard-description">
            Step {step + 1} of {totalSteps}: {steps[step].label} - {steps[step].description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Step indicators */}
        <div className="flex justify-between mb-6">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={`flex flex-col items-center ${i === step ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  i === step 
                    ? 'bg-primary text-primary-foreground' 
                    : i < step 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        
        {/* Form steps */}
        <form className="space-y-4">
          {renderStep()}
          
          <DialogFooter className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || isPending}
              className={step === 0 ? 'invisible' : ''}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={isPending}
              >
                {isPending 
                  ? 'Creating...' 
                  : step === totalSteps - 1 
                    ? 'Create Tournament' 
                    : <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}