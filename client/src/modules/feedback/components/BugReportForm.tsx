/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Form Component
 * 
 * This component provides a form for users to submit bug reports.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { BugReportFormData } from '../types';
import { prepareBugReportFormData, submitBugReport } from '../api/feedbackApi';

// Form validation schema
const bugReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  currentPage: z.string(),
  stepsToReproduce: z.string().optional(),
  isReproducible: z.boolean().default(true),
  includeUserInfo: z.boolean().default(true),
  screenshot: z.any().optional(),
});

interface BugReportFormProps {
  /** The current page URL where the form is being displayed */
  currentPage: string;
  
  /** Callback called after successful form submission */
  onSubmitSuccess?: () => void;
}

export function BugReportForm({ currentPage, onSubmitSuccess }: BugReportFormProps) {
  const { toast } = useToast();
  const [screenSize, setScreenSize] = useState<string>(`${window.innerWidth}x${window.innerHeight}`);
  
  // Set up the form
  const form = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'medium',
      currentPage,
      stepsToReproduce: '',
      isReproducible: true,
      includeUserInfo: true,
      screenshot: undefined,
      screenSize,
    },
  });
  
  // Get screen size when window is resized
  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize(`${window.innerWidth}x${window.innerHeight}`);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: BugReportFormData) => {
      const formData = prepareBugReportFormData(data);
      return submitBugReport(formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Bug report submitted',
          description: 'Thank you for your feedback! Our team will review your report.',
          variant: 'default',
        });
        
        // Reset the form
        form.reset();
        
        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        toast({
          title: 'Error submitting bug report',
          description: data.error || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      console.error('Error submitting bug report:', error);
      toast({
        title: 'Error submitting bug report',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: BugReportFormData) => {
    // Add current screen size
    data.screenSize = screenSize;
    
    // Submit the form
    submitMutation.mutate(data);
  };
  
  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('screenshot', file);
    }
  };
  
  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-center">Report a Bug</h2>
        <p className="text-sm text-muted-foreground text-center">
          Help us improve Pickle+ by reporting any issues you encounter.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of the issue" 
                    {...field} 
                    disabled={submitMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please describe the issue in detail" 
                    rows={4}
                    {...field} 
                    disabled={submitMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Severity */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={submitMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Steps to Reproduce */}
          <FormField
            control={form.control}
            name="stepsToReproduce"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steps to Reproduce</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What steps can we take to reproduce this issue?" 
                    rows={3}
                    {...field} 
                    disabled={submitMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Is Reproducible */}
          <FormField
            control={form.control}
            name="isReproducible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Reproducible Issue</FormLabel>
                  <FormDescription>Can this issue be consistently reproduced?</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={submitMutation.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Include User Info */}
          <FormField
            control={form.control}
            name="includeUserInfo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Include User Info</FormLabel>
                  <FormDescription>
                    Include your user ID and browser information to help us diagnose the issue.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={submitMutation.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Screenshot Upload */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <FormLabel htmlFor="screenshot">Screenshot (optional)</FormLabel>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitMutation.isPending}
            />
            <FormDescription>
              Upload a screenshot to help us understand the issue.
            </FormDescription>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Bug Report'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}