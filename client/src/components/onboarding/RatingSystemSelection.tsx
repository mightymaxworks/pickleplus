/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Rating System Selection Component
 * 
 * This component allows users to select their preferred rating system
 * and enter their current rating during the onboarding process.
 */

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
}).refine(data => {
  // If rating system is 'self', require selfAssessment to be set
  if (data.ratingSystem === 'self') {
    return !!data.selfAssessment;
  }
  
  // For all other rating systems, require ratingValue to be set
  if (data.ratingSystem && data.ratingSystem !== 'self') {
    return data.ratingValue !== undefined;
  }
  
  return true;
}, {
  message: "Please complete your rating information",
  path: ["ratingValue"]
});

type RatingFormValues = z.infer<typeof ratingFormSchema>;

interface RatingSystemSelectionProps {
  onComplete?: () => void;
}

export default function RatingSystemSelection({ onComplete }: RatingSystemSelectionProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Query to get user data
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['/api/user-data/get'],
    queryFn: async () => {
      try {
        console.log('[RatingSystemSelection] Fetching user data');
        const response = await fetch('/api/user-data/get', { 
          credentials: 'include' 
        });
        
        if (!response.ok) {
          console.error('[RatingSystemSelection] Error fetching user data:', response.status);
          if (response.status === 404) {
            // If the data doesn't exist yet, return an empty data structure
            return { success: true, data: { ratingData: { system: '', rating: 0 } } };
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        console.log('[RatingSystemSelection] User data received:', data);
        return data;
      } catch (error) {
        console.error('[RatingSystemSelection] Error in data fetch:', error);
        // Return empty data structure on error to avoid breaking the component
        return { success: true, data: { ratingData: { system: '', rating: 0 } } };
      }
    },
    staleTime: 30000, // Data stays fresh for 30 seconds
    retry: 1, // Only retry once
  });

  // Set up form with default values
  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      ratingSystem: '',
      ratingValue: undefined,
      selfAssessment: undefined,
    },
  });
  
  // When user data is loaded, pre-fill the form
  useEffect(() => {
    if (userData?.data?.ratingData) {
      const { system, rating } = userData.data.ratingData;
      
      console.log('[RatingSystemSelection] Pre-filling form with:', system, rating);
      
      if (system) {
        setSelectedSystem(system);
        form.setValue('ratingSystem', system);
        
        // For self-assessment, we need to map back to the appropriate option
        if (system === 'self') {
          const selfAssessment = 
            rating <= 1.5 ? 'beginner' :
            rating <= 3.5 ? 'intermediate' :
            rating <= 5.0 ? 'advanced' : 'pro';
          
          form.setValue('selfAssessment', selfAssessment);
        } else if (rating) {
          form.setValue('ratingValue', rating);
        }
      }
    }
  }, [userData, form]);

  // Mutation to submit the rating using the frontend-driven approach
  const submitRatingMutation = useMutation({
    mutationFn: async (data: RatingFormValues) => {
      // Map the form values to our rating data format
      const ratingData = {
        system: data.ratingSystem,
        rating: data.ratingValue || (
          // Default values for self-assessment options
          data.selfAssessment === 'beginner' ? 1.0 :
          data.selfAssessment === 'intermediate' ? 2.5 :
          data.selfAssessment === 'advanced' ? 4.0 :
          data.selfAssessment === 'pro' ? 5.5 : 2.0
        )
      };
      
      // Also update wizard state to mark this step as completed
      const wizardState = {
        currentStep: 'experience_summary', // Next step in the flow
        completedSteps: ['profile_completion', 'rating_selection'],
        progress: 40, // 40% progress in onboarding
        lastUpdated: new Date().toISOString()
      };
      
      console.log('[RatingSystemSelection] Saving data with frontend-driven approach');
      
      // Store the rating data first
      const ratingResponse = await apiRequest('POST', '/api/user-data/store', {
        dataType: 'ratingData',
        data: ratingData
      });
      
      if (!ratingResponse.ok) {
        const errorData = await ratingResponse.json();
        throw new Error(errorData.error || 'Failed to save rating data');
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
      
      // Return the final state from the wizard update
      return wizardResponse.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rating saved",
        description: "Your preferred rating system has been saved.",
      });
      console.log('[RatingSystemSelection] Data saved successfully:', data);
      
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

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your rating data...</p>
      </div>
    );
  }

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