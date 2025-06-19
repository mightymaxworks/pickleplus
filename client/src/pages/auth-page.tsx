/**
 * PKL-278651-AUTH-0003-UX
 * Enhanced Authentication Page
 * 
 * A modern two-column authentication page featuring login and registration forms 
 * with improved user experience following Framework 5.3 principles.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Lock, User, Mail, Calendar, MapPin, Star, Trophy, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import pickleLogoPath from "../assets/Pickle (2).png";
import mascotPath from "../assets/Untitled design (51).png";
import authService from "@/services/authService";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false),
});

// Registration form schema - aligned with server expectations
const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  yearOfBirth: z.number().optional().nullable(),
  location: z.string().optional(),
  playingSince: z.string().optional(),
  skillLevel: z.string().optional(),
  redemptionCode: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("login");

  // Handle redirect using useEffect, with a check for fresh logout and saved redirect URL
  useEffect(() => {
    // Create a flag in sessionStorage to indicate if we just logged out
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    
    // Only redirect if user exists and we didn't just log out
    if (user && !justLoggedOut) {
      // Check if there's a saved redirect URL
      const savedRedirectUrl = authService.getAndClearRedirectUrl();
      if (savedRedirectUrl) {
        setLocation(savedRedirectUrl);
      } else {
        setLocation("/dashboard");
      }
    }
    
    // Clear the flag if it exists
    if (justLoggedOut) {
      sessionStorage.removeItem('just_logged_out');
      console.log("Auth page: Cleared logout flag");
    }
  }, [user, setLocation]);

  // Login form initialization
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    },
  });

  // Register form initialization
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      yearOfBirth: undefined,
      location: "",
      playingSince: "",
      skillLevel: "",
      redemptionCode: "",
      agreeToTerms: false
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe
      });
      
      // Success is handled by the login function
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled by the login function
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, redemptionCode, agreeToTerms, ...credentials } = values;
      
      // First check if passwords match to give immediate feedback
      if (credentials.password !== confirmPassword) {
        registerForm.setError("confirmPassword", { 
          type: "manual", 
          message: "Passwords do not match" 
        });
        return;
      }
      
      // Create a properly formatted registration object matching server expectations
      const registrationData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        displayName: `${credentials.firstName} ${credentials.lastName}`, // Combine names for display
        yearOfBirth: credentials.yearOfBirth || undefined,
        location: credentials.location || undefined,
        playingSince: credentials.playingSince || undefined,
        skillLevel: credentials.skillLevel || undefined,
        redemptionCode: redemptionCode || undefined
      };
      
      console.log("Sending registration data:", { ...registrationData, password: "[REDACTED]" });
      await register(registrationData);
      // Success and error are handled by the register function
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Main container with two columns */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Left column - Authentication forms */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setLocation("/")}>
              <ChevronLeft className="h-4 w-4" />
              {t('auth.backToHome', 'Back to Home')}
            </Button>
            <LanguageToggle />
          </div>
          
          <div className="text-center mb-6">
            <img 
              src={pickleLogoPath} 
              alt="Pickle+ Logo" 
              className="h-16 mx-auto"
            />
            <h1 className="text-2xl font-bold mt-4">Welcome to Pickle+</h1>
            <p className="text-muted-foreground mt-1">Join the fastest growing pickleball community</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-start">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>Enter your credentials to access your Pickle+ account.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input 
                                    placeholder="Enter your username or email"
                                    className="pl-10"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </div>
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
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password"
                                    className="pl-10"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  Remember me
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-6" 
                          disabled={isLoading}
                          size="lg"
                        >
                          {isLoading ? "Logging in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <div className="text-sm text-center w-full text-muted-foreground">
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-semibold" 
                        onClick={() => setActiveTab("register")}
                      >
                        Sign up now
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>Join Pickle+ to track your matches and improve your game.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        placeholder="First name"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        placeholder="Last name"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                      disabled={isLoading}
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
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        type="password"
                                        placeholder="Create a password"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
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
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        type="password"
                                        placeholder="Confirm your password"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Optional Information Section */}
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">
                            Optional Information <Badge variant="outline" className="ml-2">Helps with matchmaking</Badge>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="yearOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year of Birth</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        type="number"
                                        placeholder="Your birth year"
                                        className="pl-10"
                                        {...field}
                                        value={field.value || ''}
                                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                        disabled={isLoading}
                                      />
                                    </div>
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
                                  <FormLabel>Playing Since</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Trophy className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input 
                                        placeholder="e.g. 2021"
                                        className="pl-10"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={registerForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                        disabled={isLoading}
                                      >
                                        <option value="">Select country</option>
                                        <option value="United States">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Spain">Spain</option>
                                        <option value="Italy">Italy</option>
                                        <option value="Japan">Japan</option>
                                        <option value="China">China</option>
                                        <option value="India">India</option>
                                        <option value="Brazil">Brazil</option>
                                        <option value="Mexico">Mexico</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
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
                                  <FormLabel>Skill Level</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Star className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                        disabled={isLoading}
                                      >
                                        <option value="">Select skill level</option>
                                        <option value="Beginner">Beginner (1.0-2.5)</option>
                                        <option value="Intermediate">Intermediate (3.0-3.5)</option>
                                        <option value="Advanced">Advanced (4.0-4.5)</option>
                                        <option value="Expert">Expert (5.0+)</option>
                                      </select>
                                    </div>
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
                              <FormItem className="mt-4">
                                <FormLabel>Redemption Code</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your redemption code if you have one"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Have a referral code? Enter it here to earn bonus points.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Terms and Conditions */}
                        <FormField
                          control={registerForm.control}
                          name="agreeToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1 mt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  I agree to the terms of service and privacy policy
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-6" 
                          disabled={isLoading}
                          size="lg"
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <div className="text-sm text-center w-full text-muted-foreground">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-semibold" 
                        onClick={() => setActiveTab("login")}
                      >
                        Sign in
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right column - Hero Section (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 to-primary/30 flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="max-w-md mx-auto z-10">
            <div className="mb-8">
              <img 
                src={mascotPath} 
                alt="Pickle+ Mascot" 
                className="w-32 h-32 mx-auto mb-6 drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold mb-3">Level Up Your Pickleball Game</h1>
              <p className="text-lg mb-6">
                Join the community that's transforming how players track progress, 
                find matches, and improve their skills.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-1">Track Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Log matches, analyze stats, and watch your skills improve with our CourtIQ™ rating system.
                </p>
              </div>
              
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-1">Connect With Players</h3>
                <p className="text-sm text-muted-foreground">
                  Find partners, join communities, and participate in local events and tournaments.
                </p>
              </div>
              
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-1">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Gain XP, unlock achievements, and earn special rewards as you play and improve.
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative pattern */}
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>
      </div>
      
      {/* Background CSS for decorative pattern */}
      <style>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}