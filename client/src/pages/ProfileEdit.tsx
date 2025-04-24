import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save as SaveIcon, CheckCircle, Clock, User, MapPin, Award, Calendar, Sword, Hand as HandIcon, Info } from "lucide-react";

import { ProfileImageEditor } from "@/components/profile/ProfileImageEditor";

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  location: z.string().min(1, "Location is required").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  yearOfBirth: z.string().regex(/^\d{4}$/, "Must be a valid year (YYYY)").transform(val => parseInt(val)),
  playingSince: z.string().min(1, "Please specify when you started playing"),
  skillLevel: z.string().min(1, "Skill level is required"),
  dominantHand: z.string().min(1, "Dominant hand is required"),
  paddleBrand: z.string().min(1, "Paddle brand is required"),
  paddleModel: z.string().min(1, "Paddle model is required"),
  preferredPosition: z.string().min(1, "Preferred position is required"),
  playingStyle: z.string().min(1, "Playing style is required")
});

// Define the types for the form values
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileEdit() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("basic");
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  // Get user profile data
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/current-user"],
    enabled: !!user,
  });
  
  // Get profile completion data
  const { data: completionData } = useQuery({
    queryKey: ["/api/profile/completion"],
    enabled: !!user,
  });
  
  // Set up the form with existing user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      displayName: user?.displayName || "",
      location: user?.location || "",
      bio: user?.bio || "",
      yearOfBirth: user?.yearOfBirth?.toString() || "",
      playingSince: user?.playingSince || "",
      skillLevel: user?.skillLevel || "",
      dominantHand: user?.dominantHand || "",
      paddleBrand: user?.paddleBrand || "",
      paddleModel: user?.paddleModel || "",
      preferredPosition: user?.preferredPosition || "",
      playingStyle: user?.playingStyle || ""
    }
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        location: user.location || "",
        bio: user.bio || "",
        yearOfBirth: user.yearOfBirth?.toString() || "",
        playingSince: user.playingSince || "",
        skillLevel: user.skillLevel || "",
        dominantHand: user.dominantHand || "",
        paddleBrand: user.paddleBrand || "",
        paddleModel: user.paddleModel || "",
        preferredPosition: user.preferredPosition || "",
        playingStyle: user.playingStyle || ""
      });
    }
  }, [user, form]);
  
  // Profile update mutation
  const { mutate: updateProfile, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", "/api/profile/update", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      // Update the user data in the auth context and queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/completion"] });
      
      // If XP was awarded, show a special toast
      if (data?.xpAwarded > 0) {
        toast({
          title: "XP Awarded!",
          description: `You earned ${data.xpAwarded}XP for completing your profile`,
          variant: "success",
        });
      }
      
      // Navigate back to profile view
      navigate("/profile");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    }
  });
  
  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };
  
  // Cancel edit and go back to profile
  const handleCancel = () => {
    navigate("/profile");
  };
  
  // Calculate completion percentage
  const completionPercentage = completionData?.completionPercentage || 0;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-8 w-1/3 rounded-md bg-muted animate-pulse"></div>
              <div className="h-32 rounded-md bg-muted animate-pulse"></div>
              <div className="h-8 rounded-md bg-muted animate-pulse"></div>
              <div className="h-8 rounded-md bg-muted animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
            <CardDescription>
              There was an error loading your profile information. Please try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] })}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Profile Image Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>
              Add a profile photo to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProfileImageEditor user={user!} />
          </CardContent>
        </Card>
        
        {/* Profile Completion Card */}
        {completionPercentage < 100 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-[#4CAF50]" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{completionPercentage}% Complete</span>
                  <span>Earn XP by completing your profile</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {completionPercentage < 25 && (
                  <p className="text-sm text-[#FF5722]">Complete 25% to earn 25 XP</p>
                )}
                {completionPercentage >= 25 && completionPercentage < 50 && (
                  <p className="text-sm text-[#FF5722]">Complete 50% to earn 50 XP</p>
                )}
                {completionPercentage >= 50 && completionPercentage < 75 && (
                  <p className="text-sm text-[#FF5722]">Complete 75% to earn 75 XP</p>
                )}
                {completionPercentage >= 75 && completionPercentage < 100 && (
                  <p className="text-sm text-[#FF5722]">Complete 100% to earn 100 XP</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Edit Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="basic">
                      <User className="h-4 w-4 mr-2" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="preferences">
                      <Sword className="h-4 w-4 mr-2" />
                      Play Preferences
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your real first name for tournaments and passports
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your real last name for tournaments and passports
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your display name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is how you'll appear to other players
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State" {...field} />
                          </FormControl>
                          <FormDescription>
                            Help find nearby players and tournaments
                          </FormDescription>
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
                            <Input placeholder="YYYY" {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for age-based tournament divisions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="playingSince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playing Since</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="When did you start playing?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2023">2023</SelectItem>
                              <SelectItem value="2022">2022</SelectItem>
                              <SelectItem value="2021">2021</SelectItem>
                              <SelectItem value="2020">2020</SelectItem>
                              <SelectItem value="2019">2019</SelectItem>
                              <SelectItem value="2018">2018</SelectItem>
                              <SelectItem value="before 2018">Before 2018</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your skill level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1.0">1.0 - New to pickleball</SelectItem>
                              <SelectItem value="1.5">1.5 - Beginning to learn</SelectItem>
                              <SelectItem value="2.0">2.0 - Beginner</SelectItem>
                              <SelectItem value="2.5">2.5 - Advanced Beginner</SelectItem>
                              <SelectItem value="3.0">3.0 - Lower Intermediate</SelectItem>
                              <SelectItem value="3.5">3.5 - Intermediate</SelectItem>
                              <SelectItem value="4.0">4.0 - Upper Intermediate</SelectItem>
                              <SelectItem value="4.5">4.5 - Advanced</SelectItem>
                              <SelectItem value="5.0">5.0 - Expert</SelectItem>
                              <SelectItem value="5.5+">5.5+ - Professional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your self-rated skill level (separate from CourtIQ™ ratings)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Me</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share a little about yourself, your pickleball journey, goals, etc."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="flex justify-between">
                            <span>Tell other players about yourself</span>
                            <span className="text-muted-foreground">{field.value?.length || 0}/500</span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="dominantHand"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Dominant Hand</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="right" id="right" />
                                <Label htmlFor="right">Right</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="left" id="left" />
                                <Label htmlFor="left">Left</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ambidextrous" id="ambidextrous" />
                                <Label htmlFor="ambidextrous">Ambidextrous</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preferred position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="forehand">Forehand Side</SelectItem>
                              <SelectItem value="backhand">Backhand Side</SelectItem>
                              <SelectItem value="no preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your preferred side when playing doubles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="playingStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playing Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your playing style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aggressive">Aggressive (Power Player)</SelectItem>
                              <SelectItem value="balanced">Balanced (All-Around Player)</SelectItem>
                              <SelectItem value="defensive">Defensive (Patient Player)</SelectItem>
                              <SelectItem value="strategic">Strategic (Tactical Player)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Equipment</h3>
                      
                      <FormField
                        control={form.control}
                        name="paddleBrand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paddle Brand</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your paddle brand" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Selkirk">Selkirk</SelectItem>
                                <SelectItem value="Joola">Joola</SelectItem>
                                <SelectItem value="Engage">Engage</SelectItem>
                                <SelectItem value="Paddletek">Paddletek</SelectItem>
                                <SelectItem value="Onix">Onix</SelectItem>
                                <SelectItem value="Head">Head</SelectItem>
                                <SelectItem value="ProKennex">ProKennex</SelectItem>
                                <SelectItem value="Franklin">Franklin</SelectItem>
                                <SelectItem value="Gamma">Gamma</SelectItem>
                                <SelectItem value="Gearbox">Gearbox</SelectItem>
                                <SelectItem value="Prince">Prince</SelectItem>
                                <SelectItem value="CRBN">CRBN</SelectItem>
                                <SelectItem value="Electrum">Electrum</SelectItem>
                                <SelectItem value="Diadem">Diadem</SelectItem>
                                <SelectItem value="SHOT3">SHOT3</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
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
                              <Input placeholder="Paddle model or name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-4 pb-6 border-t">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}