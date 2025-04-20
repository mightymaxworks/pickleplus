/**
 * PKL-278651-COMM-0029-MOD - Report Content Dialog
 * Implementation timestamp: 2025-04-20 22:55 ET
 * 
 * Dialog for reporting content for moderation
 * Framework 5.2 compliant implementation
 */

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { moderationService } from "@/lib/api/community/moderation-service";

// Schema for the report form
const reportSchema = z.object({
  reason: z.string().min(3, {
    message: "Reason must be at least 3 characters.",
  }).max(100, {
    message: "Reason cannot exceed 100 characters."
  }),
  details: z.string().max(1000, {
    message: "Details cannot exceed 1000 characters."
  }).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
  contentId: number;
  contentType: 'post' | 'comment' | 'event';
  onReportComplete?: () => void;
}

/**
 * Dialog component for reporting content
 */
export function ReportContentDialog({
  open,
  onOpenChange,
  communityId,
  contentId,
  contentType,
  onReportComplete
}: ReportContentDialogProps) {
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: (values: ReportFormValues) => {
      return moderationService.reportContent({
        communityId,
        contentId,
        contentType,
        reason: values.reason,
        details: values.details
      });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for your report. Our moderators will review it shortly.",
      });
      form.reset();
      onOpenChange(false);
      if (onReportComplete) {
        onReportComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: ReportFormValues) {
    reportMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Let us know why you think this content violates our community guidelines.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for report</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Inappropriate content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide any additional context that might help our moderators understand the issue."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={reportMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ReportContentDialog;