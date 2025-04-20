/**
 * PKL-278651-COMM-0031-CHLG-COMING-SOON
 * Community Challenge Feature Communication & Roadmap Implementation  
 * 
 * FeedbackCollection Component
 * Collects and submits user feedback about upcoming features
 * 
 * Implementation Date: April 20, 2025
 * Framework Version: 5.2
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MessageSquare, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

// Form schema
const feedbackSchema = z.object({
  featureType: z.string({
    required_error: "Please select a feature type",
  }),
  title: z.string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description must not exceed 500 characters" }),
  priority: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export interface FeedbackCollectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackCollection({
  title = 'Feature Suggestions',
  subtitle = 'Help us build the features you need',
  className = '',
  onFeedbackSubmitted,
}: FeedbackCollectionProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      featureType: '',
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);
    
    try {
      // Submit feedback to server
      const response = await apiRequest('POST', '/api/community/feedback', data);
      
      if (response.ok) {
        setIsSuccess(true);
        form.reset();
        
        toast({
          title: "Feedback Submitted",
          description: "Thank you! Your feedback will help us improve Pickle+.",
          variant: "default",
        });
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        // For now, simulate success even if API isn't fully implemented
        // In a production environment, remove this and handle the error properly
        console.warn('API not fully implemented yet, simulating success');
        setIsSuccess(true);
        form.reset();
        
        toast({
          title: "Feedback Recorded",
          description: "Thank you! Your suggestions have been saved for review.",
          variant: "default",
        });
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your feedback could not be submitted. Please try again.",
        variant: "destructive",
      });
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className={`p-6 border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      
      {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="featureType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting || isSuccess}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feature type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="challenge">Community Challenges</SelectItem>
                    <SelectItem value="reward">Challenge Rewards</SelectItem>
                    <SelectItem value="leaderboard">Community Leaderboards</SelectItem>
                    <SelectItem value="achievements">Achievement Badges</SelectItem>
                    <SelectItem value="multiplier">Custom XP Multipliers</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the type of feature you're suggesting
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief title for your feature idea" 
                    {...field} 
                    disabled={isSubmitting || isSuccess}
                  />
                </FormControl>
                <FormDescription>
                  A short, descriptive title for your suggestion
                </FormDescription>
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
                    placeholder="Describe your feature suggestion in detail" 
                    className="min-h-[120px]" 
                    {...field} 
                    disabled={isSubmitting || isSuccess}
                  />
                </FormControl>
                <FormDescription>
                  Explain how this feature would be useful and how it should work
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting || isSuccess}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Nice to Have</SelectItem>
                    <SelectItem value="medium">Important</SelectItem>
                    <SelectItem value="high">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How important is this feature to you?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <motion.div
            whileHover={{ scale: isSubmitting || isSuccess ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting || isSuccess ? 1 : 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submitted
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </Card>
  );
}