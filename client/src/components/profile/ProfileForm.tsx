import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ProfileCompletion } from "./ProfileCompletion";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, Calendar, MapPin, Award, BarChart3, Users, TrendingUp,
  Zap, Heart, Clock, Siren, Target, UserCircle, Medal, CircleEllipsis
} from "lucide-react";
import Racquet from "@/components/icons/Racquet";
import { type ProfileUpdateFormData } from "@/types";

// Form validation schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  yearOfBirth: z.string().optional(),
  playingSince: z.string().optional(),
  skillLevel: z.string().optional(),
  preferredFormat: z.string().optional(),
  dominantHand: z.string().optional(),
  
  // Pickleball specific fields
  preferredPosition: z.string().optional(),
  paddleBrand: z.string().optional(),
  paddleModel: z.string().optional(),
  playingStyle: z.string().optional(),
  shotStrengths: z.string().optional(),
  regularSchedule: z.string().optional(),
  lookingForPartners: z.string().optional(),
  
  // Social fields
  coach: z.string().optional(),
  clubs: z.string().optional(),
  leagues: z.string().optional(),
  
  // Health fields
  mobilityLimitations: z.string().optional(),
  preferredMatchDuration: z.string().optional(),
  fitnessLevel: z.string().optional(),
  
  // Goals
  playerGoals: z.string().optional(),
});

