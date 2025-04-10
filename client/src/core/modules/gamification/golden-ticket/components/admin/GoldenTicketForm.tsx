/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Form Component
 * 
 * Form for creating new golden tickets.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGoldenTicket, getSponsors } from '../../api/goldenTicketApi';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form schema for creating golden tickets
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  campaignId: z.string().min(2, 'Campaign ID must be at least 2 characters'),
  appearanceRate: z.coerce.number().min(1).max(100),
  maxAppearances: z.coerce.number().int().min(1),
  maxClaims: z.coerce.number().int().min(1),
  startDate: z.date(),
  endDate: z.date(),
  sponsorId: z.coerce.number().optional(),
  rewardDescription: z.string().min(5, 'Reward description must be at least 5 characters'),
  rewardType: z.string().default('physical'),
  discountCode: z.string().optional(),
  discountValue: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  pagesToAppearOn: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const GoldenTicketForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch sponsors for select dropdown
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ['admin', 'sponsors'],
    queryFn: getSponsors
  });
  
  // Default form values
  const defaultValues: Partial<FormValues> = {
    title: '',
    description: '',
    campaignId: '',
    appearanceRate: 5,
    maxAppearances: 100,
    maxClaims: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    rewardDescription: '',
    rewardType: 'physical',
    discountCode: '',
    discountValue: '',
    status: 'draft',
    pagesToAppearOn: ''
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // Get form values for validation
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  
  // Check if end date is before start date
  React.useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date cannot be before start date'
      });
    } else {
      form.clearErrors('endDate');
    }
  }, [startDate, endDate, form]);
  
  // Mutation for creating golden tickets
  const mutation = useMutation({
    mutationFn: createGoldenTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'golden-tickets'] });
      toast({
        title: 'Success',
        description: 'Golden ticket created successfully',
        variant: 'default',
      });
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create golden ticket',
        variant: 'destructive',
      });
      console.error('Error creating golden ticket:', error);
    }
  });
  
  const onSubmit = (data: FormValues) => {
    // Process pages to appear on as an array if provided
    const formattedData = {
      ...data,
      // Setting default values for required fields
      currentAppearances: 0,
      // Handle sponsorId null/undefined issue
      sponsorId: data.sponsorId || null,
      pagesToAppearOn: data.pagesToAppearOn ? data.pagesToAppearOn.split(',').map(page => page.trim()) : undefined
    };
    
    mutation.mutate(formattedData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Golden ticket title" {...field} />
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
                  placeholder="Description of the golden ticket" 
                  className="resize-none"
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="campaignId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SUMMER2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sponsorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sponsor (Optional)</FormLabel>
                <Select 
                  value={field.value?.toString() || 'none'}
                  onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                  disabled={isLoadingSponsors}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sponsor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No sponsor</SelectItem>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="appearanceRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appearance Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={100} {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Percentage chance of appearing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxAppearances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Appearances</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Limit total appearances
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxClaims"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Claims</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Maximum number of claims
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="rewardDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description of the reward" 
                  className="resize-none"
                  {...field} 
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="rewardType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Type</FormLabel>
                <Select 
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="physical">Physical Product</SelectItem>
                    <SelectItem value="discount">Discount Code</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. PICKLE20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 20% or $15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="pagesToAppearOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pages to Appear On (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. /dashboard, /profile, /matches" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs">
                Comma-separated list of page paths where this ticket can appear
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
        >
          {mutation.isPending ? 'Creating...' : 'Create Golden Ticket'}
        </Button>
      </form>
    </Form>
  );
};

export default GoldenTicketForm;