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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegisterForEvent } from "@/lib/hooks/useCommunity";
import { Loader2 } from "lucide-react";

// Define form schema using zod
const formSchema = z.object({
  notes: z.string().optional(),
  agreeToTerms: z.boolean().default(false)
    .refine(val => val === true, {
      message: "You must agree to the terms to register"
    })
});

type FormValues = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  communityId: number;
  eventId: number;
  onSuccess?: (notes?: string) => void;
  onCancel?: () => void;
}

export default function EventRegistrationForm({ 
  communityId, 
  eventId, 
  onSuccess, 
  onCancel 
}: EventRegistrationFormProps) {
  // Initialize form with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      agreeToTerms: false
    }
  });
  
  // Set up mutation for event registration
  const registerMutation = useRegisterForEvent();
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    registerMutation.mutate(
      { 
        communityId,
        eventId,
        notes: values.notes
      },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess(values.notes);
          }
        }
      }
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Display error message if registration fails */}
        {registerMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {registerMutation.error instanceof Error 
                ? registerMutation.error.message 
                : "Failed to register for event. Please try again."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Notes field */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special requests or notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requirements, questions, or comments?"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include any dietary restrictions, accessibility needs, or other requests.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Terms agreement checkbox */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the event terms and conditions
                </FormLabel>
                <FormDescription>
                  By registering, you confirm you'll follow community guidelines and attend the event.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {/* Form actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={registerMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
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