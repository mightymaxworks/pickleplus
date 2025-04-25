/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback Form Component
 * 
 * This component provides a form for submitting detailed feedback on drills,
 * training plans, and other content in the SAGE system.
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFeedback, FeedbackSubmission } from "@/hooks/use-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Star } from "lucide-react";

// Validation schema for the feedback form
const feedbackFormSchema = z.object({
  overallRating: z.coerce.number().min(1, "Please select a rating").max(5),
  clarityRating: z.coerce.number().min(1, "Please select a rating").max(5).optional(),
  difficultyRating: z.coerce.number().min(1, "Please select a rating").max(5).optional(),
  enjoymentRating: z.coerce.number().min(1, "Please select a rating").max(5).optional(),
  effectivenessRating: z.coerce.number().min(1, "Please select a rating").max(5).optional(),
  positiveFeedback: z.string().optional(),
  improvementFeedback: z.string().optional(),
  specificChallenges: z.string().optional(),
  suggestions: z.string().optional(),
}).refine(
  (data) => 
    data.positiveFeedback || 
    data.improvementFeedback || 
    data.specificChallenges || 
    data.suggestions,
  {
    message: "Please provide at least one comment",
    path: ["positiveFeedback"],
  }
);

type FeedbackFormProps = {
  itemType: 'drill' | 'training_plan' | 'sage_conversation' | 'video';
  itemId: number;
  itemName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  includeContext?: boolean;
};

export function FeedbackForm({ 
  itemType, 
  itemId, 
  itemName,
  onSuccess,
  onCancel,
  includeContext = false
}: FeedbackFormProps) {
  const { submitFeedback } = useFeedback();
  const [showExtendedRatings, setShowExtendedRatings] = useState(false);
  
  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      overallRating: undefined,
      clarityRating: undefined,
      difficultyRating: undefined,
      enjoymentRating: undefined,
      effectivenessRating: undefined,
      positiveFeedback: "",
      improvementFeedback: "",
      specificChallenges: "",
      suggestions: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    // Prepare feedback submission data
    const feedbackData: FeedbackSubmission = {
      itemType,
      itemId,
      ...values
    };
    
    // Include context data if needed (user skill level, CourtIQ scores, etc.)
    if (includeContext) {
      // In a real implementation, we would grab this from the user's context
      // This is just a placeholder - actual data would come from user state
      feedbackData.userSkillLevel = "intermediate"; 
      feedbackData.courtIqScores = {
        "TECH": 3.5,
        "TACT": 4.0,
        "PHYS": 3.0,
        "MENT": 3.5,
        "CONS": 3.0
      };
      feedbackData.completionStatus = "completed";
      feedbackData.attemptCount = 1;
      
      // Calculate time spent if this information is available from a drill or training session
      // feedbackData.timeSpent = 300; // 5 minutes in seconds
    }
    
    await submitFeedback.mutateAsync(feedbackData);
    
    if (onSuccess) {
      onSuccess();
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve {itemName} by sharing your thoughts and experience
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating (Required) */}
            <FormField
              control={form.control}
              name="overallRating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Overall Rating</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onChange={field.onChange}
                      max={5}
                    />
                  </FormControl>
                  <FormDescription>
                    How would you rate your overall experience?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!showExtendedRatings && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExtendedRatings(true)}
                className="w-full mt-2"
              >
                Show Detailed Ratings
              </Button>
            )}
            
            {showExtendedRatings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clarity Rating */}
                <FormField
                  control={form.control}
                  name="clarityRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center">
                        <FormLabel className="text-base mr-2">Clarity</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How clear were the instructions and explanations?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <StarRating
                          rating={field.value}
                          onChange={field.onChange}
                          max={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Difficulty Rating */}
                <FormField
                  control={form.control}
                  name="difficultyRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center">
                        <FormLabel className="text-base mr-2">Difficulty</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Was the difficulty level appropriate for you?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <StarRating
                          rating={field.value}
                          onChange={field.onChange}
                          max={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Enjoyment Rating */}
                <FormField
                  control={form.control}
                  name="enjoymentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center">
                        <FormLabel className="text-base mr-2">Enjoyment</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How enjoyable was this for you?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <StarRating
                          rating={field.value}
                          onChange={field.onChange}
                          max={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Effectiveness Rating */}
                <FormField
                  control={form.control}
                  name="effectivenessRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center">
                        <FormLabel className="text-base mr-2">Effectiveness</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How effective was this for improving your skills?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <StarRating
                          rating={field.value}
                          onChange={field.onChange}
                          max={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Please provide at least one comment to help us understand your experience.
              </p>
              
              {/* Positive Feedback */}
              <FormField
                control={form.control}
                name="positiveFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What did you like about this {itemType.replace('_', ' ')}?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what worked well for you..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Improvement Feedback */}
              <FormField
                control={form.control}
                name="improvementFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What could be improved?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share suggestions for improving this content..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Specific Challenges */}
              <FormField
                control={form.control}
                name="specificChallenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Did you encounter any specific challenges?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any difficulties or challenges you faced..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Suggestions */}
              <FormField
                control={form.control}
                name="suggestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any other suggestions or ideas?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share any other thoughts, ideas or suggestions..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={submitFeedback.isPending}
        >
          {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Star rating component
interface StarRatingProps {
  rating?: number;
  onChange: (rating: number) => void;
  max: number;
}

function StarRating({ rating = 0, onChange, max }: StarRatingProps) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = rating >= starValue;
        
        return (
          <button
            key={`star-${i}`}
            type="button"
            onClick={() => onChange(starValue)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                filled ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}