/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Form Component
 * 
 * Form for creating and editing golden tickets.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoldenTicket } from '../../api/goldenTicketApi';
import { Sponsor } from '@shared/golden-ticket.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Form schema for creating golden tickets
const formSchema = z.object({
  campaignId: z.string().min(3, 'Campaign ID must be at least 3 characters'),
  sponsorId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  prizeDescription: z.string().min(10, 'Prize description must be at least 10 characters'),
  discountCode: z.string().optional().or(z.literal('')),
  discountValue: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  appearanceRate: z.number().min(1).max(100),
  maxClaims: z.number().positive('Must be a positive number'),
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type FormValues = z.infer<typeof formSchema>;

interface GoldenTicketFormProps {
  sponsors: Sponsor[];
}

const GoldenTicketForm: React.FC<GoldenTicketFormProps> = ({ sponsors }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default form values
  const defaultValues: Partial<FormValues> = {
    campaignId: '',
    title: '',
    description: '',
    imageUrl: '',
    prizeDescription: '',
    discountCode: '',
    discountValue: '',
    status: 'draft',
    appearanceRate: 5,
    maxClaims: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // Mutation for creating golden tickets
  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Convert sponsorId from string to number if provided
      const formattedData = {
        ...data,
        sponsorId: data.sponsorId ? parseInt(data.sponsorId, 10) : undefined
      };
      return createGoldenTicket(formattedData);
    },
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
    mutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign ID</FormLabel>
              <FormControl>
                <Input placeholder="summer-2025" {...field} />
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
              <FormLabel>Sponsor</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sponsor (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sponsors.map(sponsor => (
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
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Summer Discount Ticket" {...field} />
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
                  placeholder="Describe the golden ticket offer" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prizeDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prize Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the prize or reward" 
                  {...field} 
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Code (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="SUMMER25" {...field} />
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
                <FormLabel>Discount Value (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="25% off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
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
          
          <FormField
            control={form.control}
            name="maxClaims"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Claims</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="appearanceRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appearance Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="pl-3 text-left font-normal"
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
                        className="pl-3 text-left font-normal"
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
        >
          {mutation.isPending ? 'Creating...' : 'Create Golden Ticket'}
        </Button>
      </form>
    </Form>
  );
};

export default GoldenTicketForm;