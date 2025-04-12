/**
 * PKL-278651-TOURN-0001-FORM
 * Multi-Step Tournament Creation Wizard
 * 
 * A user-friendly step-by-step wizard for creating tournaments
 * Implements Framework 5.0 principles for validation and error handling:
 * - Reliability over complexity
 * - Progressive enhancement
 * - Focused validation
 * - Comprehensive error handling
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
  Form,
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
const TournamentBasicInfoStep = ({ form }: { form: ReturnType<typeof useForm<TournamentFormValues>> }) => {
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
const TournamentStructureStep = ({ form }: { form: ReturnType<typeof useForm<TournamentFormValues>> }) => {
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
const TournamentSchedulingStep = ({ form }: { form: ReturnType<typeof useForm<TournamentFormValues>> }) => {
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
  
  // Default form values - Framework 5.0: Be explicit about form state
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
  
  // Framework 5.0: Use standardized hook-form initialization
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
    mode: 'onChange', // Validate fields on change
  });
  
  // Setup form submission with reliable error handling (Framework 5.0 priority)
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TournamentFormValues) => {
      console.log('[Tournament] Creating tournament with data:', values);
      
      // Get CSRF token for security
      const csrfResponse = await fetch('/api/auth/csrf-token', {
        credentials: 'include'
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      
      // Submit tournament data
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
        console.error('[Tournament] Error:', response.status, response.statusText, errorBody);
        throw new Error(`Failed to create tournament: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Framework 5.0: Clean up after success
      form.reset();
      onOpenChange(false);
      setStep(0);
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      
      toast({
        title: 'Tournament created',
        description: 'Your tournament has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('[Tournament] Error in mutation:', error);
      
      // Simple, user-friendly error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message) {
        // Provide specific guidance for common errors
        if (error.message.includes('CSRF')) {
          errorMessage = 'Security validation failed. Please refresh the page and try again.';
        } else if (error.message.includes('Database')) {
          errorMessage = 'Database issue detected. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Failed to create tournament',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
  
  // Framework 5.0: Simple step navigation
  const nextStep = async () => {
    // Validate current step fields
    let fieldsToValidate: string[] = [];
    
    if (step === 0) {
      fieldsToValidate = ['name', 'status']; // Only validate required fields
    } else if (step === 1) {
      fieldsToValidate = ['format', 'division', 'level'];
    } else {
      fieldsToValidate = ['startDate', 'endDate'];
      
      // Check dates relationship
      const values = form.getValues();
      if (values.startDate && values.endDate && values.endDate < values.startDate) {
        form.setError('endDate', {
          type: 'manual',
          message: 'End date cannot be before start date',
        });
        return;
      }
    }
    
    const result = await form.trigger(fieldsToValidate as any);
    
    if (result) {
      if (step < totalSteps - 1) {
        setStep(prev => prev + 1);
      } else {
        // Submit the form on last step
        form.handleSubmit((values) => {
          mutate(values);
        })();
      }
    }
  };
  
  const goBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };
  
  // Framework 5.0: Direct, simple component rendering based on step
  const renderCurrentStep = () => {
    const stepProps = { form };
    
    switch (step) {
      case 0:
        return <TournamentBasicInfoStep {...stepProps} />;
      case 1:
        return <TournamentStructureStep {...stepProps} />;
      case 2:
        return <TournamentSchedulingStep {...stepProps} />;
      default:
        return <TournamentBasicInfoStep {...stepProps} />;
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
        
        {/* Form with clear structure (Framework 5.0: Improve predictability) */}
        <Form {...form}>
          <div className="space-y-4">
            {renderCurrentStep()}
            
            <DialogFooter className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
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
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}