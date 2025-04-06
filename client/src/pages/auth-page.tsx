import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RegisterFormData } from "@/types";
// Fix import path
import pickleLogoPath from "../assets/pickle-logo.png";

// Login form schema
const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Registration form schema
const registerSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  yearOfBirth: z.number().optional().nullable(),
  location: z.string().optional(),
  playingSince: z.string().optional(),
  skillLevel: z.string().optional(),
  redemptionCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  // Handle redirect using useEffect
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Login form initialization
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Register form initialization
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      yearOfBirth: null,
      location: "",
      playingSince: "",
      skillLevel: "",
      redemptionCode: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        identifier: values.identifier,
        password: values.password
      });
      
      // Success case is handled by the mutation's onSuccess
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled by the mutation's onError
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, redemptionCode, displayName, yearOfBirth, location, playingSince, skillLevel, ...credentials } = values;
      
      // Create a properly formatted registration object matching RegisterData type
      const registrationData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        firstName: displayName.split(' ')[0] || undefined,
        lastName: displayName.split(' ').slice(1).join(' ') || undefined,
      };
      
      await registerMutation.mutateAsync(registrationData);
      // Success and error are handled by the mutation
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setLocation("/welcome")}>
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <img 
            src={pickleLogoPath} 
            alt="Pickle+ Logo" 
            className="h-16 mx-auto mb-4"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username or email"
                              {...field}
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password"
                              {...field}
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardContent className="pt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name"
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a unique username"
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="yearOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year of Birth</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="Optional: Your birth year"
                                {...field}
                                value={field.value || ''}
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="playingSince"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Playing Since</FormLabel>
                              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="e.g. 2021"
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Country</FormLabel>
                              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                            </div>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                disabled={registerMutation.isPending}
                              >
                                <option value="">Select country</option>
                                <option value="United States">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Australia">Australia</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Mexico">Mexico</option>
                                <option value="Brazil">Brazil</option>
                                <option value="India">India</option>
                                <option value="Japan">Japan</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="Spain">Spain</option>
                                <option value="Italy">Italy</option>
                                <option value="Netherlands">Netherlands</option>
                                <option value="Sweden">Sweden</option>
                                <option value="New Zealand">New Zealand</option>
                                <option value="South Korea">South Korea</option>
                                <option value="China">China</option>
                                <option value="Thailand">Thailand</option>
                                <option value="Philippines">Philippines</option>
                                <option value="Other">Other</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="skillLevel"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Skill Level</FormLabel>
                              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                            </div>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                disabled={registerMutation.isPending}
                              >
                                <option value="">Select level</option>
                                <option value="2.0 Beginner">2.0 Beginner</option>
                                <option value="2.5 Beginner+">2.5 Beginner+</option>
                                <option value="3.0 Intermediate">3.0 Intermediate</option>
                                <option value="3.5 Intermediate+">3.5 Intermediate+</option>
                                <option value="4.0 Advanced">4.0 Advanced</option>
                                <option value="4.5 Advanced+">4.5 Advanced+</option>
                                <option value="5.0 Pro">5.0 Pro</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="redemptionCode"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Redemption Code</FormLabel>
                            <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="Enter if you have a code"
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}