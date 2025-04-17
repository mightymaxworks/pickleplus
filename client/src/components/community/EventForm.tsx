/**
 * PKL-278651-COMM-0007-ENGAGE - Event Creation/Edit Form
 * 
 * This component provides a form for creating or editing community events
 * with enhanced features for event types, skill level requirements, and status.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCommunityEventSchema } from "@shared/schema/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Extended schema for the event form
const eventFormSchema = insertCommunityEventSchema
  .extend({
    eventDate: z.date({
      required_error: "Event date is required",
    }),
    endDate: z.date().optional(),
    minSkillLevel: z.string().optional(),
    maxSkillLevel: z.string().optional(),
    maxAttendees: z.coerce.number().optional(),
  })
  .omit({
    id: true,
    communityId: true,
    createdByUserId: true,
    currentAttendees: true,
    createdAt: true,
    updatedAt: true,
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  communityId: number;
  onSubmit: (data: EventFormValues) => void;
  isSubmitting?: boolean;
}

// Event type options
const EVENT_TYPES = [
  { value: "match_play", label: "Match Play" },
  { value: "league", label: "League" },
  { value: "training", label: "Training Session" },
  { value: "tournament", label: "Tournament" },
  { value: "social", label: "Social Gathering" },
  { value: "other", label: "Other" },
];

// Status options
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

// Skill level options (based on DUPR rating scale)
const SKILL_LEVEL_OPTIONS = [
  { value: "2.0", label: "2.0 - Beginner" },
  { value: "2.5", label: "2.5 - Advanced Beginner" },
  { value: "3.0", label: "3.0 - Lower Intermediate" },
  { value: "3.5", label: "3.5 - Intermediate" },
  { value: "4.0", label: "4.0 - Advanced Intermediate" },
  { value: "4.5", label: "4.5 - Advanced" },
  { value: "5.0", label: "5.0 - Open/Expert" },
  { value: "5.5", label: "5.5 - Professional" },
];

export function EventForm({
  defaultValues,
  communityId,
  onSubmit,
  isSubmitting = false,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "match_play",
      location: "",
      isVirtual: false,
      virtualMeetingUrl: "",
      maxAttendees: undefined,
      isPrivate: false,
      isRecurring: false,
      recurringPattern: "",
      repeatFrequency: "",
      status: "active",
      ...defaultValues,
    },
  });

  const watchIsVirtual = form.watch("isVirtual");
  const watchIsRecurring = form.watch("isRecurring");

  const handleSubmit = (data: EventFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "match_play"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of event you're organizing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event details, rules, and other important information"
                  {...field}
                  value={field.value || ""}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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
                <FormLabel>End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value as Date | undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  For multi-day events (leave empty for single day)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="isVirtual"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Virtual Event</FormLabel>
                  <FormDescription>
                    Check if this is an online event
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "active"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Current status of the event</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchIsVirtual ? (
          <FormField
            control={form.control}
            name="virtualMeetingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Virtual Meeting URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter meeting link (Zoom, Teams, etc.)"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter physical location of the event"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Maximum participants"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of participants (leave empty for unlimited)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minSkillLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Skill Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No minimum" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No minimum</SelectItem>
                    {SKILL_LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Minimum skill rating required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSkillLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Skill Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No maximum" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No maximum</SelectItem>
                    {SKILL_LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Maximum skill rating limit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Private Event</FormLabel>
                  <FormDescription>
                    Private events are only visible to community members
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Recurring Event</FormLabel>
                  <FormDescription>
                    Check if this event repeats regularly
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {watchIsRecurring && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="recurringPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring Pattern</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
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
                  <FormControl>
                    <Input
                      placeholder="Frequency details (e.g., 'Every Monday')"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional details about the recurring schedule
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-pickle-green hover:bg-pickle-green/90"
          >
            {isSubmitting ? "Saving..." : "Save Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}