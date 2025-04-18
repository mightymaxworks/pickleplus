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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterForEvent } from "@/lib/hooks/useCommunity";

// Define the form schema with Zod
const registrationFormSchema = z.object({
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface EventRegistrationFormProps {
  communityId: number;
  eventId: number;
  onSuccess: (notes?: string) => void;
  onCancel: () => void;
}

export default function EventRegistrationForm({
  communityId,
  eventId,
  onSuccess,
  onCancel,
}: EventRegistrationFormProps) {
  // Initialize the registration mutation
  const registerEvent = useRegisterForEvent();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: RegistrationFormValues) => {
    registerEvent.mutate(
      {
        communityId,
        eventId,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          onSuccess(values.notes);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests or Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes for the event organizer (e.g., dietary restrictions, accessibility needs, etc.)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This information will be shared with the event organizer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={registerEvent.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={registerEvent.isPending}
          >
            {registerEvent.isPending ? (
              <>
                <span className="mr-2">Registering...</span>
                <span className="animate-spin">⋯</span>
              </>
            ) : (
              "Register"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}