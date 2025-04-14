import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth.tsx";
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

// Create a schema for the registration form
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  // Include a root field for form-level errors
  root: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
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
      
      if (!formData.username || !formData.password || !formData.displayName) {
        console.error("[DEBUG] Registration error: Missing required fields");
        form.setError("root", { 
          type: "manual",
          message: "Registration failed: Username, password, and display name are required"
        });
        return;
      }
      
      // Get first and last name from display name
      const nameParts = formData.displayName.split(" ");
      const firstName = nameParts.length > 0 ? nameParts[0] : formData.displayName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";
      
      console.log("[DEBUG] Extracted firstName:", firstName, "lastName:", lastName);
      
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
        // Make direct fetch call to inspect response in detail
        const response = await fetch('/api/auth/register', {
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
              <div className="grid grid-cols-2 gap-3">
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
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} value={field.value || ""} />
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
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
