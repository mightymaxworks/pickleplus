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
    <div className="space-y-3">
      {/* Reduced spacing and simplified header */}
      <h3 className="text-base font-medium mb-2">Basic Information</h3>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-sm font-medium">Tournament Name*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Spring Championship 2025" 
                {...field} 
                className="h-9 text-sm"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-sm font-medium">Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief description of the tournament"
                className="resize-none min-h-[60px] text-sm"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-sm font-medium">Location</FormLabel>
            <FormControl>
              <Input 
                placeholder="City, State or Online" 
                {...field} 
                value={field.value || ''} 
                className="h-9 text-sm"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      {/* Tournament Tier - for CourtIQ rating integration */}
      <FormField
        control={form.control}
        name="tier"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-sm font-medium">Tournament Tier*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select tournament tier" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="local">Local/Club</SelectItem>
                <SelectItem value="city">City/Municipal</SelectItem>
                <SelectItem value="district">District/Regional</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">
              Tournament tier affects CourtIQ ranking points
            </FormDescription>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-sm font-medium">Status*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft (Not visible to players)</SelectItem>
                <SelectItem value="published">Published (Visible to all players)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
};

// Structure Step Component 
const TournamentStructureStep = ({ form }: { form: ReturnType<typeof useForm<TournamentFormValues>> }) => {
  return (
    <div className="space-y-3">
      {/* Simplified header */}
      <h3 className="text-base font-medium mb-2">Tournament Structure</h3>
      
      <FormField
        control={form.control}
        name="format"
        render={({ field }) => (
          <FormItem className="space-y-1 mb-2">
            <FormLabel className="text-sm font-medium">Tournament Format*</FormLabel>
            <div className="grid grid-cols-3 gap-1">
              <div
                className={`border rounded-md p-2 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'singles' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('singles')}
              >
                <User className="h-4 w-4 mb-1" />
                <h4 className="text-xs font-medium">Singles</h4>
                <p className="text-[10px] text-muted-foreground">1v1 matches</p>
              </div>
              <div
                className={`border rounded-md p-2 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'doubles' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('doubles')}
              >
                <Users className="h-4 w-4 mb-1" />
                <h4 className="text-xs font-medium">Doubles</h4>
                <p className="text-[10px] text-muted-foreground">2v2 matches</p>
              </div>
              <div
                className={`border rounded-md p-2 cursor-pointer hover:border-primary/50 transition-colors ${
                  field.value === 'mixed' ? 'border-primary' : ''
                }`}
                onClick={() => field.onChange('mixed')}
              >
                <Users className="h-4 w-4 mb-1" />
                <h4 className="text-xs font-medium">Mixed</h4>
                <p className="text-[10px] text-muted-foreground">Mixed doubles</p>
              </div>
            </div>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel className="text-sm font-medium">Division*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open (All ages)</SelectItem>
                  <SelectItem value="mens">Men's</SelectItem>
                  <SelectItem value="womens">Women's</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="junior">Junior (Under 18)</SelectItem>
                  <SelectItem value="youth">Youth (Under 23)</SelectItem>
                  <SelectItem value="senior">Senior (35+)</SelectItem>
                  <SelectItem value="senior_50">Senior (50+)</SelectItem>
                  <SelectItem value="senior_60">Senior (60+)</SelectItem>
                  <SelectItem value="senior_65">Senior (65+)</SelectItem>
                  <SelectItem value="senior_70">Senior (70+)</SelectItem>
                  <SelectItem value="wheelchair">Wheelchair</SelectItem>
                  <SelectItem value="adaptive">Adaptive Play</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel className="text-sm font-medium">Skill Level*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
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
              <FormMessage className="text-xs" />
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
    <div className="space-y-3">
      {/* Simplified header */}
      <h3 className="text-base font-medium mb-2">Schedule</h3>
      
      {isEndDateBeforeStartDate && (
        <Alert variant="destructive" className="mb-2 py-2 text-xs">
          <CalendarIcon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            End date cannot be before start date.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel className="text-sm font-medium">Start Date*</FormLabel>
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
                  className="w-full h-9"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel className="text-sm font-medium">End Date*</FormLabel>
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
                  className="w-full h-9"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
      
      <div className="border rounded-md p-2 mt-2">
        <FormField
          control={form.control}
          name="registrationOpen"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2">
              <div>
                <FormLabel className="text-sm font-medium">
                  Registration Status
                </FormLabel>
                <FormDescription className="text-xs">
                  Allow registrations
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
      
      <div className="mt-3 border-t pt-2">
        <p className="text-xs mb-1">
          <span className="font-semibold">Next steps:</span>
        </p>
        <ul className="list-disc list-inside space-y-0 text-xs text-muted-foreground pl-1">
          <li>Add participating teams</li>
          <li>Generate tournament bracket</li>
          <li>Manage match schedules</li>
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
  
  // Tournament tier for CourtIQ integration
  tier: z.string().default('local'),
  
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
    tier: 'local',
  };
  
  // Framework 5.0: Use standardized hook-form initialization
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
    mode: 'onChange', // Validate fields on change
  });
  
  // Simplify the form submission process (Framework 5.0: reliability over complexity)
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TournamentFormValues) => {
      console.log('[Tournament] Creating tournament with data:', values);
      
      try {
        // Get CSRF token for security
        const csrfResponse = await fetch('/api/auth/csrf-token', {
          credentials: 'include'
        });
        
        if (!csrfResponse.ok) {
          console.error('[Tournament] CSRF token fetch failed:', csrfResponse.status);
          throw new Error('Failed to fetch CSRF token');
        }
        
        const { csrfToken } = await csrfResponse.json();
        console.log('[Tournament] CSRF token obtained successfully');
        
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
        
        console.log('[Tournament] Created successfully');
        return response.json();
      } catch (error) {
        console.error('[Tournament] Error in mutation:', error);
        throw error;
      }
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
  
  // Framework 5.0: Simplified step navigation without complex validation
  const nextStep = () => {
    // For simplicity and reliability, let's just enforce the minimal validation
    // and focus on making navigation work first
    if (step === 0) {
      // Basic validation for first step
      const name = form.getValues("name");
      if (!name || name.length < 3) {
        form.setError("name", {
          type: "manual",
          message: "Tournament name must be at least 3 characters"
        });
        return;
      }
    }
    
    // Move to next step (or submit if on final step)
    if (step < totalSteps - 1) {
      setStep(step + 1); // Direct approach without using prev callback
      console.log("[Tournament] Moving to step:", step + 1);
    } else {
      // On the final step, submit the form
      console.log("[Tournament] Submitting form from final step");
      form.handleSubmit(values => {
        console.log("[Tournament] Form submission values:", values);
        mutate(values);
      })();
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
        className="w-[95%] max-w-[600px] p-4 md:p-6 max-h-[90vh] overflow-y-auto"
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
        
        {/* Simplified step indicators */}
        <div className="flex justify-between mb-4">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={`flex items-center ${i === step ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${
                  i === step 
                    ? 'bg-primary text-primary-foreground' 
                    : i < step 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        
        {/* Form with clear structure (Framework 5.0: Improve predictability) */}
        <Form {...form}>
          <div className="space-y-4">
            {renderCurrentStep()}
            
            <DialogFooter className="flex justify-between pt-3 border-t mt-3">
              <div>
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={isPending}
                    className="h-9"
                    size="sm"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="h-9"
                  size="sm"
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={isPending}
                  className="h-9"
                  size="sm"
                >
                  {isPending 
                    ? 'Creating...' 
                    : step === totalSteps - 1 
                      ? 'Create' 
                      : 'Next'
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