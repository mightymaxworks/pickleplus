/**
 * Coach Application Form
 * PKL-278651-COACH-001 - Sprint 1: Core Infrastructure & Application Flow
 * 
 * Multi-step coach application form with document upload and certification management
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Award,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  Plus,
  Info,
  Shield,
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Star
} from 'lucide-react';

interface CoachApplicationData {
  coachType: string;
  experienceYears: number;
  teachingPhilosophy: string;
  specializations: string[];
  availabilityData: Record<string, any>;
  availability?: string[];
  previousExperience: string;
  athleticBackground?: string;
  achievements?: string;
  hourlyRate?: number;
  groupRate?: number;
  references: Array<{
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  backgroundCheckConsent: boolean;
  termsAccepted?: boolean;
  codeOfConductAccepted?: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: Array<{
    certificationType: string;
    issuingOrganization: string;
    certificationNumber: string;
    issuedDate: string;
    expirationDate: string;
  }>;
}

export default function CoachApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<CoachApplicationData>({
    coachType: 'independent',
    experienceYears: 0,
    teachingPhilosophy: '',
    specializations: [],
    availabilityData: {},
    availability: [],
    previousExperience: '',
    athleticBackground: '',
    achievements: '',
    hourlyRate: 0,
    groupRate: 0,
    references: [{ name: '', email: '', phone: '', relationship: '' }],
    backgroundCheckConsent: false,
    termsAccepted: false,
    codeOfConductAccepted: false,
    emergencyContact: { name: '', phone: '', relationship: '' },
    certifications: []
  });

  const [pcpCertificationInterest, setPcpCertificationInterest] = useState(false);
  const [pcpCertificationEmail, setPcpCertificationEmail] = useState('');

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  // Coach type options
  const coachTypes = [
    { value: 'independent', label: 'Independent Coach', description: 'Teach privately and set your own rates' },
    { value: 'facility', label: 'Facility Coach', description: 'Work at specific facilities assigned by administrators' },
    { value: 'volunteer', label: 'Volunteer Coach', description: 'Teach community programs and beginner clinics' },
    { value: 'guest', label: 'Guest Coach', description: 'Occasional coaching for special events' }
  ];

  // Specialization options
  const specializationOptions = [
    'Singles Strategy',
    'Doubles Strategy', 
    'Beginner Fundamentals',
    'Advanced Techniques',
    'Serve & Return',
    'Third Shot Drop',
    'Dinking',
    'Volley Techniques',
    'Court Positioning',
    'Mental Game',
    'Youth Coaching',
    'Senior Coaching',
    'Tournament Preparation',
    'Injury Prevention'
  ];

  // Certification types
  const certificationTypes = [
    'PTR (Professional Tennis Registry)',
    'USAPA (USA Pickleball)',
    'IPF (International Pickleball Federation)',
    'IFP (International Federation of Pickleball)',
    'Custom/Other'
  ];

  // Form validation
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!applicationData.coachType) {
          toast({
            title: "Validation Error",
            description: "Please select a coach type",
            variant: "destructive"
          });
          return false;
        }
        if (!applicationData.experienceYears || applicationData.experienceYears < 1) {
          toast({
            title: "Validation Error", 
            description: "Please enter valid years of experience",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!applicationData.teachingPhilosophy || applicationData.teachingPhilosophy.length < 50) {
          toast({
            title: "Validation Error",
            description: "Teaching philosophy must be at least 50 characters",
            variant: "destructive"
          });
          return false;
        }
        if (applicationData.specializations.length === 0) {
          toast({
            title: "Validation Error",
            description: "Please select at least one specialization",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: CoachApplicationData) => {
      const response = await fetch('/api/coach/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teachingPhilosophy: data.teachingPhilosophy,
          experienceYears: data.experienceYears,
          specializations: data.specializations,
          previousExperience: data.previousExperience,
          availabilityData: data.availabilityData,
          achievements: data.achievements,
          individualRate: data.hourlyRate,
          groupRate: data.groupRate,
          backgroundCheckConsent: data.backgroundCheckConsent,
          certifications: data.certifications || [],
          pcpCertificationInterest: pcpCertificationInterest,
          pcpCertificationEmail: pcpCertificationEmail
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted Successfully!",
        description: "Your coach application has been submitted for review. You'll receive an email update within 2-3 business days.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/application/status'] });
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    const current = applicationData.specializations;
    const updated = current.includes(specialization)
      ? current.filter(s => s !== specialization)
      : [...current, specialization];
    
    handleInputChange('specializations', updated);
  };

  const addReference = () => {
    const newRef = { name: '', email: '', phone: '', relationship: '' };
    handleInputChange('references', [...applicationData.references, newRef]);
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = applicationData.references.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    );
    handleInputChange('references', updated);
  };

  const addCertification = () => {
    const newCert = {
      certificationType: '',
      issuingOrganization: '',
      certificationNumber: '',
      issuedDate: '',
      expirationDate: ''
    };
    handleInputChange('certifications', [...applicationData.certifications, newCert]);
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = applicationData.certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    handleInputChange('certifications', updated);
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return applicationData.experienceYears > 0;
      case 2:
        return applicationData.teachingPhilosophy.length > 50 && applicationData.specializations.length > 0;
      case 3:
        return applicationData.previousExperience.length > 20;
      case 4:
        return applicationData.hourlyRate && applicationData.hourlyRate > 0;
      case 5:
        return applicationData.backgroundCheckConsent && 
               applicationData.termsAccepted && 
               applicationData.codeOfConductAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      submitApplicationMutation.mutate(applicationData);
    }
  };

  if (!user) {
    return (
      <StandardLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You must be logged in to apply as a coach.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Become a Coach on Pickle+</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ready to share your passion for pickleball? Join our amazing coaching community and help players level up their game! 
            We'd love to learn more about you and get you started on this exciting journey.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you!</h2>
                  <p className="text-gray-600">First, tell us a bit about your pickleball background and coaching experience</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-emerald-900 mb-1">Welcome to our coaching family!</h3>
                        <p className="text-sm text-emerald-700">
                          As a coach on Pickle+, you'll be your own boss! Set your own rates, choose your schedule, and build your coaching business the way you want. We're here to support you every step of the way.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many years have you been playing or coaching pickleball? ⭐
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={applicationData.experienceYears || ''}
                      onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                      placeholder="Enter years of experience"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PCP Certification Promotion - Appears between Step 1 and 2 */}
            {currentStep === 2 && !pcpCertificationInterest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mb-8"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Award className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-900 mb-2">
                        PCP Coaching Certification Programme
                      </h3>
                      <p className="text-blue-800 mb-4">
                        Want to stand out as a top-tier coach? The PCP Coaching Certification Programme 
                        is the gold standard in pickleball instruction, recognized by facilities 
                        and players nationwide.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-blue-900">Benefits Include:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Higher coaching rates and credibility
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Access to exclusive coaching resources
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Priority placement in coach directories
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-blue-900">Program Features:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Comprehensive online coursework
                            </li>
                            <li className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Practical skill assessments
                            </li>
                            <li className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Ongoing education opportunities
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => setPcpCertificationInterest(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
                        >
                          I'm Interested
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPcpCertificationInterest(false)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm px-3 py-2"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PCP Certification Interest Form */}
            {currentStep === 2 && pcpCertificationInterest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mb-8"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">
                      Great choice! We'll keep you informed about PCP Certification
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email for certification updates (optional)
                      </label>
                      <Input
                        type="email"
                        value={pcpCertificationEmail}
                        onChange={(e) => setPcpCertificationEmail(e.target.value)}
                        placeholder={user?.email || "Enter your email address"}
                        className="max-w-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send you information about upcoming PCP certification courses and early bird discounts
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Continue Application */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <ArrowRight className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's continue with your application</h2>
                  <p className="text-gray-600">Ready to share more about your coaching style and experience</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Teaching Philosophy & Specializations */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <GraduationCap className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your coaching style?</h2>
                  <p className="text-gray-600">Tell us about your approach to helping players improve and what makes you special</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your coaching philosophy! 💡
                    </label>
                    <Textarea
                      value={applicationData.teachingPhilosophy}
                      onChange={(e) => handleInputChange('teachingPhilosophy', e.target.value)}
                      placeholder="What's your approach to teaching? How do you motivate players? What makes your coaching style unique? We'd love to hear your story!"
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {applicationData.teachingPhilosophy.length}/500 characters (minimum 50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What areas are you most excited to teach? (Select all that apply) 🏆
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specializationOptions.map((spec) => (
                        <div
                          key={spec}
                          onClick={() => handleSpecializationToggle(spec)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                            applicationData.specializations.includes(spec)
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium">{spec}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected: {applicationData.specializations.length} specializations
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Previous Experience */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <BookOpen className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Previous Experience</h2>
                  <p className="text-gray-600">Share your relevant coaching, teaching, or athletic experience</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Coaching/Teaching Experience
                    </label>
                    <Textarea
                      value={applicationData.previousExperience}
                      onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                      placeholder="Describe your previous coaching, teaching, or mentoring experience. Include sports coached, age groups, levels, and any notable achievements..."
                      className="min-h-32"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {applicationData.previousExperience.length}/500 characters (minimum 20 required)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Athletic Background
                    </label>
                    <Textarea
                      value={applicationData.athleticBackground || ''}
                      onChange={(e) => handleInputChange('athleticBackground', e.target.value)}
                      placeholder="Describe your athletic background, including any competitive experience in pickleball or other sports..."
                      className="min-h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        'Weekday Mornings',
                        'Weekday Afternoons', 
                        'Weekday Evenings',
                        'Weekend Mornings',
                        'Weekend Afternoons',
                        'Weekend Evenings'
                      ].map((time) => (
                        <label key={time} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={applicationData.availability?.includes(time) || false}
                            onChange={(e) => {
                              const current = applicationData.availability || [];
                              const updated = e.target.checked
                                ? [...current, time]
                                : current.filter(t => t !== time);
                              handleInputChange('availability', updated);
                            }}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: References & Emergency Contact */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Star className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Show off your achievements! 🏅</h2>
                  <p className="text-gray-600">Tell us about your accomplishments and set your coaching rates</p>
                </div>

                <div className="space-y-6">
                  {/* Achievements Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Achievements & Accolades
                    </label>
                    <Textarea
                      value={applicationData.achievements || ''}
                      onChange={(e) => handleInputChange('achievements', e.target.value)}
                      placeholder="Tell us about your accomplishments! Tournament wins, certifications, playing achievements, coaching successes, awards, or any other highlights you're proud of..."
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Optional - but we'd love to hear about what makes you special!
                    </p>
                  </div>

                  {/* Coaching Rates Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Individual Lesson Rate (per hour) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          min="20"
                          max="500"
                          value={applicationData.hourlyRate || ''}
                          onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                          placeholder="50"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Your rate for 1-on-1 coaching sessions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Lesson Rate (per hour)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          min="20"
                          max="300"
                          value={applicationData.groupRate || ''}
                          onChange={(e) => handleInputChange('groupRate', parseInt(e.target.value) || 0)}
                          placeholder="30"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Your rate for group coaching sessions</p>
                    </div>
                  </div>

                  {/* Rate Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">Rate Setting Tips</h3>
                        <p className="text-sm text-blue-700">
                          Consider your experience level, local market rates, and the value you provide. You can always adjust your rates later as you build your reputation on the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Legal & Background Check */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal & Background Check</h2>
                  <p className="text-gray-600">Complete required legal agreements and background check consent</p>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Info className="w-5 h-5 text-blue-600 mt-1" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 mb-1">Background Check Information</h3>
                        <p className="text-sm text-blue-700">
                          All coaches are required to complete a background check through our verified partner. 
                          This ensures the safety of all players in our community.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={applicationData.backgroundCheckConsent || false}
                        onChange={(e) => handleInputChange('backgroundCheckConsent', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Background Check Consent</span>
                        <p className="text-sm text-gray-600">
                          I consent to a background check being conducted as part of the coach application process.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={applicationData.termsAccepted || false}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Terms and Conditions</span>
                        <p className="text-sm text-gray-600">
                          I agree to the <a href="#" className="text-emerald-600 underline">coaching terms and conditions</a> and community guidelines.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={applicationData.codeOfConductAccepted || false}
                        onChange={(e) => handleInputChange('codeOfConductAccepted', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Code of Conduct</span>
                        <p className="text-sm text-gray-600">
                          I agree to uphold the <a href="#" className="text-emerald-600 underline">coach code of conduct</a> and maintain professional standards.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitApplicationMutation.isPending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitApplicationMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </StandardLayout>
  );
}