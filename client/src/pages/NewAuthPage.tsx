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
import { ComingSoonModal } from "@/components/ui/coming-soon-modal";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  yearOfBirth: z.number({
    required_error: "Year of birth is required",
    invalid_type_error: "Please enter a valid year"
  }).min(1920, { message: "Please enter a valid year" })
    .max(new Date().getFullYear() - 13, { message: "You must be at least 13 years old to register" }),
  gender: z.enum(["male", "female"], {
    required_error: "Please select your gender"
  }),
  username: z.string().optional().refine(val => !val || val.length >= 3, {
    message: "Username must be at least 3 characters if provided"
  }).refine(val => !val || /^[a-zA-Z0-9_]+$/.test(val), {
    message: "Username can only contain letters, numbers, and underscores"
  }),
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
  const [comingSoonModal, setComingSoonModal] = useState<{ isOpen: boolean; provider: string }>({ isOpen: false, provider: '' });

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
      email: "",
      password: "",
      confirmPassword: "",
      yearOfBirth: undefined,
      gender: undefined,
      username: "",
      agreeToTerms: false,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({ 
        username: data.username, 
        password: data.password,
        rememberMe: data.rememberMe || false
      });
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your player passport.",
        variant: "success",
      });
      setLocation("/unified-prototype");
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
        username: data.username || "", // Use empty string for auto-generation
        email: data.email,
        password: data.password,
        dateOfBirth: data.yearOfBirth ? `${data.yearOfBirth}-01-01` : undefined, // Convert year to date format
        gender: data.gender,
      });
      toast({
        title: "Welcome to Pickle+!",
        description: "Your player passport has been created successfully.",
        variant: "success",
      });
      setLocation("/unified-prototype");
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
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
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
                className="mb-6 text-gray-400 hover:text-white"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.backToHome', 'Back to Home')}
              </Button>
              
              {/* Use gaming logo instead of old logo */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4 L32 12 L32 28 L20 36 L8 28 L8 12 Z" fill="url(#pickleGradient)" stroke="url(#pickleStroke)" strokeWidth="2" />
                    <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="14" y1="20" x2="26" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="pickleGradient" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF5722" />
                        <stop offset="100%" stopColor="#E91E63" />
                      </linearGradient>
                      <linearGradient id="pickleStroke" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF6B45" />
                        <stop offset="100%" stopColor="#FF4081" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 blur-xl opacity-50 bg-gradient-to-r from-orange-500 to-pink-500 -z-10" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === "login" ? t('auth.welcomeBack', 'Welcome Back') : t('auth.createPassport', 'Create Your Passport')}
              </h1>
              
              <p className="text-gray-400">
                {activeTab === "login" 
                  ? t('auth.signInDescription', 'Sign in to access your player dashboard')
                  : <><span className="text-orange-400">Where Players Become Legends</span> - {t('auth.joinRevolution', 'Join the revolution')}</>
                }
              </p>
            </div>

            {/* Auth Form */}
            <Card className="shadow-2xl border border-slate-800 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50 border border-slate-700">
                    <TabsTrigger value="login" className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400">{t('auth.signIn', 'Sign In')}</TabsTrigger>
                    <TabsTrigger value="register" className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400">{t('auth.createAccount', 'Create Account')}</TabsTrigger>
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
                              <FormLabel className="text-gray-300">{t('auth.usernameOrEmail', 'Username or Email')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder={t('auth.usernamePlaceholder', 'Enter your username or email')}
                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
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
                              <FormLabel className="text-gray-300">{t('auth.password', 'Password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="password"
                                    placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
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
                              <FormLabel className="text-sm font-normal text-gray-300">
                                {t('auth.rememberMe', 'Remember me for 30 days')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.loggingIn', 'Signing In...') : t('auth.signInToDashboard', 'Sign In to Dashboard')}
                        </Button>

                        {/* OAuth Login Section */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-700" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-800 px-2 text-gray-400">Or continue with</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Replit Auth (Google, Apple, GitHub, X) */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => window.location.href = '/api/login'}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                          </Button>

                          {/* Facebook OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Facebook' })}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Kakao OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Kakao' })}
                            disabled={isLoading}
                          >
                            <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                            Kakao
                          </Button>

                          {/* Line OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Line' })}
                            disabled={isLoading}
                          >
                            <div className="w-4 h-4 mr-2 bg-green-500 rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            Line
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* WeChat OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'WeChat' })}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="#07C160" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                              <path fill="#07C160" d="M23.999 14.6c0-3.573-3.251-6.425-7.23-6.425-4.043 0-7.291 2.852-7.291 6.425s3.248 6.425 7.291 6.425c.468 0 .925-.025 1.374-.085a.868.868 0 0 1 .717.098l1.903 1.114a.326.326 0 0 0 .167.054.295.295 0 0 0 .29-.295c0-.072-.029-.143-.048-.213l-.39-1.48a.59.59 0 0 1 .213-.665c1.832-1.347 3.002-3.338 3.002-5.55z"/>
                            </svg>
                            WeChat
                          </Button>
                        </div>
                        
                        {/* Forgot Password Link */}
                        <div className="text-center">
                          <a
                            href="/forgot-password"
                            className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-200 inline-block mt-2"
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
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                        {/* 1. EMAIL - Primary identifier */}
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-300">{t('auth.email', 'Email Address')} *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    type="email"
                                    placeholder={t('auth.emailPlaceholder', 'your.email@example.com')}
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 2. PASSWORD FIELDS - Security credentials together */}
                        <div className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-300">{t('auth.password', 'Password')} *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input 
                                      {...field} 
                                      type="password"
                                      placeholder={t('auth.createPassword', 'Create a strong password (8+ characters)')}
                                      className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
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
                                <FormLabel className="text-sm font-medium text-gray-300">{t('auth.confirmPassword', 'Confirm Password')} *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input 
                                      {...field} 
                                      type="password"
                                      placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
                                      className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* 3. PERSONAL INFO - Year of birth and gender together */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="yearOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-300">{t('auth.yearOfBirth', 'Year of Birth')} *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="1920"
                                      max={new Date().getFullYear() - 13}
                                      placeholder="1990"
                                      className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
                                <FormLabel className="text-sm font-medium text-gray-300">{t('gender', 'Gender')} *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-slate-900/50 border-slate-700 text-white">
                                      <SelectValue placeholder={t('selectGender', 'Select gender')} className="text-gray-500" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="male" className="text-white hover:bg-slate-700">{t('male', 'Male')}</SelectItem>
                                    <SelectItem value="female" className="text-white hover:bg-slate-700">{t('female', 'Female')}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* 4. USERNAME - Optional, less critical */}
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-300">
                                {t('auth.username', 'Username')} 
                                <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder={t('auth.usernamePlaceholderRegister', 'Choose a unique username or leave blank')}
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-400 mt-1">We'll create one automatically if left blank - you can change it later</p>
                            </FormItem>
                          )}
                        />

                        {/* 5. TERMS AGREEMENT - Always last */}

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
                              <FormLabel className="text-sm font-normal text-gray-300">
                                {t('auth.agreeToTerms', 'I agree to the Terms of Service and Privacy Policy')}
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.creatingAccount', 'Creating Account...') : t('auth.createPassportButton', 'Create My Player Passport')}
                        </Button>

                        {/* OAuth Registration Section */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-700" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-800 px-2 text-gray-400">Or sign up with</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Replit Auth (Google, Apple, GitHub, X) */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => window.location.href = '/api/login'}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                          </Button>

                          {/* Facebook OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Facebook' })}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Kakao OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Kakao' })}
                            disabled={isLoading}
                          >
                            <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                            Kakao
                          </Button>

                          {/* Line OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'Line' })}
                            disabled={isLoading}
                          >
                            <div className="w-4 h-4 mr-2 bg-green-500 rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            Line
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* WeChat OAuth */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-slate-900/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                            onClick={() => setComingSoonModal({ isOpen: true, provider: 'WeChat' })}
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="#07C160" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                              <path fill="#07C160" d="M23.999 14.6c0-3.573-3.251-6.425-7.23-6.425-4.043 0-7.291 2.852-7.291 6.425s3.248 6.425 7.291 6.425c.468 0 .925-.025 1.374-.085a.868.868 0 0 1 .717.098l1.903 1.114a.326.326 0 0 0 .167.054.295.295 0 0 0 .29-.295c0-.072-.029-.143-.048-.213l-.39-1.48a.59.59 0 0 1 .213-.665c1.832-1.347 3.002-3.338 3.002-5.55z"/>
                            </svg>
                            WeChat
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Hero/Brand Showcase */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden border-l border-slate-800">
          <div className="flex flex-col justify-center items-center text-white p-12 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideIn}
              className="text-center"
            >
              {/* Gaming Logo */}
              <motion.div
                className="relative mb-8 flex justify-center"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4 L32 12 L32 28 L20 36 L8 28 L8 12 Z" fill="url(#pickleGradientSide)" stroke="url(#pickleStrokeSide)" strokeWidth="2" />
                    <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="14" y1="20" x2="26" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="pickleGradientSide" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF5722" />
                        <stop offset="100%" stopColor="#E91E63" />
                      </linearGradient>
                      <linearGradient id="pickleStrokeSide" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF6B45" />
                        <stop offset="100%" stopColor="#FF4081" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r from-orange-500 to-pink-500 -z-10" />
                </div>
              </motion.div>

              <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                Where Players Become Legends
              </h2>
              
              <p className="text-xl mb-8 text-gray-300">
                Your digital player passport awaits. Join the transparent ranking revolution.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-start text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Live Match Tracking & Verification</span>
                </div>
                <div className="flex items-center justify-start text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Official System B Rankings</span>
                </div>
                <div className="flex items-center justify-start text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>QR Code Player Passports</span>
                </div>
                <div className="flex items-center justify-start text-gray-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Transparent Algorithm</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent transform rotate-12 scale-150"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Coming Soon Modal for OAuth providers */}
    <ComingSoonModal
      isOpen={comingSoonModal.isOpen}
      onClose={() => setComingSoonModal({ isOpen: false, provider: '' })}
      feature={`${comingSoonModal.provider} Authentication`}
      description={`One-click sign-in with ${comingSoonModal.provider} is being fine-tuned for the best user experience. Use traditional login for now!`}
    />
    </>
  );
}