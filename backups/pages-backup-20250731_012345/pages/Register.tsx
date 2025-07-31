import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Create a schema for the registration form
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  // Make firstName and lastName required fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Make display name optional since we'll construct it if not provided
  displayName: z.string().optional(),
  // Include a root field for form-level errors
  root: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [referralNotice, setReferralNotice] = useState<boolean>(false);
  
  // Extract referral ID from URL when component mounts
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ref = urlParams.get('ref');
    
    if (ref) {
      setReferrerId(ref);
      setReferralNotice(true);
      console.log(`[REFERRAL] Registration with referral ID: ${ref}`);
    }
  }, []);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "", // Add firstName field
      lastName: "",  // Add lastName field
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      yearOfBirth: undefined,
      location: "",
      playingSince: "",
      skillLevel: "",
      avatarInitials: "",
      level: 1,
      xp: 0,
      totalMatches: 0,
      matchesWon: 0,
      totalTournaments: 0,
    },
  });

  const handleSubmit = async (formData: RegisterFormData) => {
    try {
      console.log("[DEBUG] Attempting registration with form data:", formData);
      
      if (!formData.username || !formData.password || !formData.firstName || !formData.lastName) {
        console.error("[DEBUG] Registration error: Missing required fields");
        form.setError("root", { 
          type: "manual",
          message: "Registration failed: Username, password, first name, and last name are required"
        });
        return;
      }
      
      // Use directly entered first and last name instead of extracting from display name
      const firstName = formData.firstName || "";
      const lastName = formData.lastName || "";
      
      // If display name isn't provided, construct it from first and last name
      if (!formData.displayName) {
        formData.displayName = `${firstName} ${lastName}`.trim();
      }
      
      console.log("[DEBUG] Using firstName:", firstName, "lastName:", lastName);
      
      // Framework 5.0: Create a properly formatted registration object matching RegisterData type
      // Directly embed firstName and lastName as required fields by the server schema
      const registrationData = {
        username: formData.username,
        email: formData.email || "",  // Ensure email is never null or undefined
        password: formData.password,
        displayName: formData.displayName, // Make sure to include displayName
        firstName, // Required by server schema
        lastName,  // Required by server schema
        yearOfBirth: formData.yearOfBirth || null,
        location: formData.location || null,
        playingSince: formData.playingSince || null,
        skillLevel: formData.skillLevel || null,
      };
      
      // Framework 5.0: Enhanced logging to verify firstName and lastName are included
      console.log("[DEBUG] Submitting registration data:", {
        ...registrationData, 
        password: '[REDACTED]',
        firstName: registrationData.firstName, // Explicitly log to confirm
        lastName: registrationData.lastName    // Explicitly log to confirm
      });
      
      try {
        // Build the URL with referral param if available
        let registerUrl = '/api/auth/register';
        if (referrerId) {
          registerUrl += `?ref=${referrerId}`;
          console.log(`[REFERRAL] Adding referral ID ${referrerId} to registration request`);
        }
        
        // Make direct fetch call to inspect response in detail
        const response = await fetch(registerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(registrationData),
        });
        
        console.log("[DEBUG] Registration response status:", response.status);
        console.log("[DEBUG] Registration response headers:", 
          Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as Record<string, string>)
        );
        
        if (response.ok) {
          const userData = await response.json();
          console.log("[DEBUG] Registration successful, user data:", userData);
          // Update query client data
          queryClient.setQueryData(["/api/auth/current-user"], userData);
          toast({
            title: "Registration successful",
            description: `Welcome to Pickle+, ${userData.username}!`,
          });
          navigate("/dashboard");
        } else {
          // Handle error response
          let errorData;
          try {
            errorData = await response.json();
            console.error("[DEBUG] Registration error response:", errorData);
          } catch (e) {
            console.error("[DEBUG] Failed to parse error response:", e);
            errorData = { message: "Server error. Please try again." };
          }
          
          form.setError("root", { 
            type: "manual",
            message: `Registration failed: ${errorData.message || "Unknown error"}`
          });
        }
      } catch (fetchError) {
        console.error("[DEBUG] Fetch error during registration:", fetchError);
        form.setError("root", { 
          type: "manual",
          message: `Network error during registration: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`
        });
      }
    } catch (error) {
      console.error("[DEBUG] Registration outer error:", error);
      // Add toast notification for detailed error feedback to user
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      form.setError("root", { 
        type: "manual",
        message: `Registration failed: ${errorMessage}`
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto">
      <div className="mb-6 flex flex-col items-center relative w-full">
        <Button 
          variant="ghost" 
          className="absolute left-0 top-0" 
          onClick={() => navigate("/welcome")}
        >
          ← Back to Home
        </Button>
        <PicklePlusTextLogo className="h-24 w-auto" />
      </div>

      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Join PICKLE+ to track your pickleball journey
          </CardDescription>
          {referralNotice && (
            <Alert className="mt-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                You were invited by a friend! They'll earn 20-40 XP when you register.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-3 pb-4">
              {/* Server error display - custom error container */}
              <div className="text-sm text-red-500 font-medium">
                {form.formState.errors.root?.message && (
                  <p>{form.formState.errors.root.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Display Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="How you'll appear to others" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearOfBirth"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Year of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 1985" 
                          min="1900" 
                          max={new Date().getFullYear()} 
                          {...field}
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="playingSince"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Playing Since</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2021" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2.0 Beginner">2.0 Beginner</SelectItem>
                          <SelectItem value="2.5 Beginner+">2.5 Beginner+</SelectItem>
                          <SelectItem value="3.0 Intermediate">3.0 Intermediate</SelectItem>
                          <SelectItem value="3.5 Intermediate+">3.5 Intermediate+</SelectItem>
                          <SelectItem value="4.0 Advanced">4.0 Advanced</SelectItem>
                          <SelectItem value="4.5 Advanced+">4.5 Advanced+</SelectItem>
                          <SelectItem value="5.0 Pro">5.0 Pro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatarInitials"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Avatar Initials</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. JS" maxLength={2} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <Button 
                type="submit" 
                className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
              >
                {"Create Account"}
              </Button>
              <p className="mt-3 text-sm text-center text-gray-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#2196F3] hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Login
                </a>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
