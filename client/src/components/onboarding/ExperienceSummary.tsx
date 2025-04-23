/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Experience Summary Component
 * 
 * This component collects information about the user's pickleball experience
 * as part of the onboarding process.
 */

import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Clock, Check, RefreshCw, Award, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Schema for experience form validation
const experienceFormSchema = z.object({
  yearsPlaying: z.string().min(1, 'Please select how long you\'ve been playing'),
  playFrequency: z.string().min(1, 'Please select how often you play'),
  tournamentExperience: z.string().min(1, 'Please select your tournament experience'),
  preferredFormat: z.string().min(1, 'Please select your preferred format'),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  additionalInfo: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

// Options for the form fields
const YEARS_PLAYING_OPTIONS = [
  { value: 'less_than_6_months', label: 'Less than 6 months' },
  { value: '6_months_to_1_year', label: '6 months to 1 year' },
  { value: '1_to_2_years', label: '1 to 2 years' },
  { value: '2_to_5_years', label: '2 to 5 years' },
  { value: 'more_than_5_years', label: 'More than 5 years' },
];

const PLAY_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'several_times_a_week', label: 'Several times a week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasionally', label: 'Occasionally' },
];

const TOURNAMENT_EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'local_recreational', label: 'Local/recreational tournaments' },
  { value: 'regional', label: 'Regional tournaments' },
  { value: 'national', label: 'National tournaments' },
  { value: 'professional', label: 'Professional tournaments' },
];

const FORMAT_OPTIONS = [
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Doubles' },
  { value: 'mixed_doubles', label: 'Mixed Doubles' },
  { value: 'no_preference', label: 'No preference' },
];

const GOAL_OPTIONS = [
  { value: 'improve_skills', label: 'Improve my skills' },
  { value: 'have_fun', label: 'Have fun and socialize' },
  { value: 'get_fit', label: 'Get fit and stay active' },
  { value: 'compete', label: 'Compete in tournaments' },
  { value: 'rank_up', label: 'Increase my rating/ranking' },
  { value: 'play_professionally', label: 'Play professionally' },
];

interface ExperienceSummaryProps {
  onComplete?: (data: ExperienceFormValues) => void;
}

export default function ExperienceSummary({ onComplete }: ExperienceSummaryProps) {
  const { toast } = useToast();

  // Set up form with default values
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      yearsPlaying: '',
      playFrequency: '',
      tournamentExperience: '',
      preferredFormat: '',
      goals: [],
      additionalInfo: '',
    },
  });

  // Mutation to submit the experience data using frontend-driven approach
  const submitExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      // Create the experience data
      const experienceData = {
        yearsPlaying: data.yearsPlaying,
        playFrequency: data.playFrequency,
        tournamentExperience: data.tournamentExperience,
        preferredFormat: data.preferredFormat,
        goals: data.goals,
        additionalInfo: data.additionalInfo || ''
      };
      
      console.log('[ExperienceSummary] Saving experience data with frontend-driven approach');
      
      // Update wizard state to mark this step as completed
      const wizardState = {
        currentStep: 'play_style_assessment', // Next step in the flow
        completedSteps: ['profile_completion', 'rating_selection', 'experience_summary'],
        progress: 70, // 70% progress in onboarding
        lastUpdated: new Date().toISOString()
      };
      
      // Store the experience data first
      const experienceResponse = await apiRequest('POST', '/api/user-data/store', {
        dataType: 'experienceData',
        data: experienceData
      });
      
      if (!experienceResponse.ok) {
        const errorData = await experienceResponse.json();
        throw new Error(errorData.error || 'Failed to save experience data');
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
        title: "Experience information saved",
        description: "Your pickleball experience has been recorded.",
      });
      console.log('[ExperienceSummary] Data saved successfully:', data);
      
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
  function onSubmit(data: ExperienceFormValues) {
    submitExperienceMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tell us about your pickleball journey</h3>
        <p className="text-muted-foreground">
          Share your experience to help us personalize your CourtIQ™ profile and 
          provide more accurate match recommendations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="yearsPlaying"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    How long have you been playing?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YEARS_PLAYING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    How often do you play?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLAY_FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tournamentExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Tournament Experience
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOURNAMENT_EXPERIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="goals"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>What are your goals with pickleball?</FormLabel>
                  <FormDescription>
                    Select all that apply to you.
                  </FormDescription>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="goals"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, option.value])
                                    : field.onChange(
                                        currentValues.filter(
                                          (value) => value !== option.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anything else you'd like to share?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share any additional information about your pickleball experience..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Tell us about your background, previous sports experience, or specific areas you want to improve.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isValid || submitExperienceMutation.isPending}
            >
              {submitExperienceMutation.isPending ? (
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
    </div>
  );
}