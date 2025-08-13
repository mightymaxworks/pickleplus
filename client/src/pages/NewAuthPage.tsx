import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lock, User, Mail, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

// Import brand assets
import pickleLogoPath from '@assets/Pickle (2).png';
import pickleCharacterPath from '@assets/Untitled design (51).png';
import MascotLoader, { MascotLoaderOverlay } from "@/components/ui/MascotLoader";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional().refine(val => !val || new Date(val) <= new Date(), {
    message: "Date of birth cannot be in the future"
  }).refine(val => !val || new Date().getFullYear() - new Date(val).getFullYear() >= 13, {
    message: "You must be at least 13 years old to register"
  }),
  gender: z.enum(["male", "female"]).optional(),
  location: z.string().optional(),
  playingSince: z.string().optional(),
  skillLevel: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function NewAuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: undefined,
      location: "",
      playingSince: "",
      skillLevel: "beginner",
      agreeToTerms: false,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({ username: data.username, password: data.password });
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your player passport.",
        variant: "success",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        location: data.location,
        playingSince: data.playingSince,
        skillLevel: data.skillLevel,
      });
      toast({
        title: "Welcome to Pickle+!",
        description: "Your player passport has been created successfully.",
        variant: "success",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      <MascotLoaderOverlay 
        isVisible={isLoading} 
        message={activeTab === "login" ? t('auth.signingIn', 'Signing you in...') : t('auth.creatingPassport', 'Creating your player passport...')}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                className="mb-6 text-gray-600 hover:text-gray-900"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.backToHome', 'Back to Home')}
              </Button>
              
              <img 
                src={pickleLogoPath} 
                alt="Pickle+"
                className="h-12 mx-auto mb-4"
              />
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {activeTab === "login" ? t('auth.welcomeBack', 'Welcome Back') : t('auth.createPassport', 'Create Your Passport')}
              </h1>
              
              <p className="text-gray-600">
                {activeTab === "login" 
                  ? t('auth.signInDescription', 'Sign in to access your player dashboard')
                  : t('auth.joinRevolution', 'Join the transparent ranking revolution')
                }
              </p>
            </div>

            {/* Auth Form */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-sm">{t('auth.signIn', 'Sign In')}</TabsTrigger>
                    <TabsTrigger value="register" className="text-sm">{t('auth.createAccount', 'Create Account')}</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-4">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.usernameOrEmail', 'Username or Email')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder={t('auth.usernamePlaceholder', 'Enter your username or email')}
                                    className="pl-10"
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
                              <FormLabel>{t('auth.password', 'Password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="password"
                                    placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                                    className="pl-10"
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t('auth.rememberMe', 'Remember me for 30 days')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.loggingIn', 'Signing In...') : t('auth.signInToDashboard', 'Sign In to Dashboard')}
                        </Button>
                        
                        {/* Forgot Password Link */}
                        <div className="text-center">
                          <a
                            href="/forgot-password"
                            className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200 inline-block mt-2"
                          >
                            {t('forgotPassword', 'Forgot your password?')}
                          </a>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-4">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('auth.firstName', 'First Name')}</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder={t('auth.firstNamePlaceholder', 'John')} />
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
                                <FormLabel>{t('auth.lastName', 'Last Name')}</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder={t('auth.lastNamePlaceholder', 'Doe')} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.username', 'Username')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder={t('auth.usernamePlaceholderRegister', 'Choose a unique username')}
                                    className="pl-10"
                                  />
                                </div>
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
                              <FormLabel>{t('auth.email', 'Email')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="email"
                                    placeholder={t('auth.emailPlaceholder', 'your.email@example.com')}
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.password', 'Password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="password"
                                    placeholder={t('auth.createPassword', 'Create a strong password')}
                                    className="pl-10"
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
                              <FormLabel>{t('auth.confirmPassword', 'Confirm Password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="password"
                                    placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
                                    className="pl-10"
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
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('dateOfBirth', 'Date of Birth')}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input 
                                      {...field} 
                                      type="date"
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('gender', 'Gender')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectGender', 'Select gender')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">{t('male', 'Male')}</SelectItem>
                                    <SelectItem value="female">{t('female', 'Female')}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="skillLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.skillLevel', 'Skill Level')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('auth.selectLevel', 'Select level')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">{t('auth.beginner', 'Beginner')}</SelectItem>
                                  <SelectItem value="intermediate">{t('auth.intermediate', 'Intermediate')}</SelectItem>
                                  <SelectItem value="advanced">{t('auth.advanced', 'Advanced')}</SelectItem>
                                  <SelectItem value="expert">{t('auth.expert', 'Expert')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.location', 'Location (Optional)')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder={t('auth.locationPlaceholder', 'City, State/Country')}
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="agreeToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t('auth.agreeToTerms', 'I agree to the Terms of Service and Privacy Policy')}
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.creatingAccount', 'Creating Account...') : t('auth.createPassportButton', 'Create My Player Passport')}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Hero/Brand Showcase */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 via-orange-400 to-cyan-400 relative overflow-hidden">
          <div className="flex flex-col justify-center items-center text-white p-12 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideIn}
              className="text-center"
            >
              {/* Character */}
              <motion.img 
                src={pickleCharacterPath}
                alt="Pickle Character"
                className="h-32 w-32 mx-auto mb-8"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <h2 className="text-3xl font-bold mb-4">
                Welcome to the Future
              </h2>
              
              <p className="text-xl mb-6 opacity-90">
                Your digital player passport awaits. Join thousands of players using the most transparent ranking system in pickleball.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-center text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Fair age-adjusted rankings</span>
                </div>
                <div className="flex items-center justify-center text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>QR code court integration</span>
                </div>
                <div className="flex items-center justify-center text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Real-time profile progression</span>
                </div>
                <div className="flex items-center justify-center text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Transparent algorithm</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-12 scale-150"></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}