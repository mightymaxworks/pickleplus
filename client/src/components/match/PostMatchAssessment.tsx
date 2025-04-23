/**
 * PKL-278651-COURTIQ-0002-ASSESS
 * Post-Match Assessment Component for CourtIQ™
 * 
 * This component provides a user-friendly interface for players to assess their 
 * performance and their opponent's performance after a match, across the five 
 * CourtIQ™ dimensions.
 * 
 * Framework 5.3 Implementation
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, User, Users, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Define the assessment schema
const postMatchAssessmentSchema = z.object({
  // Self-Assessment
  technicalSelfRating: z.string().min(1, "Please rate your technical skills"),
  tacticalSelfRating: z.string().min(1, "Please rate your tactical awareness"),
  physicalSelfRating: z.string().min(1, "Please rate your physical fitness"),
  mentalSelfRating: z.string().min(1, "Please rate your mental toughness"),
  consistencySelfRating: z.string().min(1, "Please rate your consistency"),
  selfNotes: z.string().optional(),
  
  // Opponent Assessment
  technicalOpponentRating: z.string().optional(),
  tacticalOpponentRating: z.string().optional(),
  physicalOpponentRating: z.string().optional(),
  mentalOpponentRating: z.string().optional(),
  consistencyOpponentRating: z.string().optional(),
  opponentNotes: z.string().optional(),
  
  // Match Context
  courtSurface: z.string().optional(),
  weatherConditions: z.string().optional(),
  physicalCondition: z.string().optional(),
  equipmentIssues: z.string().optional(),
  pressureLevel: z.string().optional(),
  contextNotes: z.string().optional(),
});

// Types for the form data
type PostMatchAssessmentFormValues = z.infer<typeof postMatchAssessmentSchema>;

// Rating option definitions for skill dimensions
const ratingOptions = [
  { value: "5", label: "Exceptional", description: "Outstanding performance" },
  { value: "4", label: "Strong", description: "Above average performance" },
  { value: "3", label: "Solid", description: "Average performance" },
  { value: "2", label: "Developing", description: "Below average performance" },
  { value: "1", label: "Needs Work", description: "Struggled significantly" },
];

// Environment options
const courtSurfaceOptions = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor_concrete", label: "Outdoor - Concrete" },
  { value: "outdoor_acrylic", label: "Outdoor - Acrylic" },
  { value: "outdoor_asphalt", label: "Outdoor - Asphalt" },
  { value: "outdoor_clay", label: "Outdoor - Clay" },
  { value: "outdoor_turf", label: "Outdoor - Turf" },
  { value: "outdoor_other", label: "Outdoor - Other" },
];

const weatherConditionOptions = [
  { value: "indoor", label: "Indoor (N/A)" },
  { value: "sunny_calm", label: "Sunny & Calm" },
  { value: "sunny_windy", label: "Sunny & Windy" },
  { value: "cloudy_calm", label: "Cloudy & Calm" },
  { value: "cloudy_windy", label: "Cloudy & Windy" },
  { value: "hot", label: "Hot (85°F+/29°C+)" },
  { value: "cold", label: "Cold (Below 55°F/13°C)" },
  { value: "rain", label: "Rain" },
];

const physicalConditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "average", label: "Average" },
  { value: "tired", label: "Tired" },
  { value: "minor_injury", label: "Minor Injury" },
  { value: "recovering", label: "Recovering from Injury" },
  { value: "illness", label: "Illness" },
];

const pressureLevelOptions = [
  { value: "casual", label: "Casual play" },
  { value: "friendly_competition", label: "Friendly competition" },
  { value: "league_match", label: "League match" },
  { value: "tournament_early", label: "Tournament - Early round" },
  { value: "tournament_late", label: "Tournament - Late round" },
  { value: "tournament_final", label: "Tournament - Final" },
];

interface PostMatchAssessmentProps {
  matchId: number;
  matchData: any; // Match data from the match recording form
  onComplete: () => void;
  onCancel: () => void;
}

export function PostMatchAssessment({ 
  matchId, 
  matchData, 
  onComplete, 
  onCancel 
}: PostMatchAssessmentProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"self" | "opponent" | "context" | "review">("self");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Setup form
  const form = useForm<PostMatchAssessmentFormValues>({
    resolver: zodResolver(postMatchAssessmentSchema),
    defaultValues: {
      technicalSelfRating: "",
      tacticalSelfRating: "",
      physicalSelfRating: "",
      mentalSelfRating: "",
      consistencySelfRating: "",
      selfNotes: "",
      
      technicalOpponentRating: "",
      tacticalOpponentRating: "",
      physicalOpponentRating: "",
      mentalOpponentRating: "",
      consistencyOpponentRating: "",
      opponentNotes: "",
      
      courtSurface: "",
      weatherConditions: "",
      physicalCondition: "",
      equipmentIssues: "",
      pressureLevel: "",
      contextNotes: "",
    }
  });
  
  // Helper to determine if the current step is complete
  const isStepComplete = () => {
    const { 
      technicalSelfRating, 
      tacticalSelfRating, 
      physicalSelfRating, 
      mentalSelfRating, 
      consistencySelfRating 
    } = form.getValues();
    
    switch(step) {
      case "self":
        return (
          technicalSelfRating && 
          tacticalSelfRating && 
          physicalSelfRating && 
          mentalSelfRating && 
          consistencySelfRating
        );
      // Opponent assessment and context are optional
      case "opponent":
      case "context":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };
  
  // Navigation functions
  const nextStep = () => {
    if (step === "self") setStep("opponent");
    else if (step === "opponent") setStep("context");
    else if (step === "context") setStep("review");
  };
  
  const prevStep = () => {
    if (step === "opponent") setStep("self");
    else if (step === "context") setStep("opponent");
    else if (step === "review") setStep("context");
  };
  
  // Handle form submission
  const onSubmit = async (values: PostMatchAssessmentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Process the self-assessment ratings
      const selfAssessments = [
        {
          matchId,
          userId: matchData.playerOneId, // Current user
          dimension: "TECH",
          impactValue: parseInt(values.technicalSelfRating),
          reason: "self-assessment",
          metadata: { 
            assessmentType: "self",
            notes: values.selfNotes 
          }
        },
        {
          matchId,
          userId: matchData.playerOneId, // Current user
          dimension: "TACT",
          impactValue: parseInt(values.tacticalSelfRating),
          reason: "self-assessment",
          metadata: { 
            assessmentType: "self",
            notes: values.selfNotes 
          }
        },
        {
          matchId,
          userId: matchData.playerOneId, // Current user
          dimension: "PHYS",
          impactValue: parseInt(values.physicalSelfRating),
          reason: "self-assessment",
          metadata: { 
            assessmentType: "self",
            notes: values.selfNotes 
          }
        },
        {
          matchId,
          userId: matchData.playerOneId, // Current user
          dimension: "MENT",
          impactValue: parseInt(values.mentalSelfRating),
          reason: "self-assessment",
          metadata: { 
            assessmentType: "self",
            notes: values.selfNotes 
          }
        },
        {
          matchId,
          userId: matchData.playerOneId, // Current user
          dimension: "CONS",
          impactValue: parseInt(values.consistencySelfRating),
          reason: "self-assessment",
          metadata: { 
            assessmentType: "self",
            notes: values.selfNotes 
          }
        }
      ];
      
      // Process the opponent assessment ratings (if provided)
      const opponentAssessments = [];
      if (values.technicalOpponentRating) {
        opponentAssessments.push({
          matchId,
          userId: matchData.playerTwoId, // Opponent
          dimension: "TECH",
          impactValue: parseInt(values.technicalOpponentRating),
          reason: "opponent-assessment",
          metadata: { 
            assessmentType: "opponent",
            assessedBy: matchData.playerOneId,
            notes: values.opponentNotes 
          }
        });
      }
      
      if (values.tacticalOpponentRating) {
        opponentAssessments.push({
          matchId,
          userId: matchData.playerTwoId, // Opponent
          dimension: "TACT",
          impactValue: parseInt(values.tacticalOpponentRating),
          reason: "opponent-assessment",
          metadata: { 
            assessmentType: "opponent",
            assessedBy: matchData.playerOneId,
            notes: values.opponentNotes 
          }
        });
      }
      
      if (values.physicalOpponentRating) {
        opponentAssessments.push({
          matchId,
          userId: matchData.playerTwoId, // Opponent
          dimension: "PHYS",
          impactValue: parseInt(values.physicalOpponentRating),
          reason: "opponent-assessment",
          metadata: { 
            assessmentType: "opponent",
            assessedBy: matchData.playerOneId,
            notes: values.opponentNotes 
          }
        });
      }
      
      if (values.mentalOpponentRating) {
        opponentAssessments.push({
          matchId,
          userId: matchData.playerTwoId, // Opponent
          dimension: "MENT",
          impactValue: parseInt(values.mentalOpponentRating),
          reason: "opponent-assessment",
          metadata: { 
            assessmentType: "opponent",
            assessedBy: matchData.playerOneId,
            notes: values.opponentNotes 
          }
        });
      }
      
      if (values.consistencyOpponentRating) {
        opponentAssessments.push({
          matchId,
          userId: matchData.playerTwoId, // Opponent
          dimension: "CONS",
          impactValue: parseInt(values.consistencyOpponentRating),
          reason: "opponent-assessment",
          metadata: { 
            assessmentType: "opponent",
            assessedBy: matchData.playerOneId,
            notes: values.opponentNotes 
          }
        });
      }
      
      // Collect match context information if provided
      const matchContext: Record<string, string> = {};
      if (values.courtSurface) matchContext.courtSurface = values.courtSurface;
      if (values.weatherConditions) matchContext.weatherConditions = values.weatherConditions;
      if (values.physicalCondition) matchContext.physicalCondition = values.physicalCondition;
      if (values.equipmentIssues) matchContext.equipmentIssues = values.equipmentIssues;
      if (values.pressureLevel) matchContext.pressureLevel = values.pressureLevel;
      if (values.contextNotes) matchContext.notes = values.contextNotes;
      
      // Update match metadata with context if available
      if (Object.keys(matchContext).length > 0) {
        await apiRequest("PATCH", `/api/match/${matchId}`, {
          metadata: {
            ...matchData.metadata,
            contextAssessment: matchContext
          }
        });
      }
      
      // Submit the performance impacts to the API
      const allAssessments = [...selfAssessments, ...opponentAssessments];
      
      // Split into batches to avoid too many requests at once
      // (Could be optimized with a batch endpoint later)
      for (const assessment of allAssessments) {
        await apiRequest("POST", "/api/match/performance-impact", assessment);
      }
      
      // Show success toast
      toast({
        title: "Assessment submitted!",
        description: "Your match assessment has been recorded.",
        duration: 3000,
      });
      
      // Mark as complete
      setIsComplete(true);
      
      // Delay before calling onComplete to show success state
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error submitting assessment",
        description: "There was a problem submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If already complete, show success state
  if (isComplete) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h3 className="text-xl font-bold text-center">Assessment Complete!</h3>
          <p className="text-center text-gray-500">
            Thank you for completing your post-match assessment. Your feedback helps improve the CourtIQ™ rating system.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs 
          value={step} 
          onValueChange={(value) => setStep(value as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="self" disabled={step !== "self"}>
              Self-Assessment
            </TabsTrigger>
            <TabsTrigger value="opponent" disabled={step !== "opponent"}>
              Opponent
            </TabsTrigger>
            <TabsTrigger value="context" disabled={step !== "context"}>
              Match Context
            </TabsTrigger>
            <TabsTrigger value="review" disabled={step !== "review"}>
              Review & Submit
            </TabsTrigger>
          </TabsList>
          
          {/* Step 1: Self-Assessment */}
          <TabsContent value="self" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How did you perform?</CardTitle>
                <CardDescription>
                  Rate your performance across the five CourtIQ™ dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Skills */}
                <FormField
                  control={form.control}
                  name="technicalSelfRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Technical Skills</FormLabel>
                      <FormDescription>
                        Shot execution, form, footwork, and mechanical skills
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`technical-${option.value}`} />
                              <Label htmlFor={`technical-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tactical Awareness */}
                <FormField
                  control={form.control}
                  name="tacticalSelfRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Tactical Awareness</FormLabel>
                      <FormDescription>
                        Shot selection, strategy, court positioning, and game management
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`tactical-${option.value}`} />
                              <Label htmlFor={`tactical-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Physical Fitness */}
                <FormField
                  control={form.control}
                  name="physicalSelfRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Physical Fitness</FormLabel>
                      <FormDescription>
                        Speed, agility, endurance, and recovery
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`physical-${option.value}`} />
                              <Label htmlFor={`physical-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Mental Toughness */}
                <FormField
                  control={form.control}
                  name="mentalSelfRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Mental Toughness</FormLabel>
                      <FormDescription>
                        Focus, composure, resilience, and decision-making under pressure
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`mental-${option.value}`} />
                              <Label htmlFor={`mental-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Consistency */}
                <FormField
                  control={form.control}
                  name="consistencySelfRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Consistency</FormLabel>
                      <FormDescription>
                        Shot reliability, performance stability, and error reduction
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`consistency-${option.value}`} />
                              <Label htmlFor={`consistency-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="selfNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about your performance..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Skip Assessment
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!isStepComplete()}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Step 2: Opponent Assessment */}
          <TabsContent value="opponent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How did your opponent perform?</CardTitle>
                <CardDescription>
                  Rate your opponent's performance (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Skills */}
                <FormField
                  control={form.control}
                  name="technicalOpponentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Technical Skills</FormLabel>
                      <FormDescription>
                        Shot execution, form, footwork, and mechanical skills
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`technical-opp-${option.value}`} />
                              <Label htmlFor={`technical-opp-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tactical Awareness */}
                <FormField
                  control={form.control}
                  name="tacticalOpponentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Tactical Awareness</FormLabel>
                      <FormDescription>
                        Shot selection, strategy, court positioning, and game management
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`tactical-opp-${option.value}`} />
                              <Label htmlFor={`tactical-opp-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Physical Fitness */}
                <FormField
                  control={form.control}
                  name="physicalOpponentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Physical Fitness</FormLabel>
                      <FormDescription>
                        Speed, agility, endurance, and recovery
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`physical-opp-${option.value}`} />
                              <Label htmlFor={`physical-opp-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Mental Toughness */}
                <FormField
                  control={form.control}
                  name="mentalOpponentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Mental Toughness</FormLabel>
                      <FormDescription>
                        Focus, composure, resilience, and decision-making under pressure
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`mental-opp-${option.value}`} />
                              <Label htmlFor={`mental-opp-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Consistency */}
                <FormField
                  control={form.control}
                  name="consistencyOpponentRating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Consistency</FormLabel>
                      <FormDescription>
                        Shot reliability, performance stability, and error reduction
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ratingOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent">
                              <RadioGroupItem value={option.value} id={`consistency-opp-${option.value}`} />
                              <Label htmlFor={`consistency-opp-${option.value}`} className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.description}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="opponentNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about your opponent's performance..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Step 3: Match Context */}
          <TabsContent value="context" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Context</CardTitle>
                <CardDescription>
                  Tell us about the conditions that affected your match (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Court Surface */}
                <FormField
                  control={form.control}
                  name="courtSurface"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Court Surface</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select court surface" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courtSurfaceOptions.map(option => (
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
                
                {/* Weather Conditions */}
                <FormField
                  control={form.control}
                  name="weatherConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather Conditions</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weather conditions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weatherConditionOptions.map(option => (
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
                
                {/* Physical Condition */}
                <FormField
                  control={form.control}
                  name="physicalCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Physical Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select physical condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {physicalConditionOptions.map(option => (
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
                
                {/* Equipment Issues */}
                <FormField
                  control={form.control}
                  name="equipmentIssues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Issues</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any equipment problems during the match? (broken paddle, etc.)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Pressure Level */}
                <FormField
                  control={form.control}
                  name="pressureLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Match Pressure Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pressure level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pressureLevelOptions.map(option => (
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
                
                {/* Additional Context Notes */}
                <FormField
                  control={form.control}
                  name="contextNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anything else that affected the match?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Review & Submit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Step 4: Review & Submit */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review & Submit</CardTitle>
                <CardDescription>
                  Review your assessment before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold mb-2">Self-Assessment</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-500">Technical Skills:</div>
                          <div className="text-sm font-medium">
                            {ratingOptions.find(o => o.value === form.getValues().technicalSelfRating)?.label || "Not rated"}
                          </div>
                          
                          <div className="text-sm text-gray-500">Tactical Awareness:</div>
                          <div className="text-sm font-medium">
                            {ratingOptions.find(o => o.value === form.getValues().tacticalSelfRating)?.label || "Not rated"}
                          </div>
                          
                          <div className="text-sm text-gray-500">Physical Fitness:</div>
                          <div className="text-sm font-medium">
                            {ratingOptions.find(o => o.value === form.getValues().physicalSelfRating)?.label || "Not rated"}
                          </div>
                          
                          <div className="text-sm text-gray-500">Mental Toughness:</div>
                          <div className="text-sm font-medium">
                            {ratingOptions.find(o => o.value === form.getValues().mentalSelfRating)?.label || "Not rated"}
                          </div>
                          
                          <div className="text-sm text-gray-500">Consistency:</div>
                          <div className="text-sm font-medium">
                            {ratingOptions.find(o => o.value === form.getValues().consistencySelfRating)?.label || "Not rated"}
                          </div>
                        </div>
                        
                        {form.getValues().selfNotes && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-500">Notes:</div>
                            <div className="text-sm mt-1 border rounded p-2">
                              {form.getValues().selfNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-semibold mb-2">Opponent Assessment</h3>
                      {!form.getValues().technicalOpponentRating && 
                       !form.getValues().tacticalOpponentRating && 
                       !form.getValues().physicalOpponentRating && 
                       !form.getValues().mentalOpponentRating && 
                       !form.getValues().consistencyOpponentRating ? (
                        <p className="text-sm text-gray-500 italic">No opponent assessment provided</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {form.getValues().technicalOpponentRating && (
                              <>
                                <div className="text-sm text-gray-500">Technical Skills:</div>
                                <div className="text-sm font-medium">
                                  {ratingOptions.find(o => o.value === form.getValues().technicalOpponentRating)?.label || "Not rated"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().tacticalOpponentRating && (
                              <>
                                <div className="text-sm text-gray-500">Tactical Awareness:</div>
                                <div className="text-sm font-medium">
                                  {ratingOptions.find(o => o.value === form.getValues().tacticalOpponentRating)?.label || "Not rated"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().physicalOpponentRating && (
                              <>
                                <div className="text-sm text-gray-500">Physical Fitness:</div>
                                <div className="text-sm font-medium">
                                  {ratingOptions.find(o => o.value === form.getValues().physicalOpponentRating)?.label || "Not rated"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().mentalOpponentRating && (
                              <>
                                <div className="text-sm text-gray-500">Mental Toughness:</div>
                                <div className="text-sm font-medium">
                                  {ratingOptions.find(o => o.value === form.getValues().mentalOpponentRating)?.label || "Not rated"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().consistencyOpponentRating && (
                              <>
                                <div className="text-sm text-gray-500">Consistency:</div>
                                <div className="text-sm font-medium">
                                  {ratingOptions.find(o => o.value === form.getValues().consistencyOpponentRating)?.label || "Not rated"}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {form.getValues().opponentNotes && (
                            <div className="mt-2">
                              <div className="text-sm text-gray-500">Notes:</div>
                              <div className="text-sm mt-1 border rounded p-2">
                                {form.getValues().opponentNotes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-semibold mb-2">Match Context</h3>
                      {!form.getValues().courtSurface && 
                       !form.getValues().weatherConditions && 
                       !form.getValues().physicalCondition && 
                       !form.getValues().equipmentIssues && 
                       !form.getValues().pressureLevel ? (
                        <p className="text-sm text-gray-500 italic">No match context provided</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {form.getValues().courtSurface && (
                              <>
                                <div className="text-sm text-gray-500">Court Surface:</div>
                                <div className="text-sm font-medium">
                                  {courtSurfaceOptions.find(o => o.value === form.getValues().courtSurface)?.label || "Not specified"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().weatherConditions && (
                              <>
                                <div className="text-sm text-gray-500">Weather Conditions:</div>
                                <div className="text-sm font-medium">
                                  {weatherConditionOptions.find(o => o.value === form.getValues().weatherConditions)?.label || "Not specified"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().physicalCondition && (
                              <>
                                <div className="text-sm text-gray-500">Physical Condition:</div>
                                <div className="text-sm font-medium">
                                  {physicalConditionOptions.find(o => o.value === form.getValues().physicalCondition)?.label || "Not specified"}
                                </div>
                              </>
                            )}
                            
                            {form.getValues().pressureLevel && (
                              <>
                                <div className="text-sm text-gray-500">Pressure Level:</div>
                                <div className="text-sm font-medium">
                                  {pressureLevelOptions.find(o => o.value === form.getValues().pressureLevel)?.label || "Not specified"}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {form.getValues().equipmentIssues && (
                            <div className="mt-2">
                              <div className="text-sm text-gray-500">Equipment Issues:</div>
                              <div className="text-sm mt-1 border rounded p-2">
                                {form.getValues().equipmentIssues}
                              </div>
                            </div>
                          )}
                          
                          {form.getValues().contextNotes && (
                            <div className="mt-2">
                              <div className="text-sm text-gray-500">Additional Context:</div>
                              <div className="text-sm mt-1 border rounded p-2">
                                {form.getValues().contextNotes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assessment"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}