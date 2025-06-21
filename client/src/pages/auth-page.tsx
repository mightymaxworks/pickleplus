/**
 * PKL-278651-AUTH-0003-UX
 * Modern Authentication Page
 * 
 * A beautiful, modern authentication page with glass morphism effects,
 * enhanced UX, and comprehensive functionality.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-06-21
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Lock, User, Mail, Calendar, MapPin, Star, Trophy, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import pickleLogoPath from "../assets/Pickle (2).png";
import mascotPath from "../assets/Untitled design (51).png";
import authService from "@/services/authService";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false),
});

// Registration form schema
const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  yearOfBirth: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
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

// Countries list for selector
const countries = [
  { name: "Australia", code: "AU" },
  { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "India", code: "IN" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Mexico", code: "MX" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Norway", code: "NO" },
  { name: "Singapore", code: "SG" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
].sort((a, b) => a.name.localeCompare(b.name));

// Enhanced Country Selector Component
const CountrySelector = ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useLanguage();
  const selectedCountry = countries.find(country => country.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 pl-10 relative bg-white/80 backdrop-blur-sm hover:bg-white"
          disabled={disabled}
        >
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <span className="text-left">
            {selectedCountry ? selectedCountry.name : t('auth.countryPlaceholder', 'Select country...')}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white/95 backdrop-blur-sm border-2 border-orange-200" align="start">
        <Command>
          <CommandInput placeholder={t('auth.searchCountries', 'Search countries...')} />
          <CommandEmpty>{t('auth.noCountryFound', 'No country found.')}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
                className="cursor-pointer hover:bg-orange-50 focus:bg-orange-100"
              >
                {country.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("login");

  // Handle redirect using useEffect
  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    
    if (user && !justLoggedOut) {
      const savedRedirectUrl = sessionStorage.getItem('auth_redirect_url');
      if (savedRedirectUrl) {
        sessionStorage.removeItem('auth_redirect_url');
        setLocation(savedRedirectUrl);
      } else {
        setLocation('/dashboard');
      }
    }
    
    if (justLoggedOut) {
      sessionStorage.removeItem('just_logged_out');
    }
  }, [user, setLocation]);

  // Form initialization
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
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
      agreeToTerms: false,
    },
  });

  // Form handlers
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password, data.rememberMe);
      toast({
        title: t('auth.loginSuccess', 'Login successful'),
        description: t('auth.loginSuccessDescription', 'Welcome back to Pickle+!'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.loginError', 'Login failed'),
        description: error.message || t('auth.loginErrorDescription', 'Please check your credentials and try again.'),
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      // Transform data to match API expectations
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        yearOfBirth: data.yearOfBirth,
        location: data.location,
        playingSince: data.playingSince,
        skillLevel: data.skillLevel,
      };

      await register(registrationData);
      toast({
        title: t('auth.registerSuccess', 'Registration successful'),
        description: t('auth.registerSuccessDescription', 'Welcome to Pickle+! Your account has been created.'),
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: t('auth.registerError', 'Registration failed'),
        description: error.message || t('auth.registerErrorDescription', 'There was an error creating your account. Please try again.'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-300/10 to-yellow-300/10 rounded-full blur-3xl animate-ping"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Authentication Forms */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="mb-8">
              <div className="flex justify-between items-start mb-8">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-orange-600 transition-colors" onClick={() => setLocation("/")}>
                  <ChevronLeft className="h-4 w-4" />
                  {t('auth.backToHome', 'Back to Home')}
                </Button>
                <LanguageToggle />
              </div>
              
              <div className="text-center">
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full blur-2xl opacity-20 scale-110"></div>
                  <img 
                    src={pickleLogoPath} 
                    alt="Pickle+ Logo" 
                    className="relative h-24 w-auto mx-auto drop-shadow-lg"
                  />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4 tracking-tight">
                  {t('auth.welcomeTitle', 'Welcome to Pickle+')}
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  {t('auth.welcomeSubtitle', 'Your pickleball journey starts here')}
                </p>
              </div>
            </div>
          
            {/* Modern Tab-based Authentication */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg relative overflow-hidden">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
              
              <div className="relative z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-orange-100 to-amber-100 p-1.5 rounded-xl border border-orange-200/50">
                    <TabsTrigger 
                      value="login" 
                      className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      {t('auth.loginTab', 'Login')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      {t('auth.registerTab', 'Register')}
                    </TabsTrigger>
                  </TabsList>
              
              {/* Enhanced Login Form */}
              <TabsContent value="login" className="space-y-6">
                <CardHeader className="space-y-3 pb-6">
                  <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {t('auth.loginTitle', 'Welcome Back')}
                  </CardTitle>
                  <CardDescription className="text-center text-gray-700 text-lg font-medium">
                    {t('auth.loginDescription', 'Sign in to continue your pickleball journey')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              {t('auth.usernameLabel', 'Username or Email')}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder={t('auth.usernamePlaceholder', 'Enter your username or email')}
                                  className="pl-10 h-14 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 text-base bg-white/80 backdrop-blur-sm"
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
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              {t('auth.passwordLabel', 'Password')}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input
                                  type="password"
                                  placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                                  className="pl-10 h-14 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 text-base bg-white/80 backdrop-blur-sm"
                                  {...field}
                                  disabled={isLoading}
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 border-2 border-orange-300"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  {t('auth.rememberMe', 'Remember me')}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button variant="link" size="sm" className="p-0 h-auto text-sm text-orange-600 hover:text-orange-800 font-semibold">
                          {t('auth.forgotPassword', 'Forgot password?')}
                        </Button>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                            {t('auth.signingIn', 'Signing in...')}
                          </>
                        ) : (
                          <>
                            <div className="mr-2">🏓</div>
                            {t('auth.signIn', 'Sign In')}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>

                <CardFooter className="text-center px-6 pb-6">
                  <div className="text-sm">
                    <span className="text-gray-600">{t('auth.noAccount', "Don't have an account?")} </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto font-bold text-orange-600 hover:text-orange-800 text-base"
                      onClick={() => setActiveTab("register")}
                    >
                      {t('auth.signUp', 'Sign up')}
                    </Button>
                  </div>
                </CardFooter>
              </TabsContent>

              {/* Enhanced Registration Form */}
              <TabsContent value="register" className="space-y-6">
                <CardHeader className="space-y-3 pb-6">
                  <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {t('auth.registerTitle', 'Join Pickle+')}
                  </CardTitle>
                  <CardDescription className="text-center text-gray-700 text-lg font-medium">
                    {t('auth.registerDescription', 'Create your pickleball passport and start your journey')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                      {/* Enhanced Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                {t('auth.firstNameLabel', 'First Name')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('auth.firstNamePlaceholder', 'First name')}
                                  className="h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                {t('auth.lastNameLabel', 'Last Name')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('auth.lastNamePlaceholder', 'Last name')}
                                  className="h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  {...field}
                                  disabled={isLoading}
                                />
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
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              {t('auth.usernameLabel', 'Username')}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder={t('auth.usernamePlaceholder', 'Choose a username')}
                                  className="pl-10 h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              {t('auth.emailLabel', 'Email')}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input
                                  type="email"
                                  placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                                  className="pl-10 h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Enhanced Password Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                {t('auth.passwordLabel', 'Password')}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="password"
                                    placeholder={t('auth.passwordPlaceholder', 'Password')}
                                    className="pl-10 h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                {t('auth.confirmPasswordLabel', 'Confirm Password')}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="password"
                                    placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm password')}
                                    className="pl-10 h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
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

                      {/* Enhanced Optional Information Section */}
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {t('auth.optionalInfo', 'Optional Information')}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="yearOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700">
                                  {t('auth.yearOfBirthLabel', 'Year of Birth')}
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      placeholder="1990"
                                      className="pl-10 h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700">
                                  {t('auth.location', 'Country (Optional)')}
                                </FormLabel>
                                <FormControl>
                                  <CountrySelector 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Enhanced Pickleball Experience */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={registerForm.control}
                            name="playingSince"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700">
                                  {t('auth.playingSinceLabel', 'Playing Since')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 2020"
                                    className="h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                            name="skillLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-700">
                                  {t('auth.skillLevelLabel', 'Skill Level')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 3.5"
                                    className="h-13 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Enhanced Terms and Conditions */}
                      <FormField
                        control={registerForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-orange-200 p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50 backdrop-blur-sm">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 border-2 border-orange-300"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium text-gray-700">
                                {t('auth.agreeToTerms', 'I agree to the')}{' '}
                                <Button variant="link" size="sm" className="p-0 h-auto text-sm underline text-orange-600 hover:text-orange-800 font-semibold">
                                  {t('auth.termsAndConditions', 'Terms and Conditions')}
                                </Button>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                            {t('auth.creatingAccount', 'Creating account...')}
                          </>
                        ) : (
                          <>
                            <div className="mr-2">🚀</div>
                            {t('auth.createAccount', 'Create Account')}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>

                <CardFooter className="text-center px-6 pb-6">
                  <div className="text-sm">
                    <span className="text-gray-600">{t('auth.hasAccount', 'Already have an account?')} </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto font-bold text-orange-600 hover:text-orange-800 text-base"
                      onClick={() => setActiveTab("login")}
                    >
                      {t('auth.signIn', 'Sign in')}
                    </Button>
                  </div>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

        {/* Right Column - Enhanced Hero Section */}
        <div className="hidden lg:flex items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl scale-110"></div>
              <img 
                src={pickleLogoPath} 
                alt="Pickle+ Logo" 
                className="relative h-72 w-auto mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-6 leading-tight">
                {t('auth.heroTitle', 'Join the Global Pickleball Community')}
              </h2>
              <p className="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
                {t('auth.heroDescription', 'Connect with players worldwide, track your progress, and elevate your game with Pickle+.')}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-gray-700 bg-gradient-to-r from-white/80 to-orange-50/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-orange-200/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{t('auth.feature1', 'Track your rankings and achievements')}</span>
                </div>
                <div className="flex items-center gap-6 text-gray-700 bg-gradient-to-r from-white/80 to-orange-50/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-orange-200/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{t('auth.feature2', 'Connect with players near you')}</span>
                </div>
                <div className="flex items-center gap-6 text-gray-700 bg-gradient-to-r from-white/80 to-orange-50/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-orange-200/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{t('auth.feature3', 'Join tournaments and events')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}