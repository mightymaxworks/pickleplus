/**
 * PKL-278651-COMM-0016-RSVP
 * Event Registration Form Component
 * 
 * This component provides a form for users to register for community events.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 */

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterForEvent } from "@/lib/hooks/useCommunity";

// Form schema for event registration with optional notes
const registrationFormSchema = z.object({
  notes: z.string().optional(),
});

// The type of form values based on the schema
type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

// Props for the registration form component
interface EventRegistrationFormProps {
  // Callback function when form is submitted
  onSubmit: (notes?: string) => void;
  // Callback function when registration is cancelled
  onCancel: () => void;
  // Boolean flag for showing loading state
  isPending?: boolean;
  // Identifiers for the event and community
  communityId: number;
  eventId: number;
}

/**
 * Event Registration Form Component
 * 
 * This component renders a form for registering to events with an optional
 * notes field for special requests or accommodations.
 */
export default function EventRegistrationForm({
  onSubmit,
  onCancel,
  isPending = false,
  communityId,
  eventId
}: EventRegistrationFormProps) {
  // Initialize the registration mutation
  const registerMutation = useRegisterForEvent();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Handler for form submission
  const handleSubmit = (values: RegistrationFormValues) => {
    // Submit registration via mutation
    registerMutation.mutate({
      communityId,
      eventId,
      notes: values.notes
    }, {
      onSuccess: () => {
        // Call the passed onSubmit callback on success
        onSubmit(values.notes);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Register for Event</h3>
          <p className="text-sm text-muted-foreground">
            Secure your spot at this event. You can include any special requests or accommodations needed.
          </p>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Include any special requests, dietary restrictions, or accommodations needed"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending || registerMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isPending || registerMutation.isPending}
          >
            {isPending || registerMutation.isPending ? "Registering..." : "Register Now"}
          </Button>
        </div>
      </form>
    </Form>
  );
}