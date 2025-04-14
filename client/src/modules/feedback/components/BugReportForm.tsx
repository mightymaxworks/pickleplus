/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Form Component
 * 
 * This component renders the form for submitting bug reports.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Bug, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { BugReportFormProps, BugReportFormData } from '../types';
import { submitBugReport, getBrowserInfo } from '../api/feedbackApi';

// Form validation schema
const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  url: z.string(),
  isReproducible: z.boolean().default(false),
  includeUserInfo: z.boolean().default(true),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
});

/**
 * Bug report form component
 */
export function BugReportForm({ currentPage, onSubmitSuccess, onCancel }: BugReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'medium',
      url: currentPage,
      isReproducible: false,
      includeUserInfo: true,
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
    },
  });
  
  /**
   * Handle form submission
   */
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Add browser info if user consented
      const formData: BugReportFormData = {
        ...data,
        browserInfo: data.includeUserInfo ? getBrowserInfo() : undefined
      };
      
      const response = await submitBugReport(formData);
      
      if (response.success) {
        setSubmitSuccess(true);
        toast({
          title: "Bug Report Submitted",
          description: "Thank you for helping us improve Pickle+!",
          variant: "default",
        });
        
        // Reset form and close dialog after a short delay
        setTimeout(() => {
          onSubmitSuccess();
          form.reset();
          setSubmitSuccess(false);
        }, 2000);
      } else {
        toast({
          title: "Submission Failed",
          description: response.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-center">Bug Report Submitted</h2>
        <p className="text-center text-muted-foreground">
          Thank you for helping us improve Pickle+. Our team will review your report.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Report a Bug
        </DialogTitle>
        <DialogDescription>
          Help us improve by reporting any issues you encounter with the platform.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of the issue" {...field} />
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
                  <Textarea 
                    placeholder="Detailed description of what happened" 
                    className="h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Current page path</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isReproducible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Reproducible</FormLabel>
                    <FormDescription>
                      Can you reproduce the issue consistently?
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
              name="includeUserInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Include System Info</FormLabel>
                    <FormDescription>
                      Share browser and OS details
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
          
          {form.watch('isReproducible') && (
            <div className="space-y-4 border p-4 rounded-lg">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Additional Details</AlertTitle>
                <AlertDescription>
                  Please provide detailed steps to help us reproduce and fix the issue.
                </AlertDescription>
              </Alert>
              
              <FormField
                control={form.control}
                name="stepsToReproduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steps to Reproduce</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="1. Go to...\n2. Click on...\n3. Notice that..." 
                        className="h-20"
                        {...field} 
                      />
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
                      <FormLabel>Expected Behavior</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What should have happened?" 
                          className="h-20"
                          {...field} 
                        />
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
                      <FormLabel>Actual Behavior</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What actually happened?" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}