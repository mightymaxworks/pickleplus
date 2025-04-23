/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Play Style Assessment Component
 * 
 * This component allows users to self-assess their play style and preferences
 * as part of the onboarding process.
 */

import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, RefreshCw, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Schema for play style form validation
const playStyleFormSchema = z.object({
  aggressiveness: z.string({
    required_error: "Please select your play style aggressiveness",
  }),
  courtPosition: z.string({
    required_error: "Please select your preferred court position",
  }),
  shotPreference: z.string({
    required_error: "Please select your shot preference",
  }),
  gameSpeed: z.string({
    required_error: "Please select your preferred game speed",
  }),
  learningStyle: z.string({
    required_error: "Please select your learning style",
  }),
});

type PlayStyleFormValues = z.infer<typeof playStyleFormSchema>;

interface PlayStyleAssessmentProps {
  onComplete?: (data: PlayStyleFormValues) => void;
}

export default function PlayStyleAssessment({ onComplete }: PlayStyleAssessmentProps) {
  const { toast } = useToast();

  // Set up form with default values
  const form = useForm<PlayStyleFormValues>({
    resolver: zodResolver(playStyleFormSchema),
    defaultValues: {
      aggressiveness: '',
      courtPosition: '',
      shotPreference: '',
      gameSpeed: '',
      learningStyle: '',
    },
  });

  // Mutation to submit the play style data using frontend-driven approach
  const submitPlayStyleMutation = useMutation({
    mutationFn: async (data: PlayStyleFormValues) => {
      // Create the play style data
      const playStyleData = {
        aggressiveness: data.aggressiveness,
        courtPosition: data.courtPosition,
        shotPreference: data.shotPreference,
        gameSpeed: data.gameSpeed,
        learningStyle: data.learningStyle
      };
      
      console.log('[PlayStyleAssessment] Saving play style data with frontend-driven approach');
      
      // Update wizard state to mark this step as completed
      const wizardState = {
        currentStep: 'completed', // Final step - we're done!
        completedSteps: ['profile_completion', 'rating_selection', 'experience_summary', 'play_style_assessment'],
        progress: 100, // 100% progress in onboarding
        lastUpdated: new Date().toISOString()
      };
      
      // Store the play style data first
      const playStyleResponse = await apiRequest('POST', '/api/user-data/store', {
        dataType: 'playStyleData',
        data: playStyleData
      });
      
      if (!playStyleResponse.ok) {
        const errorData = await playStyleResponse.json();
        throw new Error(errorData.error || 'Failed to save play style data');
      }
      
      // Then update the wizard state
      const wizardResponse = await apiRequest('POST', '/api/user-data/store', {
        dataType: 'wizardState',
        data: wizardState
      });
      
      if (!wizardResponse.ok) {
        const errorData = await wizardResponse.json();
        throw new Error(errorData.error || 'Failed to update wizard state');
      }
      
      // Return the final state
      return wizardResponse.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Play style saved",
        description: "Your play style preferences have been recorded.",
      });
      console.log('[PlayStyleAssessment] Data saved successfully:', data);
      
      if (onComplete) {
        onComplete(variables);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: PlayStyleFormValues) {
    submitPlayStyleMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Assess Your Play Style</h3>
        <p className="text-muted-foreground">
          Help us understand your playing preferences to provide tailored recommendations
          and match you with compatible partners and opponents.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="aggressiveness"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Play Style Aggressiveness
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">How aggressive or defensive you tend to play in games.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="very_defensive" />
                      </FormControl>
                      <FormLabel className="font-normal">Very Defensive - I focus on returning shots safely</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="somewhat_defensive" />
                      </FormControl>
                      <FormLabel className="font-normal">Somewhat Defensive - I wait for good opportunities</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="balanced" />
                      </FormControl>
                      <FormLabel className="font-normal">Balanced - I adapt based on the situation</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="somewhat_aggressive" />
                      </FormControl>
                      <FormLabel className="font-normal">Somewhat Aggressive - I look to take initiative</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="very_aggressive" />
                      </FormControl>
                      <FormLabel className="font-normal">Very Aggressive - I attack whenever possible</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courtPosition"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Preferred Court Position
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Where you feel most comfortable positioning yourself during play.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="baseline" />
                      </FormControl>
                      <FormLabel className="font-normal">Baseline - I prefer playing from the back</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="mid_court" />
                      </FormControl>
                      <FormLabel className="font-normal">Mid-Court - I like to control the transition zone</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="kitchen_line" />
                      </FormControl>
                      <FormLabel className="font-normal">Kitchen Line - I prefer playing at the net</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="all_court" />
                      </FormControl>
                      <FormLabel className="font-normal">All-Court - I move throughout the court based on play</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shotPreference"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Shot Preference
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">The types of shots you prefer to use or are most confident with.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="dinks_drops" />
                      </FormControl>
                      <FormLabel className="font-normal">Dinks & Drops - I excel at soft, controlled shots</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="drives_passing_shots" />
                      </FormControl>
                      <FormLabel className="font-normal">Drives & Passing Shots - I prefer powerful, direct shots</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="lobs_third_shots" />
                      </FormControl>
                      <FormLabel className="font-normal">Lobs & Third Shots - I like strategic placement shots</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="volleys_put_aways" />
                      </FormControl>
                      <FormLabel className="font-normal">Volleys & Put-aways - I excel at finishing points at the net</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="balanced_approach" />
                      </FormControl>
                      <FormLabel className="font-normal">Balanced Approach - I use a mix of shots based on situation</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gameSpeed"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Preferred Game Speed
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">The pace at which you prefer to play the game.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="slow_strategic" />
                      </FormControl>
                      <FormLabel className="font-normal">Slow & Strategic - I prefer a methodical, patient game</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="moderate_balanced" />
                      </FormControl>
                      <FormLabel className="font-normal">Moderate & Balanced - I enjoy a mix of paces</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fast_dynamic" />
                      </FormControl>
                      <FormLabel className="font-normal">Fast & Dynamic - I thrive in quick exchanges</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="adaptive" />
                      </FormControl>
                      <FormLabel className="font-normal">Adaptive - I adjust my pace based on opponents and strategy</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="learningStyle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  Learning Style
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">How you prefer to learn and improve your pickleball skills.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="visual_learner" />
                      </FormControl>
                      <FormLabel className="font-normal">Visual Learner - I learn best by watching videos and demonstrations</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="practice_oriented" />
                      </FormControl>
                      <FormLabel className="font-normal">Practice-Oriented - I improve through drills and repetition</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="game_experience" />
                      </FormControl>
                      <FormLabel className="font-normal">Game Experience - I learn best by playing lots of matches</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="coached_instruction" />
                      </FormControl>
                      <FormLabel className="font-normal">Coached Instruction - I value personalized feedback and lessons</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="analytical" />
                      </FormControl>
                      <FormLabel className="font-normal">Analytical - I like to understand theory and strategy</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isValid || submitPlayStyleMutation.isPending}
            >
              {submitPlayStyleMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save & Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Why does play style matter?</h4>
          <p className="text-sm text-muted-foreground">
            Your play style helps us recommend compatible partners and opponents,
            personalize training suggestions, and provide insights on your strengths 
            and areas for improvement. This information helps the CourtIQ™ system 
            develop a more holistic understanding of your game.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}