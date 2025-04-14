/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Form Component
 * 
 * This component provides a form for users to submit bug reports.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { submitBugReport } from '../api/feedbackApi';
import { BugReportFormData, BugReportSeverity } from '../types';

/**
 * Form validation schema for bug reports
 */
const bugReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  url: z.string()
});

/**
 * Props for the bug report form component
 */
interface BugReportFormProps {
  /** The current page URL where the form is being displayed */
  currentPage: string;
  
  /** Callback called after successful form submission */
  onSubmitSuccess?: () => void;
  
  /** Callback called when the form is closed without submission */
  onCancel?: () => void;
}

/**
 * Bug report form component
 */
export function BugReportForm({ currentPage, onSubmitSuccess, onCancel }: BugReportFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with validation
  const form = useForm<z.infer<typeof bugReportSchema>>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'medium' as BugReportSeverity,
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      url: currentPage
    }
  });
  
  // Set up mutation for form submission
  const mutation = useMutation({
    mutationFn: (data: BugReportFormData) => {
      // Add browser and OS info
      const enhancedData: BugReportFormData = {
        ...data,
        browser: navigator.userAgent,
        os: navigator.platform
      };
      
      return submitBugReport(enhancedData);
    },
    onSuccess: () => {
      toast({
        title: 'Bug Report Submitted',
        description: 'Thank you for helping improve Pickle+!',
      });
      form.reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: () => {
      toast({
        title: 'Error Submitting Report',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });
  
  /**
   * Submit the form
   */
  const onSubmit = (data: z.infer<typeof bugReportSchema>) => {
    setIsSubmitting(true);
    mutation.mutate(data as BugReportFormData);
    setIsSubmitting(false);
  };
  
  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    form.reset();
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="relative pb-2">
        <CardTitle className="text-xl font-semibold">Report a Bug</CardTitle>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 absolute top-4 right-4"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed description of the issue" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      value={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">Low</FormLabel>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">Medium</FormLabel>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">High</FormLabel>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="critical" />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">Critical</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steps to Reproduce (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="1. Go to...\n2. Click on..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Behavior (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What should happen" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="actualBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Behavior (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What actually happened" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-2">
              <div className="flex justify-end w-full space-x-2">
                {onCancel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}