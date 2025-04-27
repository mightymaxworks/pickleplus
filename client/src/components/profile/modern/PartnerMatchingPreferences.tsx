/**
 * PKL-278651-PROF-0027-PREFS - Partner Matching Preferences
 * 
 * This component allows users to set their partner preferences
 * for finding compatible pickleball partners.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { 
  Users,
  UserRoundCheck,
  UserPlus,
  UserCog,
  Info
} from "lucide-react";
import { 
  type PartnerPreferences, 
  type CourtIQDimension,
  DEFAULT_PARTNER_PREFERENCES,
  updatePartnerPreferences,
  getPartnerPreferences
} from "@/services/PartnerMatchingService";
import { useToast } from "@/hooks/use-toast";

// Define form schema using zod
const partnerPreferencesSchema = z.object({
  skillMatchPreference: z.enum(['similar', 'stronger', 'any']),
  playstylePreference: z.enum(['complementary', 'similar', 'any']),
  positionPreference: z.enum(['right', 'left', 'both', 'any']),
  frequencyPreference: z.enum(['daily', 'several_times_week', 'weekly', 'biweekly', 'monthly', 'occasionally', 'any']),
  ageGroupPreference: z.enum(['similar', 'any']),
  prioritizedDimensions: z.array(
    z.enum(['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'])
  ).min(0).max(5)
});

// Component props
interface PartnerMatchingPreferencesProps {
  userId: number;
  className?: string;
  onSaved?: () => void;
}

// Dimension display information
const DIMENSIONS: Record<CourtIQDimension, { label: string, description: string }> = {
  'TECH': { 
    label: 'Technical Skills', 
    description: 'Stroke mechanics, footwork, and technical execution'
  },
  'TACT': { 
    label: 'Tactical Awareness', 
    description: 'Court awareness, shot selection, and strategy'
  },
  'PHYS': { 
    label: 'Physical Fitness', 
    description: 'Agility, speed, endurance, and athletic capability'
  },
  'MENT': { 
    label: 'Mental Toughness', 
    description: 'Focus, resilience, and pressure handling'
  },
  'CONS': { 
    label: 'Consistency', 
    description: 'Reliable performance and error minimization'
  }
};

export default function PartnerMatchingPreferences({
  userId,
  className = "",
  onSaved
}: PartnerMatchingPreferencesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Set up form with zod validation
  const form = useForm<z.infer<typeof partnerPreferencesSchema>>({
    resolver: zodResolver(partnerPreferencesSchema),
    defaultValues: DEFAULT_PARTNER_PREFERENCES
  });
  
  // Load existing preferences
  useEffect(() => {
    async function loadPreferences() {
      setIsLoading(true);
      const preferences = await getPartnerPreferences(userId);
      
      if (preferences) {
        form.reset(preferences);
      }
      
      setIsLoading(false);
    }
    
    loadPreferences();
  }, [userId, form]);
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof partnerPreferencesSchema>) => {
    setIsLoading(true);
    
    const success = await updatePartnerPreferences(userId, values);
    
    if (success) {
      toast({
        title: "Preferences saved",
        description: "Your partner matching preferences have been updated.",
      });
      
      if (onSaved) onSaved();
    } else {
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Partner Preferences</CardTitle>
          <UserCog className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Set your preferences for finding pickleball partners</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Skill match preference */}
            <FormField
              control={form.control}
              name="skillMatchPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Level Preference</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="similar" id="similar-skill" />
                        <label htmlFor="similar-skill" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Similar skill level
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stronger" id="stronger-skill" />
                        <label htmlFor="stronger-skill" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Prefer stronger players
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="any-skill" />
                        <label htmlFor="any-skill" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Any skill level
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Playstyle preference */}
            <FormField
              control={form.control}
              name="playstylePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Play Style Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a play style preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="complementary">Complementary styles</SelectItem>
                      <SelectItem value="similar">Similar styles</SelectItem>
                      <SelectItem value="any">Any style</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Complementary styles often work well together, like aggressive + defensive players
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Position preference */}
            <FormField
              control={form.control}
              name="positionPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Position Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="right">Right side players</SelectItem>
                      <SelectItem value="left">Left side players</SelectItem>
                      <SelectItem value="both">Players who play both sides</SelectItem>
                      <SelectItem value="any">Any position</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Frequency preference */}
            <FormField
              control={form.control}
              name="frequencyPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playing Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a playing frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily players</SelectItem>
                      <SelectItem value="several_times_week">Several times a week</SelectItem>
                      <SelectItem value="weekly">Weekly players</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly players</SelectItem>
                      <SelectItem value="monthly">Monthly players</SelectItem>
                      <SelectItem value="occasionally">Occasional players</SelectItem>
                      <SelectItem value="any">Any frequency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Age group preference */}
            <FormField
              control={form.control}
              name="ageGroupPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group Preference</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="similar" id="similar-age" />
                      <label htmlFor="similar-age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Similar age group (±10 years)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any" id="any-age" />
                      <label htmlFor="any-age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Any age group
                      </label>
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Prioritized dimensions */}
            <FormField
              control={form.control}
              name="prioritizedDimensions"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Prioritized CourtIQ Dimensions</FormLabel>
                    <FormDescription>
                      Select the dimensions that are most important to you in a partner
                    </FormDescription>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(DIMENSIONS) as CourtIQDimension[]).map((dimension) => {
                      const info = DIMENSIONS[dimension];
                      const isSelected = field.value?.includes(dimension);
                      
                      return (
                        <div
                          key={dimension}
                          className={cn(
                            "flex items-center p-3 rounded-md border cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-primary/10 border-primary" 
                              : "bg-card border-border hover:bg-muted/20"
                          )}
                          onClick={() => {
                            const currentValue = [...(field.value || [])];
                            if (isSelected) {
                              field.onChange(currentValue.filter(d => d !== dimension));
                            } else {
                              // If already 3, remove the first one
                              if (currentValue.length >= 3) {
                                currentValue.shift();
                              }
                              field.onChange([...currentValue, dimension]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="mr-2"
                            onCheckedChange={(checked) => {
                              const currentValue = [...(field.value || [])];
                              if (checked) {
                                if (!currentValue.includes(dimension)) {
                                  // If already 3, remove the first one
                                  if (currentValue.length >= 3) {
                                    currentValue.shift();
                                  }
                                  field.onChange([...currentValue, dimension]);
                                }
                              } else {
                                field.onChange(currentValue.filter(d => d !== dimension));
                              }
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{info.label}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {info.description}
                            </span>
                          </div>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-3 text-sm">
                              <h4 className="font-medium mb-1">{info.label}</h4>
                              <p className="text-muted-foreground mb-2">{info.description}</p>
                              <p>
                                Prioritizing this dimension will help find partners who either complement
                                or match your abilities in this area, based on your play style preference.
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value?.map((dim) => (
                      <Badge key={dim} variant="outline">
                        {DIMENSIONS[dim].label}
                      </Badge>
                    ))}
                  </div>
                  
                  <FormDescription className="mt-4">
                    Select up to 3 dimensions to prioritize in your partner search
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-start border-t pt-4">
        <div className="text-xs text-muted-foreground">
          These preferences will be used to find compatible pickleball partners for you.
          You can update your preferences at any time.
        </div>
      </CardFooter>
    </Card>
  );
}