export function ProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Fetch profile completion data
  const { data: profileCompletionData, isLoading: completionLoading } = useQuery<any>({
    queryKey: ["/api/profile/completion"],
    enabled: !!user,
  });
  
  // Set up form with default values from user
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      location: user?.location || "",
      yearOfBirth: user?.yearOfBirth?.toString() || "",
      playingSince: user?.playingSince || "",
      skillLevel: user?.skillLevel || "",
      preferredFormat: user?.preferredFormat || "",
      dominantHand: user?.dominantHand || "",
      
      // Pickleball specific fields
      preferredPosition: user?.preferredPosition || "",
      paddleBrand: user?.paddleBrand || "",
      paddleModel: user?.paddleModel || "",
      playingStyle: user?.playingStyle || "",
      shotStrengths: user?.shotStrengths || "",
      regularSchedule: user?.regularSchedule || "",
      lookingForPartners: user?.lookingForPartners ? "yes" : "",
      
      // Social fields
      coach: user?.coach || "",
      clubs: user?.clubs || "",
      leagues: user?.leagues || "",
      
      // Health fields
      mobilityLimitations: user?.mobilityLimitations || "",
      preferredMatchDuration: user?.preferredMatchDuration || "",
      fitnessLevel: user?.fitnessLevel || "",
      
      // Goals
      playerGoals: user?.playerGoals || "",
    },
  });
  
  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        bio: user?.bio || "",
        location: user?.location || "",
        yearOfBirth: user?.yearOfBirth?.toString() || "",
        playingSince: user?.playingSince || "",
        skillLevel: user?.skillLevel || "",
        preferredFormat: user?.preferredFormat || "",
        dominantHand: user?.dominantHand || "",
        
        // Pickleball specific fields
        preferredPosition: user?.preferredPosition || "",
        paddleBrand: user?.paddleBrand || "",
        paddleModel: user?.paddleModel || "",
        playingStyle: user?.playingStyle || "",
        shotStrengths: user?.shotStrengths || "",
        regularSchedule: user?.regularSchedule || "",
        lookingForPartners: user?.lookingForPartners ? "yes" : "",
        
        // Social fields
        coach: user?.coach || "",
        clubs: user?.clubs || "",
        leagues: user?.leagues || "",
        
        // Health fields
        mobilityLimitations: user?.mobilityLimitations || "",
        preferredMatchDuration: user?.preferredMatchDuration || "",
        fitnessLevel: user?.fitnessLevel || "",
        
        // Goals
        playerGoals: user?.playerGoals || "",
      });
    }
  }, [user, form]);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: ProfileUpdateFormData) => {
      const res = await apiRequest("PATCH", "/api/profile/update", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries that depend on user data
      queryClient.setQueryData(["/api/auth/current-user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/profile/completion"] });
      
      // Display success message with XP if awarded
      if (data.xpAwarded > 0) {
        toast({
          title: "Profile Updated!",
          description: `You earned +${data.xpAwarded}XP for improving your profile.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been successfully updated.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: ProfileUpdateFormData) {
    updateProfileMutation.mutate(data);
  }

  return (
    <div className="profile-form">
      {/* Profile Completion Card */}
      {!completionLoading && profileCompletionData && (
        <Card className="mb-6 pickle-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to earn XP and unlock features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileCompletion completionData={profileCompletionData} />
          </CardContent>
        </Card>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6 pickle-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>
                Update your personal pickleball profile
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center justify-center p-3">
                    <User size={24} className="text-[#FF5722]" />
                  </TabsTrigger>
                  <TabsTrigger value="pickleball" className="flex items-center justify-center p-3">
                    <Racquet size={24} className="text-[#2196F3]" />
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center justify-center p-3">
                    <Users size={24} className="text-[#4CAF50]" />
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center justify-center p-3">
                    <Heart size={24} className="text-[#F44336]" />
                  </TabsTrigger>
                </TabsList>
                
                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell the pickleball community about yourself" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of yourself as a pickleball player
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, State" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Birth</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="YYYY" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="playingSince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playing Since</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. January 2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skillLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your skill level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1.0">1.0 - Beginner</SelectItem>
                              <SelectItem value="1.5">1.5</SelectItem>
                              <SelectItem value="2.0">2.0 - Beginner+</SelectItem>
                              <SelectItem value="2.5">2.5</SelectItem>
                              <SelectItem value="3.0">3.0 - Intermediate</SelectItem>
                              <SelectItem value="3.5">3.5</SelectItem>
                              <SelectItem value="4.0">4.0 - Advanced</SelectItem>
                              <SelectItem value="4.5">4.5</SelectItem>
                              <SelectItem value="5.0">5.0 - Pro</SelectItem>
                              <SelectItem value="5.5+">5.5+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectValue placeholder="Select preferred format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="singles">Singles</SelectItem>
                              <SelectItem value="doubles">Doubles</SelectItem>
                              <SelectItem value="mixed">Mixed Doubles</SelectItem>
                              <SelectItem value="all">All Formats</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dominantHand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dominant Hand</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dominant hand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Pickleball Tab */}
                <TabsContent value="pickleball" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="preferredPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Court Position</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left Side</SelectItem>
                            <SelectItem value="right">Right Side</SelectItem>
                            <SelectItem value="even">Even Side</SelectItem>
                            <SelectItem value="odd">Odd Side</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paddleBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paddle Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Selkirk, Joola, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paddleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paddle Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. AMPED Invikta, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="playingStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Playing Style</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your playing style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                            <SelectItem value="defensive">Defensive</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="baseliner">Baseliner</SelectItem>
                            <SelectItem value="net-rusher">Net Rusher</SelectItem>
                            <SelectItem value="strategic">Strategic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shotStrengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shot Strengths</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Drop shots, dinks, third shot drops" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="regularSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Playing Schedule</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Weekday mornings, Sunday afternoons" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lookingForPartners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Looking for Partners</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes-regular">Yes - Regular Partners</SelectItem>
                            <SelectItem value="yes-tournament">Yes - Tournament Partners</SelectItem>
                            <SelectItem value="yes-both">Yes - Both</SelectItem>
                            <SelectItem value="no">No - Not Currently</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="playerGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickleball Goals</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What are your pickleball goals for the next year?" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                {/* Social/Community Tab */}
                <TabsContent value="social" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="coach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach or Instructor</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of your coach/instructor (if any)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clubs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clubs or Facilities</FormLabel>
                        <FormControl>
                          <Input placeholder="Clubs or facilities you play at" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leagues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leagues or Groups</FormLabel>
                        <FormControl>
                          <Input placeholder="Leagues or groups you participate in" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                {/* Health Tab */}
                <TabsContent value="health" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="preferredMatchDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Match Duration</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short">Short (30 min or less)</SelectItem>
                            <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                            <SelectItem value="long">Long (60-90 min)</SelectItem>
                            <SelectItem value="extended">Extended (90+ min)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fitness Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fitness level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="athletic">Athletic</SelectItem>
                            <SelectItem value="competitive">Highly Competitive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mobilityLimitations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobility Considerations</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any mobility limitations or preferences other players should know about (optional)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This helps partners match your play style and expectations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-5">
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic", "pickleball", "social", "health"];
                  const currentIndex = tabs.indexOf(activeTab);
                  const prevTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
                  setActiveTab(prevTab);
                }}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tabs = ["basic", "pickleball", "social", "health"];
                    const currentIndex = tabs.indexOf(activeTab);
                    const nextTab = tabs[currentIndex + 1] || tabs[0];
                    setActiveTab(nextTab);
                  }}
                >
                  Next
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FF5722] hover:bg-[#E64A19]"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}