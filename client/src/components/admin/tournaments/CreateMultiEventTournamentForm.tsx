/**
 * PKL-278651-TOURN-0015-MULTI - Multi-Event Tournament Creation Form
 * 
 * Wizard for creating parent tournaments with multiple sub-tournaments
 * for different divisions and categories
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Trophy, Users, Plus, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const createMultiEventTournamentSchema = z.object({
  // Parent tournament details
  name: z.string().min(3, 'Tournament name must be at least 3 characters'),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  venue: z.string().optional(),
  level: z.enum(['club', 'district', 'city', 'provincial', 'national', 'regional', 'international']),
  
  // Event configuration
  divisions: z.array(z.string()).min(1, 'Select at least one division'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  format: z.enum(['elimination', 'round-robin', 'hybrid', 'swiss']),
  
  // Registration settings
  registrationDeadline: z.date().optional(),
  registrationFee: z.number().min(0).optional(),
  isPublic: z.boolean().default(true),
  maxParticipantsPerEvent: z.number().min(4).optional(),
  
  // Advanced settings
  allowWaitlist: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
});

type CreateMultiEventTournamentFormData = z.infer<typeof createMultiEventTournamentSchema>;

interface SubTournamentPreview {
  name: string;
  division: string;
  category: string;
  expectedParticipants: number;
}

interface CreateMultiEventTournamentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateMultiEventTournamentForm({ onSuccess, onCancel }: CreateMultiEventTournamentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [subTournamentPreviews, setSubTournamentPreviews] = useState<SubTournamentPreview[]>([]);
  
  const form = useForm<CreateMultiEventTournamentFormData>({
    resolver: zodResolver(createMultiEventTournamentSchema),
    defaultValues: {
      isPublic: true,
      allowWaitlist: true,
      requireApproval: false,
      emailNotifications: true,
      level: 'club',
      format: 'elimination',
      divisions: [],
      categories: [],
    },
  });

  // Watch for changes to update previews
  const watchedDivisions = form.watch('divisions');
  const watchedCategories = form.watch('categories');
  const watchedName = form.watch('name');

  React.useEffect(() => {
    if (watchedDivisions.length > 0 && watchedCategories.length > 0) {
      const previews: SubTournamentPreview[] = [];
      watchedDivisions.forEach(division => {
        watchedCategories.forEach(category => {
          previews.push({
            name: `${watchedName || 'Tournament'} - ${category} ${division}`,
            division,
            category,
            expectedParticipants: getExpectedParticipants(division, category),
          });
        });
      });
      setSubTournamentPreviews(previews);
    } else {
      setSubTournamentPreviews([]);
    }
  }, [watchedDivisions, watchedCategories, watchedName]);

  // Create multi-event tournament mutation
  const createMultiEventTournamentMutation = useMutation({
    mutationFn: async (data: CreateMultiEventTournamentFormData) => {
      const response = await apiRequest('POST', '/api/enhanced-tournaments/multi-event', data);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-tournaments'] });
      toast({
        title: "Multi-Event Tournament Created",
        description: `"${result.parentTournament.name}" with ${result.subTournaments.length} events has been created successfully.`,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create multi-event tournament",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CreateMultiEventTournamentFormData) => {
    // Validate end date is after start date
    if (data.endDate <= data.startDate) {
      form.setError('endDate', {
        type: 'manual',
        message: 'End date must be after start date',
      });
      return;
    }

    // Validate registration deadline
    if (data.registrationDeadline && data.registrationDeadline > data.startDate) {
      form.setError('registrationDeadline', {
        type: 'manual',
        message: 'Registration deadline must be before tournament start date',
      });
      return;
    }

    createMultiEventTournamentMutation.mutate(data);
  };

  const getExpectedParticipants = (division: string, category: string): number => {
    // Estimate based on division and category popularity
    const divisionMultiplier = division === 'Open' ? 1.5 : 
                              division.includes('35+') || division.includes('45+') ? 1.2 : 1.0;
    const categoryMultiplier = category.includes('Doubles') ? 1.3 : 1.0;
    return Math.round(16 * divisionMultiplier * categoryMultiplier);
  };

  const divisionOptions = [
    'Open', '19+', '35+', '45+', '50+', '55+', '60+', '65+', '70+', '75+'
  ];

  const categoryOptions = [
    'Men\'s Singles', 'Women\'s Singles', 'Men\'s Doubles', 'Women\'s Doubles', 'Mixed Doubles'
  ];

  const levelMultipliers = {
    club: '1.0x points',
    district: '1.5x points',
    city: '1.8x points',
    provincial: '2.0x points',
    national: '2.5x points',
    regional: '3.0x points',
    international: '4.0x points'
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Details', description: 'Tournament information' },
    { number: 2, title: 'Event Configuration', description: 'Divisions and categories' },
    { number: 3, title: 'Review & Create', description: 'Confirm and create' },
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Create Multi-Event Tournament
        </CardTitle>
        <CardDescription>
          Create a tournament with multiple divisions and categories
        </CardDescription>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-muted-foreground'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-8 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tournament Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tournament Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spring Championship 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tournament description, rules, and any special information"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Riverside Tennis Club" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tournament Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(levelMultipliers).map(([level, multiplier]) => (
                                <SelectItem key={level} value={level}>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="capitalize">{level}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {multiplier}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Higher level tournaments award more ranking points
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                                disabled={(date) => date < new Date()}
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
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                                disabled={(date) => date < new Date()}
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
                      name="registrationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date (optional)</span>
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
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Event Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tournament Format</h3>
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format (applies to all events)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="elimination">Single Elimination</SelectItem>
                            <SelectItem value="round-robin">Round Robin</SelectItem>
                            <SelectItem value="hybrid">Hybrid (Groups + Elimination)</SelectItem>
                            <SelectItem value="swiss">Swiss System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="divisions"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base">Select Divisions</FormLabel>
                        <FormDescription>
                          Choose which age divisions to include in this tournament
                        </FormDescription>
                        <div className="grid grid-cols-2 gap-3">
                          {divisionOptions.map((division) => (
                            <FormField
                              key={division}
                              control={form.control}
                              name="divisions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={division}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(division)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, division])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== division
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {division}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base">Select Categories</FormLabel>
                        <FormDescription>
                          Choose which play categories to include in this tournament
                        </FormDescription>
                        <div className="space-y-3">
                          {categoryOptions.map((category) => (
                            <FormField
                              key={category}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, category])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== category
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {category}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Registration Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="maxParticipantsPerEvent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Participants Per Event</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Leave empty for no limit"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Fee (per event)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee charged for each event a player enters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Public Tournament</FormLabel>
                            <FormDescription>
                              Allow public discovery and registration
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

                    <FormField
                      control={form.control}
                      name="allowWaitlist"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Waitlist</FormLabel>
                            <FormDescription>
                              Accept registrations beyond limits
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

                    <FormField
                      control={form.control}
                      name="requireApproval"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Approval</FormLabel>
                            <FormDescription>
                              Manually approve registrations
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
                </div>
              </div>
            )}

            {/* Step 3: Review & Create */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tournament Preview</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle>{form.getValues('name') || 'Tournament Name'}</CardTitle>
                      <CardDescription>
                        {form.getValues('description') || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Level</p>
                          <p className="capitalize">{form.getValues('level')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Format</p>
                          <p className="capitalize">{form.getValues('format')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Venue</p>
                          <p>{form.getValues('venue') || 'TBD'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Total Events</p>
                          <p>{subTournamentPreviews.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Sub-Tournaments to be Created</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subTournamentPreviews.map((preview, index) => (
                      <Card key={index} className="border-dashed">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{preview.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Division:</span>
                              <Badge variant="outline">{preview.division}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Category:</span>
                              <Badge variant="outline">{preview.category}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expected:</span>
                              <span>{preview.expectedParticipants} players</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {subTournamentPreviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events will be created. Please go back and select divisions and categories.</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={createMultiEventTournamentMutation.isPending}
                >
                  Cancel
                </Button>
                
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createMultiEventTournamentMutation.isPending || subTournamentPreviews.length === 0}
                  >
                    {createMultiEventTournamentMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Create Tournament ({subTournamentPreviews.length} events)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}