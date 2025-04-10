/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Golden Ticket Form Component
 * 
 * Form for creating new golden tickets with promotional image upload.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGoldenTicket, getSponsors } from '../../api/goldenTicketApi';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ImagePlus, X, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GoldenTicketPreview from './GoldenTicketPreview';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import FileUploadField from '../common/FileUploadField';
import { uploadPromotionalImage } from '../../services/fileUploadService';
import PageSelectField from '../common/PageSelectField';
import { AVAILABLE_PAGES } from '../../data/availablePages';

// Debug log for available pages
console.log('GoldenTicketForm loaded with pages:', { 
  availablePagesCount: AVAILABLE_PAGES.length,
  firstPages: AVAILABLE_PAGES.slice(0, 3) 
});

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
  discountCode: z.string().optional().nullable(),
  discountValue: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  selectedPages: z.array(z.string()).default([]),
  promotionalImageUrl: z.string().url('Must be a valid URL').optional().nullable(),
  promotionalImagePath: z.string().optional().nullable(),
  promotionalImageFile: z.any().optional().nullable(), // For file upload
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
  
  // State for form preview mode
  const [showPreview, setShowPreview] = useState(false);
  
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
    selectedPages: []
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
  
  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadPromotionalImage,
    onSuccess: (response) => {
      // Set the image path and URL from the response
      form.setValue('promotionalImagePath', response.filePath, { shouldValidate: true });
      form.setValue('promotionalImageUrl', response.url, { shouldValidate: true });
      
      toast({
        title: 'Success',
        description: 'Promotional image uploaded successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      console.error('Error uploading promotional image:', error);
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // If a file was selected, upload it first
      if (data.promotionalImageFile) {
        await uploadImageMutation.mutateAsync(data.promotionalImageFile);
      }
      
      // Use the structured page selection from the form
      const pagesToAppearOn = data.selectedPages || [];
      
      // Remove the file field and build data object
      const { promotionalImageFile, selectedPages, ...submitData } = data;
      
      const formattedData = {
        ...submitData,
        // Setting default values for required fields
        currentAppearances: 0,
        // Handle sponsorId null/undefined issue
        sponsorId: submitData.sponsorId || null,
        pagesToAppearOn: pagesToAppearOn,
        // Ensure promotional image fields are included
        promotionalImageUrl: submitData.promotionalImageUrl || null,
        promotionalImagePath: submitData.promotionalImagePath || null,
        // Ensure discount fields are properly handled
        discountCode: submitData.discountCode || null,
        discountValue: submitData.discountValue || null
      };
      
      // Then create the golden ticket with the updated data
      mutation.mutate(formattedData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
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
                  <Input 
                    placeholder="e.g. PICKLE20" 
                    value={field.value || ''} 
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                  <Input 
                    placeholder="e.g. 20% or $15" 
                    value={field.value || ''} 
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Structured page selection with PageSelectField component */}
        <FormField
          control={form.control}
          name="selectedPages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pages to Appear On</FormLabel>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  Current selection: {field.value?.length || 0} pages
                </div>
                
                {/* Dashboard Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Dashboard</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'dashboard').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Profile Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Profile</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'profile').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Matches Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Matches</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'matches').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Tournaments Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Tournaments</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'tournaments').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Community Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Community</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'community').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Rewards Group */}
                <div className="border rounded-md p-2 mb-2">
                  <div className="font-medium mb-1">Rewards</div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_PAGES.filter(p => p.group === 'rewards').map(page => (
                      <Badge 
                        key={page.id} 
                        variant={field.value?.includes(page.path) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = field.value?.includes(page.path)
                            ? field.value.filter(p => p !== page.path)
                            : [...(field.value || []), page.path];
                          field.onChange(newValues);
                        }}
                      >
                        {page.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {field.value?.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange([])}
                    className="mt-2"
                  >
                    Clear all selections
                  </Button>
                )}
              </div>
              <FormDescription className="text-xs mt-2">
                Select pages where this ticket can appear
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Promotional image upload */}
        <FormField
          control={form.control}
          name="promotionalImageFile"
          render={({ field }) => (
            <FileUploadField
              form={form}
              name="promotionalImageFile"
              label="Promotional Image"
              description="Upload a promotional image for the golden ticket (JPEG, PNG, WebP, GIF up to 2MB)"
            />
          )}
        />
        
        {/* Fallback URL option for image */}
        <FormField
          control={form.control}
          name="promotionalImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotional Image URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.png" 
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Only needed if not uploading a file directly
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
        
        <div className="flex gap-4 mt-4">
          <Button 
            type="submit" 
            disabled={mutation.isPending || uploadImageMutation.isPending}
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          >
            {mutation.isPending || uploadImageMutation.isPending ? 'Creating...' : 'Create Golden Ticket'}
          </Button>
          
          {/* Preview Button */}
          {(() => {
            // Debug the selected sponsor
            const sponsorId = form.watch('sponsorId');
            const selectedSponsor = sponsorId ? sponsors.find(s => s.id === sponsorId) : null;
            const promotionalImageUrl = form.watch('promotionalImageUrl');
            const promotionalImagePath = form.watch('promotionalImagePath');
            
            console.log('DEBUG Preview - Selected Sponsor ID:', sponsorId);
            console.log('DEBUG Preview - All Available Sponsors:', sponsors);
            console.log('DEBUG Preview - Found Sponsor:', selectedSponsor);
            console.log('DEBUG Preview - Promotional Image Data:', {
              promotionalImageUrl,
              promotionalImagePath,
              hasImageUrl: !!promotionalImageUrl,
              hasImagePath: !!promotionalImagePath
            });
            
            return (
              <GoldenTicketPreview
                ticketData={{
                  title: form.watch('title') || 'Golden Ticket Title',
                  description: form.watch('description') || 'Example golden ticket description text.',
                  rewardDescription: form.watch('rewardDescription') || 'Example reward description.',
                  promotionalImageUrl: promotionalImageUrl,
                  promotionalImagePath: promotionalImagePath,
                  sponsor: selectedSponsor
                }}
                trigger={
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                }
              />
            );
          })()}
        </div>
      </form>
    </Form>
  );
};

export default GoldenTicketForm;