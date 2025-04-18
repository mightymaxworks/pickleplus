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
import { z } from "zod";
import { Loader2 } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";

// Form validation schema
const registrationFormSchema = z.object({
  notes: z.string().max(500, {
    message: "Notes cannot exceed 500 characters."
  }).optional(),
});

// Component props
interface EventRegistrationFormProps {
  onSubmit: (notes?: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

// Form values type
type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

// The component
export default function EventRegistrationForm({
  onSubmit,
  onCancel,
  isPending = false
}: EventRegistrationFormProps) {
  // Form initialization
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Submit handler
  const handleSubmit = (values: RegistrationFormValues) => {
    onSubmit(values.notes);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special notes, accommodations, or questions about the event..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any additional information for the event organizer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}