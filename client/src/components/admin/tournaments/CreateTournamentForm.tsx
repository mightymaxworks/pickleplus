/**
 * PKL-278651-TOURN-0015-CREATE - Individual Tournament Creation Form
 * 
 * Form for creating individual tournaments with all necessary configuration options
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
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Trophy, Users, Clock, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const createTournamentSchema = z.object({
  name: z.string().min(3, 'Tournament name must be at least 3 characters'),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  level: z.enum(['club', 'district', 'city', 'provincial', 'national', 'regional', 'international']),
  format: z.enum(['elimination', 'round-robin', 'hybrid', 'swiss']),
  division: z.string().min(1, 'Division is required'),
  category: z.string().min(1, 'Category is required'),
  venue: z.string().optional(),
  maxParticipants: z.number().min(4, 'Must allow at least 4 participants').optional(),
  registrationDeadline: z.date().optional(),
  registrationFee: z.number().min(0).optional(),
  isPublic: z.boolean().default(true),
  registrationOpen: z.boolean().default(true),
  // Team tournament options
  isTeamTournament: z.boolean().default(false),
  teamSize: z.number().min(2).optional(),
  minTeamSize: z.number().min(2).optional(),
  maxTeamSize: z.number().min(2).optional(),
  // Advanced settings
  allowWaitlist: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
});

type CreateTournamentFormData = z.infer<typeof createTournamentSchema>;

interface CreateTournamentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateTournamentForm({ onSuccess, onCancel }: CreateTournamentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isTeamTournament, setIsTeamTournament] = useState(false);
  
  const form = useForm<CreateTournamentFormData>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      isPublic: true,
      registrationOpen: true,
      isTeamTournament: false,
      allowWaitlist: true,
      requireApproval: false,
      emailNotifications: true,
      level: 'club',
      format: 'elimination',
    },
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: CreateTournamentFormData) => {
      const response = await apiRequest('POST', '/api/enhanced-tournaments', data);
      return response.json();
    },
    onSuccess: (tournament) => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-tournaments'] });
      toast({
        title: "Tournament Created",
        description: `"${tournament.name}" has been created successfully.`,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CreateTournamentFormData) => {
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

    createTournamentMutation.mutate(data);
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Create Tournament
        </CardTitle>
        <CardDescription>
          Set up a new tournament with all the details and configuration options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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

              {/* Tournament Format */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tournament Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            {divisionOptions.map(division => (
                              <SelectItem key={division} value={division}>
                                {division}
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Tournament Dates */}
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

              <Separator />

              {/* Registration Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Registration Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
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
                        <FormLabel>Registration Fee</FormLabel>
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
                          Leave empty or set to 0 for free tournaments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Tournament</FormLabel>
                          <FormDescription>
                            Allow anyone to discover and register for this tournament
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
                    name="registrationOpen"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Registration Open</FormLabel>
                          <FormDescription>
                            Start accepting registrations immediately
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
                            Accept registrations beyond the participant limit
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
                            Manually approve each registration
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

              {/* Team Tournament Settings */}
              <FormField
                control={form.control}
                name="isTeamTournament"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Team Tournament</FormLabel>
                      <FormDescription>
                        Enable team-based competition instead of individual play
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setIsTeamTournament(checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isTeamTournament && (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-semibold">Team Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="2"
                              placeholder="e.g., 4"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>Exact number of players per team</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minTeamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="2"
                              placeholder="e.g., 3"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>Minimum players required</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxTeamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="2"
                              placeholder="e.g., 6"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>Maximum players allowed</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={createTournamentMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTournamentMutation.isPending}
              >
                {createTournamentMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Create Tournament
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}