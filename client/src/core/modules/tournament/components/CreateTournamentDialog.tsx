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
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tournament form schema
const tournamentFormSchema = z.object({
  name: z.string().min(3, { message: 'Tournament name must be at least 3 characters' }),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  status: z.enum(['draft', 'published']),
  registrationOpen: z.boolean().default(true),
});

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

type CreateTournamentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTournamentDialog({ open, onOpenChange }: CreateTournamentDialogProps) {
  const queryClient = useQueryClient();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Default form values
  const defaultValues: Partial<TournamentFormValues> = {
    name: '',
    description: '',
    location: '',
    status: 'draft',
    registrationOpen: true,
    startDate: new Date(),
    endDate: new Date(),
  };

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TournamentFormValues) => {
      return apiRequest('POST', '/api/tournaments', values);
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

      // Invalidate tournaments query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });

      // Show success toast
      toast({
        title: 'Tournament created',
        description: 'Your tournament has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating tournament:', error);
      toast({
        title: 'Failed to create tournament',
        description: error.message || 'An unexpected error occurred.',
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