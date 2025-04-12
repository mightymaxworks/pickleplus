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
import { ChevronRight, ChevronLeft, Check, CalendarIcon, InfoIcon, LayoutIcon, User, Users } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

// Framework 5.0 optimization: Implement a fully modular component architecture
// where all wizard components are defined in a single file to eliminate import issues

// Basic Info Step Component
const TournamentBasicInfoStep = ({ form }: { form: any }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the primary details about your tournament.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tournament Name*</FormLabel>
            <FormControl>
              <Input placeholder="Spring Championship 2025" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief description of the tournament"
                className="resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="City, State or Online" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft (Not visible to players)</SelectItem>
                <SelectItem value="published">Published (Visible to all players)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

// Structure Step Component
const TournamentStructureStep = ({ form }: { form: any }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">Tournament Structure</h3>
        <p className="text-sm text-muted-foreground">
          Define the format, division, and skill level for your tournament.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="format"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tournament Format*</FormLabel>
            <FormDescription>
              Select the playing format for the tournament
            </FormDescription>
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'singles' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('singles')}
              >
                <User className="h-6 w-6 mb-2" />
                <h4 className="font-medium">Singles</h4>
                <p className="text-xs text-muted-foreground">1v1 matches</p>
              </div>
              <div
                className={`border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'doubles' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('doubles')}
              >
                <Users className="h-6 w-6 mb-2" />
                <h4 className="font-medium">Doubles</h4>
                <p className="text-xs text-muted-foreground">2v2 matches</p>
              </div>
              <div
                className={`border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'mixed' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('mixed')}
              >
                <Users className="h-6 w-6 mb-2" />
                <h4 className="font-medium">Mixed</h4>
                <p className="text-xs text-muted-foreground">Mixed doubles</p>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open (All ages)</SelectItem>
                  <SelectItem value="age_50+">50+</SelectItem>
                  <SelectItem value="age_60+">60+</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Level*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0.0-2.9)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (3.0-3.9)</SelectItem>
                  <SelectItem value="advanced">Advanced (4.0-4.9)</SelectItem>
                  <SelectItem value="club">Club (All levels)</SelectItem>
                  <SelectItem value="pro">Professional (5.0+)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Scheduling Step Component 
const TournamentSchedulingStep = ({ form }: { form: any }) => {
  // Check for date validation errors
  const startDateError = form.formState.errors.startDate;
  const endDateError = form.formState.errors.endDate;
  const hasDateError = !!(startDateError || endDateError);
  
  // Get current dates from form
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const areValidDates = startDate && endDate;
  
  // Is end date before start date?
  const isEndDateBeforeStartDate = areValidDates && endDate < startDate;
  
  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">Schedule</h3>
        <p className="text-sm text-muted-foreground">
          Set the start and end dates for your tournament.
        </p>
      </div>
      
      {isEndDateBeforeStartDate && (
        <Alert variant="destructive" className="mb-4">
          <CalendarIcon className="h-4 w-4" />
          <AlertTitle>Invalid date range</AlertTitle>
          <AlertDescription>
            End date cannot be before start date.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date*</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Create date at noon to avoid timezone issues
                      const date = new Date(e.target.value + 'T12:00:00');
                      field.onChange(date);
                      
                      // If end date is before the new start date, update end date
                      const endDate = form.getValues("endDate");
                      if (endDate && endDate < date) {
                        form.setValue("endDate", date);
                      }
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                When the tournament begins
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date*</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Create date at noon to avoid timezone issues
                      const date = new Date(e.target.value + 'T12:00:00');
                      field.onChange(date);
                    }
                  }}
                  min={form.getValues("startDate") instanceof Date
                    ? form.getValues("startDate").toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                When the tournament concludes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="border rounded-md p-4 mt-4">
        <FormField
          control={form.control}
          name="registrationOpen"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Registration Status
                </FormLabel>
                <FormDescription>
                  Allow players to register for this tournament
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="mb-2">
          <span className="font-semibold">Note:</span> After creating the tournament, you'll be able to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Add participating teams</li>
          <li>Generate the tournament bracket</li>
          <li>Manage match schedules</li>
          <li>Publish tournament details</li>
        </ul>
      </div>
    </div>
  );
};

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
  
  // Framework 5.0 direct rendering without Suspense (simpler and more reliable)
  const renderStep = () => {
    // Prepare a consistent set of props to pass to each step component
    const stepProps = { form };
    
    // Simplified direct component rendering (Framework 5.0 principle: use simplest approach)
    if (step === 0) {
      return <TournamentBasicInfoStep {...stepProps} />;
    } else if (step === 1) {
      return <TournamentStructureStep {...stepProps} />;
    } else {
      return <TournamentSchedulingStep {...stepProps} />;
    }
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