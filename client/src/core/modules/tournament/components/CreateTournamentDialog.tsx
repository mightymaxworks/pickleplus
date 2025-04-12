/**
 * PKL-278651-TOURN-0001-BRCKT
 * Create Tournament Dialog Component
 * 
 * Form dialog for creating a new tournament
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useTournamentChanges } from '../context/TournamentChangeContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

type CreateTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryKey?: string; // Optional - may be used for cache invalidation
  onTournamentCreated?: () => void; // New callback for more direct notification
};

export function CreateTournamentDialog({ 
  open, 
  onOpenChange, 
  queryKey = '/api/tournaments',
  onTournamentCreated
}: CreateTournamentDialogProps) {
  const queryClient = useQueryClient();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { notifyTournamentChanged } = useTournamentChanges();

  // Default form values - updated to include all required fields from schema
  const defaultValues: Partial<TournamentFormValues> = {
    name: '',
    description: '',
    location: '',
    status: 'draft',
    registrationOpen: true,
    startDate: new Date(),
    endDate: new Date(),
    format: 'doubles',
    division: 'open',
    level: 'club',
  };

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
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
    onSuccess: (data) => {
      console.log('[Tournament] onSuccess handler called with data:', data);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

      // Multiple invalidation strategies for maximum reliability
      console.log(`[Tournament] Invalidating cache with key: ${queryKey}`);
      
      // Try multiple approaches to invalidate the cache
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      
      // Refetch queries immediately to ensure fresh data
      queryClient.refetchQueries({ queryKey: [queryKey] });
      
      // Notify the context that a tournament has been created
      console.log('[Tournament] Notifying context of tournament change');
      notifyTournamentChanged();

      // Call the callback if provided to trigger direct UI refresh
      if (onTournamentCreated) {
        console.log('[Tournament] Calling onTournamentCreated callback');
        onTournamentCreated();
      }
      
      // Force browser refetch with a direct API call
      fetch('/api/tournaments').then(res => {
        console.log('[Tournament] Direct API fetch completed to ensure fresh data');
      }).catch(err => {
        console.error('[Tournament] Error in direct fetch:', err);
      });

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

  function onSubmit(values: TournamentFormValues) {
    // Make sure end date is not before start date
    if (values.endDate < values.startDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date cannot be before start date',
      });
      return;
    }
    
    mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogDescription>
            Create a new tournament and configure its basic settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Name</FormLabel>
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
                    <Input placeholder="City, State or Online" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          field.onChange(date);
                          
                          // If end date is before the new start date, update end date
                          const endDate = form.getValues("endDate");
                          if (date && endDate && endDate < date) {
                            form.setValue("endDate", date);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          field.onChange(date);
                        }}
                        min={form.getValues("startDate") 
                          ? new Date(form.getValues("startDate")).toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="singles">Singles</SelectItem>
                        <SelectItem value="doubles">Doubles</SelectItem>
                        <SelectItem value="mixed">Mixed Doubles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
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
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                        <SelectItem value="pro">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Tournament'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}