/**
 * PKL-278651-COMM-0015-EVENT
 * Event Creation Interface
 * 
 * This component provides a form for creating new community events.
 * It supports multiple event types, scheduling options, and advanced event settings.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Info, MapPin, Users, Clock, Globe } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Types
import { CommunityEventType, CommunityEventStatus } from "@/types/community";

// API Hooks
import { useCreateCommunityEvent } from "@/lib/hooks/useCommunity";

// Debug imports
console.log("EventCreationForm: Successfully imported types and hooks");

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters."
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }).max(2000, {
    message: "Description must not exceed 2000 characters."
  }).nullable(),
  eventType: z.nativeEnum(CommunityEventType, {
    errorMap: () => ({ message: "Please select an event type." })
  }),
  eventDate: z.date({
    required_error: "Please select a date and time for the event."
  }),
  endDate: z.date().nullable().optional(),
  location: z.string().nullable().optional(),
  isVirtual: z.boolean().default(false),
  virtualMeetingUrl: z.string().url({ message: "Please enter a valid URL." }).nullable().optional(),
  maxAttendees: z.number().int().positive().nullable().optional(),
  isPrivate: z.boolean().default(false),
  status: z.nativeEnum(CommunityEventStatus).default(CommunityEventStatus.UPCOMING),
  skillLevelRequired: z.string().nullable().optional(),
  registrationDeadline: z.date().nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().nullable().optional(),
  repeatFrequency: z.string().nullable().optional(),
});

// Infer the type from the schema
type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventCreationFormProps {
  communityId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventCreationForm({ communityId, onSuccess, onCancel }: EventCreationFormProps) {
  const { toast } = useToast();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const createEvent = useCreateCommunityEvent();
  
  // Default values 
  const defaultValues: Partial<EventFormValues> = {
    title: "",
    description: "",
    eventType: CommunityEventType.MATCH_PLAY,
    eventDate: new Date(),
    status: CommunityEventStatus.UPCOMING, // Always start with Upcoming
    isVirtual: false,
    isPrivate: false,
    isRecurring: false,
    skillLevelRequired: "all",      // Default skill level to avoid empty string issue
    recurringPattern: "weekly",     // Default recurring pattern 
    repeatFrequency: "4times",      // Default frequency
  };
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });
  
  const isVirtual = form.watch("isVirtual");
  const isRecurring = form.watch("isRecurring");
  
  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    try {
      await createEvent.mutateAsync({
        communityId,
        data: {
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          endDate: data.endDate,
          location: data.location,
          isVirtual: data.isVirtual,
          virtualMeetingUrl: data.isVirtual ? data.virtualMeetingUrl : null,
          maxAttendees: data.maxAttendees,
          isPrivate: data.isPrivate,
          isRecurring: data.isRecurring,
          recurringPattern: data.isRecurring ? data.recurringPattern : null,
          repeatFrequency: data.isRecurring ? data.repeatFrequency : null,
          status: data.status,
          eventType: data.eventType,
          skillLevelRequired: data.skillLevelRequired,
          registrationDeadline: data.registrationDeadline,
        }
      });
      
      toast({
        title: "Event Created",
        description: "Your event has been successfully created.",
        variant: "default",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error Creating Event",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a New Event</CardTitle>
        <CardDescription>
          Schedule a new event for your community members
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Event Title */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekly Match Play" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a clear title that describes your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Event Type */}
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value as CommunityEventType)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CommunityEventType.MATCH_PLAY}>Match Play</SelectItem>
                        <SelectItem value={CommunityEventType.CLINIC}>Clinic</SelectItem>
                        <SelectItem value={CommunityEventType.TOURNAMENT}>Tournament</SelectItem>
                        <SelectItem value={CommunityEventType.SOCIAL}>Social</SelectItem>
                        <SelectItem value={CommunityEventType.WORKSHOP}>Workshop</SelectItem>
                        <SelectItem value={CommunityEventType.LEAGUE}>League</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Status field removed - all new events automatically have UPCOMING status */}
              
              {/* Event Date */}
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP p")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            // When a date is selected, preserve the current time or set a default
                            if (date) {
                              const newDate = new Date(date);
                              // If there's already a selected date/time, preserve the time
                              if (field.value) {
                                newDate.setHours(field.value.getHours());
                                newDate.setMinutes(field.value.getMinutes());
                              } else {
                                // Default to noon
                                newDate.setHours(12);
                                newDate.setMinutes(0);
                              }
                              field.onChange(newDate);
                            } else {
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Time:</span>
                            <Select
                              onValueChange={(value) => {
                                if (!field.value) {
                                  // If no date selected yet, create one for today
                                  const date = new Date();
                                  date.setHours(parseInt(value, 10));
                                  field.onChange(date);
                                  return;
                                }
                                const date = new Date(field.value);
                                date.setHours(parseInt(value, 10));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "HH") : "12"}
                            >
                              <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Hour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({length: 24}, (_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                    {i.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span>:</span>
                            <Select
                              onValueChange={(value) => {
                                if (!field.value) {
                                  // If no date selected yet, create one for today
                                  const date = new Date();
                                  date.setMinutes(parseInt(value, 10));
                                  field.onChange(date);
                                  return;
                                }
                                const date = new Date(field.value);
                                date.setMinutes(parseInt(value, 10));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "mm") : "00"}
                            >
                              <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Min" />
                              </SelectTrigger>
                              <SelectContent>
                                {['00', '15', '30', '45'].map((minute) => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* End Date (optional) */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date & Time (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP p")
                            ) : (
                              <span>Select end date/time</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            // When a date is selected, preserve the current time or set a default
                            if (date) {
                              const newDate = new Date(date);
                              // If there's already a selected date/time, preserve the time
                              if (field.value) {
                                newDate.setHours(field.value.getHours());
                                newDate.setMinutes(field.value.getMinutes());
                              } else {
                                // Default to noon
                                newDate.setHours(12);
                                newDate.setMinutes(0);
                              }
                              field.onChange(newDate);
                            } else {
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Time:</span>
                            <Select
                              onValueChange={(value) => {
                                if (!field.value) {
                                  // If no date selected yet, create one for today
                                  const today = new Date();
                                  today.setHours(parseInt(value, 10));
                                  field.onChange(today);
                                  return;
                                }
                                const date = new Date(field.value);
                                date.setHours(parseInt(value, 10));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "HH") : "12"}
                            >
                              <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Hour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({length: 24}, (_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                    {i.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span>:</span>
                            <Select
                              onValueChange={(value) => {
                                if (!field.value) {
                                  // If no date selected yet, create one for today
                                  const today = new Date();
                                  today.setMinutes(parseInt(value, 10));
                                  field.onChange(today);
                                  return;
                                }
                                const date = new Date(field.value);
                                date.setMinutes(parseInt(value, 10));
                                field.onChange(date);
                              }}
                              defaultValue={field.value ? format(field.value, "mm") : "00"}
                            >
                              <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Min" />
                              </SelectTrigger>
                              <SelectContent>
                                {['00', '15', '30', '45'].map((minute) => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      For multi-day events, specify when the event ends
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Virtual Event Switch */}
              <FormField
                control={form.control}
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Virtual Event</FormLabel>
                      <FormDescription>
                        Is this a virtual event?
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
              
              {/* Private Event Switch */}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Private Event</FormLabel>
                      <FormDescription>
                        Only visible to community members
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
              
              {/* Conditional: Physical Location */}
              {!isVirtual && (
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Enter the event location" 
                              className="pl-9"
                              {...field} 
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where will this event take place?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Conditional: Virtual Meeting URL */}
              {isVirtual && (
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="virtualMeetingUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="https://zoom.us/j/example" 
                              className="pl-9"
                              {...field} 
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Provide a link to the virtual meeting (Zoom, Google Meet, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Max Attendees */}
              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          placeholder="Unlimited" 
                          className="pl-9"
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Limit the number of people who can register
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Skill Level Required */}
              <FormField
                control={form.control}
                name="skillLevelRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level Required (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value || "all"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All skill levels" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All skill levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Event Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your event in detail..." 
                      className="min-h-32"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Include important details about the event, what to bring, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Advanced Settings Toggle */}
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              >
                {isAdvancedOpen ? "Hide" : "Show"} Advanced Settings
              </Button>
            </div>
            
            {/* Advanced Settings Section */}
            {isAdvancedOpen && (
              <div className="space-y-6 rounded-lg border p-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                  <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
                
                <Separator />
                
                {/* Registration Deadline */}
                <FormField
                  control={form.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Deadline (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP p")
                              ) : (
                                <span>Set deadline for registration</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              // When a date is selected, preserve the current time or set a default
                              if (date) {
                                const newDate = new Date(date);
                                // If there's already a selected date/time, preserve the time
                                if (field.value) {
                                  newDate.setHours(field.value.getHours());
                                  newDate.setMinutes(field.value.getMinutes());
                                } else {
                                  // Default to noon
                                  newDate.setHours(12);
                                  newDate.setMinutes(0);
                                }
                                field.onChange(newDate);
                              } else {
                                field.onChange(date);
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Time:</span>
                              <Select
                                onValueChange={(value) => {
                                  if (!field.value) {
                                    // If no date selected yet, create one for today
                                    const date = new Date();
                                    date.setHours(parseInt(value, 10));
                                    field.onChange(date);
                                    return;
                                  }
                                  const date = new Date(field.value);
                                  date.setHours(parseInt(value, 10));
                                  field.onChange(date);
                                }}
                                defaultValue={field.value ? format(field.value, "HH") : "12"}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue placeholder="Hour" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 24}, (_, i) => (
                                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span>:</span>
                              <Select
                                onValueChange={(value) => {
                                  if (!field.value) {
                                    // If no date selected yet, create one for today
                                    const date = new Date();
                                    date.setMinutes(parseInt(value, 10));
                                    field.onChange(date);
                                    return;
                                  }
                                  const date = new Date(field.value);
                                  date.setMinutes(parseInt(value, 10));
                                  field.onChange(date);
                                }}
                                defaultValue={field.value ? format(field.value, "mm") : "00"}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue placeholder="Min" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['00', '15', '30', '45'].map((minute) => (
                                    <SelectItem key={minute} value={minute}>
                                      {minute}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Last date and time when users can register for this event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Recurring Event Option */}
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring Event</FormLabel>
                        <FormDescription>
                          Does this event repeat on a schedule?
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
                
                {/* Conditional Recurring Event Options */}
                {isRecurring && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recurringPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Pattern</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value || "weekly"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select repeat pattern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="repeatFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Frequency</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value || "4times"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select how many times" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="4times">4 times</SelectItem>
                              <SelectItem value="8times">8 times</SelectItem>
                              <SelectItem value="12times">12 times</SelectItem>
                              <SelectItem value="ongoing">Ongoing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit"
                disabled={createEvent.isPending}
              >
                {createEvent.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}