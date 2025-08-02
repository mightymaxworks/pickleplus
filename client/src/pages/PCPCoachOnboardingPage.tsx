/**
 * PCP Coach Onboarding Page
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Streamlined onboarding flow for PCP-certified coaches with immediate full platform access
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  GraduationCap, 
  Trophy, 
  CheckCircle, 
  Star, 
  Users, 
  Calendar,
  DollarSign,
  MessageCircle,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react';

// PCP Level Configuration for UI
const PCP_LEVEL_CONFIG = {
  1: { name: 'Entry Coach', badge: '🥉', commission: 15, cost: 699, color: 'bg-amber-100 text-amber-800' },
  2: { name: 'Certified Coach', badge: '🥈', commission: 13, cost: 1299, color: 'bg-gray-100 text-gray-800' },
  3: { name: 'Advanced Coach', badge: '🥇', commission: 12, cost: 2499, color: 'bg-yellow-100 text-yellow-800' },
  4: { name: 'Master Coach', badge: '💎', commission: 10, cost: 4999, color: 'bg-blue-100 text-blue-800' },
  5: { name: 'Grand Master', badge: '👑', commission: 8, cost: 7999, color: 'bg-purple-100 text-purple-800' }
};

// Form validation schema
const pcpCoachOnboardingSchema = z.object({
  // PCP Certification Details
  pcpLevel: z.number().min(1).max(5),
  pcpCertificationNumber: z.string().min(1, 'Certification number is required'),
  pcpCertifiedAt: z.string().min(1, 'Certification date is required'),
  pcpExpiresAt: z.string().optional(),
  
  // Basic Profile Information
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
  coachingPhilosophy: z.string().min(30, 'Coaching philosophy must be at least 30 characters').max(500),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  teachingStyle: z.string().min(20, 'Teaching style must be at least 20 characters').max(300),
  languagesSpoken: z.array(z.string()).default(['English']),
  
  // Session & Pricing Setup
  hourlyRate: z.number().min(50, 'Minimum rate is $50/hour').max(300, 'Maximum rate is $300/hour'),
  sessionTypes: z.array(z.string()).min(1, 'Select at least one session type'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone number required'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required')
});

type PCPCoachOnboardingForm = z.infer<typeof pcpCoachOnboardingSchema>;

const specializations = [
  'Beginner Instruction',
  'Advanced Strategy',
  'Tournament Preparation',
  'Youth Development',
  'Senior Programs',
  'Doubles Strategy',
  'Singles Strategy',
  'Mental Game',
  'Fitness & Conditioning',
  'Injury Prevention'
];

const sessionTypes = [
  { value: 'individual', label: 'Individual Lessons' },
  { value: 'group', label: 'Group Sessions' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'assessment', label: 'Player Assessments' }
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean', 'Other'
];

export default function PCPCoachOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<PCPCoachOnboardingForm>({
    resolver: zodResolver(pcpCoachOnboardingSchema),
    defaultValues: {
      pcpLevel: 1,
      languagesSpoken: ['English'],
      specializations: [],
      sessionTypes: [],
      hourlyRate: 95
    },
    mode: 'onChange'
  });

  const pcpLevel = watch('pcpLevel');
  const selectedSpecializations = watch('specializations') || [];
  const selectedSessionTypes = watch('sessionTypes') || [];
  const selectedLanguages = watch('languagesSpoken') || [];

  const registerCoachMutation = useMutation({
    mutationFn: async (data: PCPCoachOnboardingForm) => {
      const payload = {
        ...data,
        hourlyRate: data.hourlyRate * 100, // Convert to cents
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship
        }
      };
      
      const response = await apiRequest('POST', '/api/pcp-coach/register', payload);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to Pickle+!",
        description: data.message,
        duration: 5000
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setLocation('/coach/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PCPCoachOnboardingForm) => {
    registerCoachMutation.mutate(data);
  };

  const currentConfig = PCP_LEVEL_CONFIG[pcpLevel as keyof typeof PCP_LEVEL_CONFIG];
  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container max-w-4xl py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-lg">PCP COACH ONBOARDING</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Complete Your Coach Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock full platform access with your comprehensive basic tier profile
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* PCP Level Display */}
        {currentConfig && (
          <Card className="mb-8 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{currentConfig.badge}</div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800">{currentConfig.name}</h3>
                    <p className="text-emerald-600">PCP Level {pcpLevel} Certification</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-700">{currentConfig.commission}%</div>
                  <div className="text-sm text-emerald-600">Commission Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comprehensive Basic Tier Benefits */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Your Comprehensive Basic Tier Benefits
            </CardTitle>
            <CardDescription>
              Full platform access included with your PCP certification - no session limits!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Unlimited Sessions', desc: 'No monthly limits' },
                { icon: Trophy, label: 'Full Profile', desc: 'Complete coaching bio' },
                { icon: TrendingUp, label: 'Basic Analytics', desc: 'Track performance' },
                { icon: MessageCircle, label: 'Student Messaging', desc: 'Direct communication' },
                { icon: DollarSign, label: 'Standard Payments', desc: 'Secure processing' },
                { icon: Shield, label: 'Mobile App Access', desc: 'Full functionality' },
                { icon: Calendar, label: 'Scheduling Tools', desc: 'Manage availability' },
                { icon: Award, label: 'Community Access', desc: 'Coach network' }
              ].map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center p-3 bg-white/50 rounded-lg">
                  <benefit.icon className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="font-semibold text-sm">{benefit.label}</div>
                  <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Form */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Coach Registration</CardTitle>
            <CardDescription>
              Set up your profile to start coaching immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: PCP Certification Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">PCP Certification Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pcpLevel">PCP Level</Label>
                      <Select onValueChange={(value) => setValue('pcpLevel', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your PCP level" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PCP_LEVEL_CONFIG).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              {config.badge} Level {level} - {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.pcpLevel && <p className="text-sm text-red-600 mt-1">{errors.pcpLevel.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="pcpCertificationNumber">Certification Number</Label>
                      <Input 
                        {...register('pcpCertificationNumber')}
                        placeholder="e.g., PCP-L1-2024-001234"
                      />
                      {errors.pcpCertificationNumber && <p className="text-sm text-red-600 mt-1">{errors.pcpCertificationNumber.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pcpCertifiedAt">Certification Date</Label>
                      <Input 
                        type="date" 
                        {...register('pcpCertifiedAt')}
                      />
                      {errors.pcpCertifiedAt && <p className="text-sm text-red-600 mt-1">{errors.pcpCertifiedAt.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="pcpExpiresAt">Expiration Date (Optional)</Label>
                      <Input 
                        type="date" 
                        {...register('pcpExpiresAt')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea 
                      {...register('bio')}
                      placeholder="Tell students about your coaching background, experience, and what makes you unique..."
                      rows={4}
                    />
                    {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="coachingPhilosophy">Coaching Philosophy</Label>
                    <Textarea 
                      {...register('coachingPhilosophy')}
                      placeholder="Describe your coaching approach and philosophy..."
                      rows={3}
                    />
                    {errors.coachingPhilosophy && <p className="text-sm text-red-600 mt-1">{errors.coachingPhilosophy.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="teachingStyle">Teaching Style</Label>
                    <Textarea 
                      {...register('teachingStyle')}
                      placeholder="How do you structure lessons and interact with students?"
                      rows={2}
                    />
                    {errors.teachingStyle && <p className="text-sm text-red-600 mt-1">{errors.teachingStyle.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="profileImageUrl">Profile Image URL (Optional)</Label>
                    <Input 
                      {...register('profileImageUrl')}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Specializations & Services */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Specializations & Services</h3>
                  
                  <div>
                    <Label>Coaching Specializations</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {specializations.map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            id={spec}
                            checked={selectedSpecializations.includes(spec)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setValue('specializations', [...selectedSpecializations, spec]);
                              } else {
                                setValue('specializations', selectedSpecializations.filter(s => s !== spec));
                              }
                            }}
                          />
                          <Label htmlFor={spec} className="text-sm">{spec}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.specializations && <p className="text-sm text-red-600 mt-1">{errors.specializations.message}</p>}
                  </div>
                  
                  <div>
                    <Label>Session Types Offered</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {sessionTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={type.value}
                            checked={selectedSessionTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setValue('sessionTypes', [...selectedSessionTypes, type.value]);
                              } else {
                                setValue('sessionTypes', selectedSessionTypes.filter(s => s !== type.value));
                              }
                            }}
                          />
                          <Label htmlFor={type.value} className="text-sm">{type.label}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.sessionTypes && <p className="text-sm text-red-600 mt-1">{errors.sessionTypes.message}</p>}
                  </div>
                  
                  <div>
                    <Label>Languages Spoken</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {languages.map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={lang}
                            checked={selectedLanguages.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setValue('languagesSpoken', [...selectedLanguages, lang]);
                              } else {
                                setValue('languagesSpoken', selectedLanguages.filter(l => l !== lang));
                              }
                            }}
                          />
                          <Label htmlFor={lang} className="text-sm">{lang}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                    <Input 
                      type="number" 
                      {...register('hourlyRate', { valueAsNumber: true })}
                      min="50"
                      max="300"
                      step="5"
                    />
                    {errors.hourlyRate && <p className="text-sm text-red-600 mt-1">{errors.hourlyRate.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 4: Emergency Contact */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input {...register('emergencyContactName')} />
                      {errors.emergencyContactName && <p className="text-sm text-red-600 mt-1">{errors.emergencyContactName.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                      <Input {...register('emergencyContactPhone')} />
                      {errors.emergencyContactPhone && <p className="text-sm text-red-600 mt-1">{errors.emergencyContactPhone.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input 
                      {...register('emergencyContactRelationship')}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                    {errors.emergencyContactRelationship && <p className="text-sm text-red-600 mt-1">{errors.emergencyContactRelationship.message}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={registerCoachMutation.isPending || !isValid}
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                  >
                    {registerCoachMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Profile...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete Registration
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Premium Upgrade Teaser */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-purple-800 mb-2">Ready to Scale Your Coaching Business?</h3>
              <p className="text-purple-600 mb-4">
                Upgrade to Premium Business Tools for $19.99/month after registration
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <Badge variant="outline" className="border-purple-300 text-purple-700">Automated Payouts</Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">Advanced Analytics</Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">Marketing Tools</Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">Video Sessions</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}