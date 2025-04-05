import { User, ProfileCompletionData } from "@/types";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Heart, Dumbbell, User as UserIcon, Users } from "lucide-react";
import { Link } from "wouter";

// Form schema using zod
const profileFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  yearOfBirth: z.string().optional(),
  playingSince: z.string().optional(),
  skillLevel: z.string().optional(),
  preferredFormat: z.string().optional(),
  dominantHand: z.string().optional(),
  
  // Pickleball specific
  preferredPosition: z.string().optional(),
  paddleBrand: z.string().optional(),
  paddleModel: z.string().optional(),
  playingStyle: z.string().optional(),
  shotStrengths: z.string().optional(),
  regularSchedule: z.union([z.string(), z.array(z.string())]).optional(),
  lookingForPartners: z.string().optional(),
  
  // Social
  coach: z.string().optional(),
  clubs: z.string().optional(),
  leagues: z.string().optional(),
  
  // Health
  mobilityLimitations: z.string().optional(),
  preferredMatchDuration: z.string().optional(),
  fitnessLevel: z.string().optional(),
  
  // Goals
  playerGoals: z.string().optional(),
});

// Type for form values from schema
type ProfileUpdateFormData = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  
  // Get current user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/current-user"],
  });
  
  // Get profile completion data
  const { data: profileCompletionData, isLoading: completionLoading } = useQuery<ProfileCompletionData>({
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
      regularSchedule: user?.regularSchedule ? (Array.isArray(user.regularSchedule) ? user.regularSchedule : [user.regularSchedule]) : [],
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
        regularSchedule: user?.regularSchedule ? (Array.isArray(user.regularSchedule) ? user.regularSchedule : [user.regularSchedule]) : [],
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
      queryClient.invalidateQueries({ queryKey: ["/api/user/xp-tier"] });
      
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
                <TabsList className="grid grid-cols-4 p-1.5">
                  <TabsTrigger value="basic" className="flex items-center justify-center p-2">
                    <UserIcon size={22} className="text-[#FF5722]" />
                  </TabsTrigger>
                  <TabsTrigger value="pickleball" className="flex items-center justify-center p-2">
                    <Dumbbell size={22} className="text-[#2196F3]" />
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center justify-center p-2">
                    <Users size={22} className="text-[#4CAF50]" />
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center justify-center p-2">
                    <Heart size={22} className="text-[#F44336]" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paddleBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paddle Brand</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select paddle brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="selkirk">Selkirk</SelectItem>
                              <SelectItem value="paddletek">Paddletek</SelectItem>
                              <SelectItem value="engage">Engage</SelectItem>
                              <SelectItem value="joola">JOOLA</SelectItem>
                              <SelectItem value="franklin">Franklin</SelectItem>
                              <SelectItem value="prolite">ProLite</SelectItem>
                              <SelectItem value="gamma">Gamma</SelectItem>
                              <SelectItem value="oneshot">OneShot</SelectItem>
                              <SelectItem value="onix">Onix</SelectItem>
                              <SelectItem value="diadem">Diadem</SelectItem>
                              <SelectItem value="head">HEAD</SelectItem>
                              <SelectItem value="gearbox">Gearbox</SelectItem>
                              <SelectItem value="prince">Prince</SelectItem>
                              <SelectItem value="warrior">Warrior</SelectItem>
                              <SelectItem value="yonex">Yonex</SelectItem>
                              <SelectItem value="crbn">CRBN</SelectItem>
                              <SelectItem value="adidas">Adidas</SelectItem>
                              <SelectItem value="shot3">SHOT3</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your strongest shots" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dinks">Dinks</SelectItem>
                              <SelectItem value="serves">Serves</SelectItem>
                              <SelectItem value="returns">Returns</SelectItem>
                              <SelectItem value="third-shot-drops">Third Shot Drops</SelectItem>
                              <SelectItem value="volleys">Volleys</SelectItem>
                              <SelectItem value="bangers">Bangers/Drive Shots</SelectItem>
                              <SelectItem value="overhead-smash">Overhead Smash</SelectItem>
                              <SelectItem value="atp">Around-the-Post (ATP)</SelectItem>
                              <SelectItem value="erne">Erne Shots</SelectItem>
                              <SelectItem value="backhand">Backhand</SelectItem>
                              <SelectItem value="forehand">Forehand</SelectItem>
                              <SelectItem value="lobs">Lobs</SelectItem>
                              <SelectItem value="drop-shots">Drop Shots</SelectItem>
                              <SelectItem value="slice">Slice</SelectItem>
                              <SelectItem value="topspin">Topspin</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Select your strongest shot(s)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Court Position</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left Side</SelectItem>
                            <SelectItem value="right">Right Side</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your preferred position when playing doubles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="regularSchedule"
                    render={({ field: { onChange, value = [] } }) => (
                      <FormItem>
                        <FormLabel>Regular Playing Schedule</FormLabel>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Weekday Mornings", value: "weekday-mornings" },
                              { label: "Weekday Afternoons", value: "weekday-afternoons" },
                              { label: "Weekday Evenings", value: "weekday-evenings" },
                              { label: "Weekend Mornings", value: "weekend-mornings" },
                              { label: "Weekend Afternoons", value: "weekend-afternoons" },
                              { label: "Weekend Evenings", value: "weekend-evenings" }
                            ].map((option) => (
                              <label
                                key={option.value}
                                className={`flex items-center space-x-2 border rounded p-2 cursor-pointer transition-colors ${
                                  Array.isArray(value) && value.includes(option.value)
                                    ? "bg-orange-100 border-orange-300"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(value) && value.includes(option.value)}
                                  onChange={(e) => {
                                    const newValue = e.target.checked
                                      ? [...(Array.isArray(value) ? value : []), option.value]
                                      : (Array.isArray(value) ? value : []).filter(
                                          (val) => val !== option.value
                                        );
                                    onChange(newValue);
                                  }}
                                  className="hidden"
                                />
                                <span className="text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <FormDescription>
                          Select all times when you typically play
                        </FormDescription>
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
                        <FormLabel>Coach</FormLabel>
                        <FormControl>
                          <Input placeholder="Your coach's name (optional)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your coach's name or leave blank. You can also connect with coaches through the Coaching Connections feature.
                        </FormDescription>
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

                  {/* Link to coaching connections */}
                  <div className="pt-2">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-1">Coaching Connections</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect with coaches or become a coach to help others improve their pickleball skills.
                      </p>
                      <Button 
                        variant="outline" 
                        className="text-sm"
                        asChild
                      >
                        <Link to="/coaching">Manage Coaching Connections</Link>
                      </Button>
                    </div>
                  </div>
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