import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PicklePlusNewLogo } from "../components/icons/PicklePlusNewLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, ArrowRight, AlertCircle, ChevronLeft, Mail, Lock, User, MapPin, Calendar, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Create schemas for the forms
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  // Make firstName and lastName required fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Add date of birth validation
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export default function EnhancedAuthPage() {
  const { login, register, user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const { toast } = useToast();

  // Mock address autocomplete function - for production, this would use a geocoding service
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    // Mock data - in production, this would call a geocoding API like Google Places or Mapbox
    const mockAddresses = [
      `${query}, Singapore`,
      `${query}, New York, NY, USA`,
      `${query}, Los Angeles, CA, USA`,
      `${query}, Toronto, ON, Canada`,
      `${query}, London, UK`,
      `${query}, Sydney, NSW, Australia`,
      `${query} Street, Singapore`,
      `${query} Avenue, Singapore`,
    ].filter(addr => addr.toLowerCase().includes(query.toLowerCase()));

    setLocationSuggestions(mockAddresses.slice(0, 5));
  };

  // Debounce location search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationQuery) {
        searchAddresses(locationQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  // Redirect if user is already logged in - with debug logging
  useEffect(() => {
    console.log("AuthPage - User state:", user);
    // Only navigate away if we have a confirmed logged-in user
    if (user && user.id) {
      console.log("AuthPage - Redirecting to dashboard because user is logged in");
      navigate("/dashboard");
    } else {
      console.log("AuthPage - No redirect, user not logged in");
    }
  }, [user, navigate]);

  // Set up login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Set up registration form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      yearOfBirth: undefined,
      dateOfBirth: "",
      location: "",
      playingSince: "",
      skillLevel: "",
      avatarInitials: "",
      level: 1,
      xp: 0,
      totalMatches: 0,
      matchesWon: 0,
      totalTournaments: 0,
      termsAccepted: false,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      // Use the login function from AuthContext
      await login({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe || false
      });
      
      // Navigate happens in the success handler of login
    } catch (error) {
      console.error("Login error:", error);
      loginForm.setError("root", { 
        type: "manual",
        message: error instanceof Error ? error.message : "An unexpected error occurred during login. Please try again."
      });
    }
  };

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      // First, verify passwords match to provide immediate feedback
      if (formData.password !== formData.confirmPassword) {
        registerForm.setError("confirmPassword", { 
          type: "manual", 
          message: "Passwords do not match" 
        });
        return;
      }
      
      // Create a properly formatted registration object
      const registrationData = {
        username: formData.username,
        email: formData.email || "",
        password: formData.password,
        confirmPassword: formData.confirmPassword, // Include confirmPassword for validation
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        yearOfBirth: formData.yearOfBirth || null,
        location: formData.location || null,
        playingSince: formData.playingSince || null,
        skillLevel: formData.skillLevel || null,
      };
      
      // Use the register function from AuthContext
      await register(registrationData);
      
      // Navigation happens in the success handler of register
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle field-specific errors
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes("Username already exists")) {
          registerForm.setError("username", { 
            type: "manual", 
            message: "This username is already taken. Please choose another." 
          });
        } else if (errorMessage.includes("Email already exists")) {
          registerForm.setError("email", { 
            type: "manual", 
            message: "This email is already registered. Please use another email or try logging in." 
          });
        } else if (errorMessage.includes("Passwords do not match")) {
          registerForm.setError("confirmPassword", { 
            type: "manual", 
            message: "Passwords do not match" 
          });
        } else {
          registerForm.setError("root", { 
            type: "manual", 
            message: errorMessage || "Registration failed. Please try again." 
          });
        }
      } else {
        registerForm.setError("root", { 
          type: "manual", 
          message: "An unexpected error occurred during registration. Please try again." 
        });
      }
    }
  };

  // Calculate avatarInitials from firstName and lastName, fallback to displayName
  useEffect(() => {
    const firstName = registerForm.watch("firstName");
    const lastName = registerForm.watch("lastName");
    const displayName = registerForm.watch("displayName");
    
    // Prioritize firstName + lastName for initials if available
    if (firstName && lastName) {
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      registerForm.setValue("avatarInitials", initials);
    } 
    // Fallback to displayName if no firstName/lastName
    else if (displayName) {
      const nameParts = displayName.split(" ");
      const initials = nameParts.length > 1 
        ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
      
      registerForm.setValue("avatarInitials", initials);
    }
  }, [
    registerForm.watch("firstName"), 
    registerForm.watch("lastName"), 
    registerForm.watch("displayName"), 
    registerForm
  ]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-8 lg:p-12">
        <div className="mb-6 flex flex-col items-center relative w-full">
          <Button 
            variant="ghost" 
            className="absolute left-0 top-0" 
            onClick={() => navigate("/")}
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="h-20 w-auto mb-2">
              <PicklePlusNewLogo width={160} preserveAspectRatio={true} />
            </div>
          </motion.div>
        </div>

        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full max-w-md mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.div
                key="login"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeInUp}
              >
                <TabsContent value="login" className="m-0">
                  <Card className="border-none shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl">Welcome Back</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your Pickleball Passport
                      </CardDescription>
                    </CardHeader>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                        <CardContent className="space-y-4">
                          {/* Form-level error display */}
                          {loginForm.formState.errors.root?.message && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              {loginForm.formState.errors.root.message}
                            </div>
                          )}
                          
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel>Username or Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      placeholder="Enter your username or email"
                                      className="pl-9"
                                      {...field}
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
                              <FormItem className="space-y-1">
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="password"
                                      placeholder="••••••••"
                                      className="pl-9"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between">
                            <FormField
                              control={loginForm.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                                </FormItem>
                              )}
                            />
                            <a
                              href="#"
                              className="text-sm text-[#2196F3] hover:underline"
                            >
                              Forgot password?
                            </a>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pt-0">
                          <Button 
                            type="submit" 
                            className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
                            disabled={isLoading}
                          >
                            {isLoading ? "Logging in..." : "Login"}
                          </Button>
                          <p className="mt-4 text-sm text-center text-gray-500">
                            Don't have an account?{" "}
                            <a
                              href="#"
                              className="text-[#2196F3] hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("register");
                              }}
                            >
                              Create account
                            </a>
                          </p>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "register" && (
              <motion.div
                key="register"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeInUp}
              >
                <TabsContent value="register" className="m-0">
                  <Card className="border-none shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl">Create Account</CardTitle>
                      <CardDescription>
                        Join PICKLE+ to track your pickleball journey
                      </CardDescription>
                    </CardHeader>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                        <CardContent className="space-y-4">
                          {/* Form-level error display */}
                          {registerForm.formState.errors.root?.message && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              {registerForm.formState.errors.root.message}
                            </div>
                          )}
                        
                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input placeholder="Username" className="pl-9" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
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
                              control={registerForm.control}
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

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input 
                                        type="date"
                                        className="pl-9"
                                        {...field} 
                                        value={field.value || ""} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
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
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input 
                                      type="email" 
                                      placeholder="you@example.com" 
                                      className="pl-9"
                                      {...field} 
                                      value={field.value || ""} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="pl-9"
                                        {...field} 
                                        value={field.value || ""} 
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
                                <FormItem className="space-y-1">
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      {...field} 
                                      value={field.value || ""} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Separator className="my-4" />
                          <h3 className="text-sm font-medium text-gray-500">Pickleball Information (Optional)</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Popover open={showLocationSuggestions} onOpenChange={setShowLocationSuggestions}>
                                      <PopoverTrigger asChild>
                                        <div className="relative">
                                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                          <Input 
                                            placeholder="Start typing your address..." 
                                            className="pl-9"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setLocationQuery(e.target.value);
                                              setShowLocationSuggestions(e.target.value.length >= 3);
                                            }}
                                            onFocus={() => {
                                              if (field.value && field.value.length >= 3) {
                                                setShowLocationSuggestions(true);
                                              }
                                            }}
                                          />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80 p-0" align="start">
                                        <Command>
                                          <CommandList>
                                            {locationSuggestions.length > 0 ? (
                                              <CommandGroup>
                                                {locationSuggestions.map((suggestion, index) => (
                                                  <CommandItem
                                                    key={index}
                                                    onSelect={() => {
                                                      field.onChange(suggestion);
                                                      setShowLocationSuggestions(false);
                                                      setLocationQuery(suggestion);
                                                    }}
                                                    className="cursor-pointer"
                                                  >
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {suggestion}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            ) : (
                                              <CommandEmpty>
                                                {locationQuery.length < 3 
                                                  ? "Type at least 3 characters to search" 
                                                  : "No addresses found"}
                                              </CommandEmpty>
                                            )}
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="playingSince"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Playing Since</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input 
                                        placeholder="e.g. 2021" 
                                        className="pl-9"
                                        {...field} 
                                        value={field.value || ""} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="skillLevel"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel>Skill Level</FormLabel>
                                <div className="relative">
                                  <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="pl-9">
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
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />



                          <FormField
                            control={registerForm.control}
                            name="termsAccepted"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer">
                                    I agree to the <a href="#" className="text-[#2196F3] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2196F3] hover:underline">Privacy Policy</a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                        <CardFooter className="flex flex-col pt-0">
                          <Button 
                            type="submit" 
                            className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating account..." : "Create Account"}
                          </Button>
                          <p className="mt-4 text-sm text-center text-gray-500">
                            Already have an account?{" "}
                            <a
                              href="#"
                              className="text-[#2196F3] hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("login");
                              }}
                            >
                              Login
                            </a>
                          </p>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Right side - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FF5722] via-[#FF7043] to-[#FF8A65] text-white relative overflow-hidden">
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-pulse"></div>
        
        {/* Animated pickle ball shapes in background */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-sm animate-float"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full blur-sm animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full blur-sm animate-float-slow"></div>
        
        <div className="flex flex-col items-center justify-center h-full p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the Pickleball Revolution
            </h2>
            <p className="text-lg text-white/80 max-w-md mx-auto">
              Track your progress, connect with other players, and elevate your game with CourtIQ™ analytics.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Personalized Progress Tracking</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
                <span className="text-white/80">Detailed match statistics and analytics</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
                <span className="text-white/80">XP-based progression system with levels</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
                <span className="text-white/80">Tournament check-ins with digital passport</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
                <span className="text-white/80">Achievements and rewards for milestones</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-white/60 text-sm">
              Already trusted by thousands of pickleball players
            </p>
          </motion.div>
        </div>
        
        {/* CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float 5s ease-in-out 1s infinite;
          }
          
          .animate-float-slow {
            animation: float 6s ease-in-out 2s infinite;
          }
        `}} />
      </div>
    </div>
  );
}