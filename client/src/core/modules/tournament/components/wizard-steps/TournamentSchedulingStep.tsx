/**
 * PKL-278651-TOURN-0001-FORM
 * Tournament Scheduling Step
 * 
 * The third step in the tournament creation wizard
 * Collects start date, end date, and registration settings
 */

import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TournamentFormValues } from '../CreateTournamentWizard';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TournamentSchedulingStepProps {
  form: UseFormReturn<TournamentFormValues>;
  className?: string;
}

// Export the type for the dynamic import
export type TournamentSchedulingStepType = 
  (props: TournamentSchedulingStepProps) => JSX.Element;

export function TournamentSchedulingStep({ form, className }: TournamentSchedulingStepProps) {
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
    <div className={cn("space-y-4", className)}>
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
}