/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Rating System Selection Component
 * 
 * This component allows users to select their preferred rating system
 * and enter their current rating during the onboarding process.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { 
  Check, 
  HelpCircle, 
  RefreshCw 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define the rating systems with their ranges and descriptions
const RATING_SYSTEMS = [
  {
    id: 'dupr',
    name: 'DUPR',
    range: '2.0-7.0',
    description: 'Dynamic Universal Pickleball Rating - the official global rating system for pickleball.',
    min: 2.0,
    max: 7.0,
    step: 0.1,
  },
  {
    id: 'ifp',
    name: 'IFP',
    range: '1.0-5.0',
    description: 'International Federation of Pickleball rating system used in international competitions.',
    min: 1.0,
    max: 5.0,
    step: 0.5,
  },
  {
    id: 'utpr',
    name: 'UTPR',
    range: '2.5-6.0',
    description: 'USA Pickleball Tournament Player Rating, used in USA Pickleball sanctioned tournaments.',
    min: 2.5,
    max: 6.0,
    step: 0.5,
  },
  {
    id: 'wpr',
    name: 'WPR',
    range: '0-10.0',
    description: 'World Pickleball Rating system used by various clubs and organizations.',
    min: 0.0,
    max: 10.0,
    step: 0.5,
  },
  {
    id: 'iptpa',
    name: 'IPTPA',
    range: '1.0-5.0',
    description: 'International Pickleball Teaching Professional Association certification levels.',
    min: 1.0,
    max: 5.0,
    step: 0.5,
  },
  {
    id: 'self',
    name: 'Self-Assessment',
    range: 'Beginner-Advanced',
    description: 'Your own assessment of your skill level.',
    min: 0,
    max: 0,
    step: 0,
  }
];

// Rating schema for validation
const ratingFormSchema = z.object({
  ratingSystem: z.string().nonempty('Please select a rating system'),
  ratingValue: z.union([
    z.number().min(0).optional(),
    z.string().min(1, 'Please enter your rating').optional(),
  ]),
  selfAssessment: z.string().optional(),
});

type RatingFormValues = z.infer<typeof ratingFormSchema>;

interface RatingSystemSelectionProps {
  onComplete?: () => void;
}

export default function RatingSystemSelection({ onComplete }: RatingSystemSelectionProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const { toast } = useToast();

  // Set up form with default values
  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      ratingSystem: '',
      ratingValue: undefined,
      selfAssessment: undefined,
    },
  });

  // Mutation to submit the rating
  const submitRatingMutation = useMutation({
    mutationFn: async (data: RatingFormValues) => {
      const response = await apiRequest('POST', '/api/courtiq/rating/set-preferred', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set rating');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rating saved",
        description: "Your preferred rating system has been saved.",
      });
      // Log to help with debugging
      console.log('[RatingSystemSelection] Rating saved successfully:', data);
      
      // Pass the selected rating data to parent component
      if (onComplete) {
        // Calling onComplete without arguments will trigger the parent's handler
        // which will progress to the next step in the wizard
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: RatingFormValues) {
    submitRatingMutation.mutate(data);
  }

  // Get selected rating system details
  const getSelectedSystemDetails = () => {
    return RATING_SYSTEMS.find(system => system.id === selectedSystem);
  };

  // Handle rating system selection change
  const handleRatingSystemChange = (value: string) => {
    setSelectedSystem(value);
    form.setValue('ratingSystem', value);
    form.setValue('ratingValue', undefined);
    form.setValue('selfAssessment', undefined);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Let's set up your CourtIQ™ profile</h3>
        <p className="text-muted-foreground">
          Select your preferred rating system and provide your current rating.
          This helps us personalize your experience and provide accurate match recommendations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ratingSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating System</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRatingSystemChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred rating system" />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_SYSTEMS.map((system) => (
                        <SelectItem key={system.id} value={system.id}>
                          <span className="font-medium">{system.name}</span>
                          <span className="text-muted-foreground ml-2">({system.range})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is the rating system you're most familiar with. We'll convert it to our CourtIQ™ system.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedSystem && selectedSystem !== 'self' && (
            <FormField
              control={form.control}
              name="ratingValue"
              render={({ field }) => {
                const system = getSelectedSystemDetails();
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Your {system?.name} Rating
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{system?.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {system && (
                          <div className="space-y-2">
                            <Slider
                              min={system.min}
                              max={system.max}
                              step={system.step}
                              value={[field.value as number || system.min]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Beginner ({system.min})</span>
                              <span>Advanced ({system.max})</span>
                            </div>
                            <div className="mt-2 text-center font-bold text-lg">
                              {field.value || system.min}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select your current rating in the {system?.name} system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

          {selectedSystem === 'self' && (
            <FormField
              control={form.control}
              name="selfAssessment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How would you describe your skill level?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="beginner" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Beginner - I'm just starting to learn the game
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="intermediate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Intermediate - I know the rules and have some experience
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="advanced" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Advanced - I've played competitively and have strong skills
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="pro" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Professional - I compete at tournaments regularly
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedSystem && (
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={!form.formState.isValid || submitRatingMutation.isPending}
              >
                {submitRatingMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Rating
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <div className="mt-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">What is CourtIQ™?</h4>
            <p className="text-sm text-muted-foreground">
              CourtIQ™ is Pickle+'s proprietary rating system that provides a 
              comprehensive assessment of your pickleball skills across five dimensions:
              Technical Skills, Tactical Awareness, Physical Fitness, Mental Toughness,
              and Consistency. Based on your play, CourtIQ™ will evolve to give you a 
              more accurate picture of your abilities and help you improve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}