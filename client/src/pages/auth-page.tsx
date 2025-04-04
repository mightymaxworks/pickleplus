import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  redemptionCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user) {
    setLocation("/dashboard");
    return null;
  }

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
      redemptionCode: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      await login(values.identifier, values.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      // Error toast is shown in the login function
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsRegistering(true);
    try {
      const { confirmPassword, redemptionCode, ...userData } = values;
      
      // Generate initials for avatar
      const nameParts = values.displayName.split(" ");
      const avatarInitials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : values.displayName.slice(0, 2).toUpperCase();
      
      // Generate passportId in PKL-XXXX-YYY format
      const randomChars = () => Math.random().toString(36).substring(2, 7).toUpperCase();
      const passportId = `PKL-${randomChars().substring(0, 4)}-${randomChars().substring(0, 3)}`;

      // @ts-ignore - The type system doesn't know we are adding these fields
      await register({
        ...userData,
        avatarInitials,
        passportId,
        yearOfBirth: values.yearOfBirth || null,
        redemptionCode: redemptionCode || undefined
      });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created! Welcome to Pickle+.",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      // Error toast is shown in the register function
    } finally {
      setIsRegistering(false);
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
                              disabled={isLoggingIn}
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
                              disabled={isLoggingIn}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Logging in..." : "Login"}
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
                              disabled={isRegistering}
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
                              disabled={isRegistering}
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
                              disabled={isRegistering}
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
                                disabled={isRegistering}
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
                                disabled={isRegistering}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
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
                              disabled={isRegistering}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              disabled={isRegistering}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Creating Account..." : "Create Account"}
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