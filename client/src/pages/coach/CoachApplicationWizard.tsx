import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  User, 
  Heart, 
  Calendar, 
  Users, 
  GraduationCap,
  Star,
  Clock,
  Trophy
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ApplicationData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  playingExperience: string;
  skillLevel: string;
  
  // Step 2: Coaching Motivation
  whyCoach: string;
  teachingExperience: string;
  coachingGoals: string;
  
  // Step 3: Availability & Commitment
  hoursPerWeek: string;
  preferredSchedule: string[];
  inPersonOnline: string;
  travelDistance: string;
  
  // Step 4: References & Background
  reference1Name: string;
  reference1Email: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Email: string;
  reference2Relationship: string;
  backgroundCheck: boolean;
  
  // Step 5: Level 1 Commitment
  understandsLevel1: boolean;
  commitsToCertification: boolean;
  agreesToTerms: boolean;
  additionalComments: string;
}

export default function CoachApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const totalSteps = 5;

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    playingExperience: '',
    skillLevel: '',
    whyCoach: '',
    teachingExperience: '',
    coachingGoals: '',
    hoursPerWeek: '',
    preferredSchedule: [],
    inPersonOnline: '',
    travelDistance: '',
    reference1Name: '',
    reference1Email: '',
    reference1Relationship: '',
    reference2Name: '',
    reference2Email: '',
    reference2Relationship: '',
    backgroundCheck: false,
    understandsLevel1: false,
    commitsToCertification: false,
    agreesToTerms: false,
    additionalComments: ''
  });

  const submitApplication = useMutation({
    mutationFn: (data: ApplicationData) =>
      apiRequest('POST', '/api/coach/application/submit', data),
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying. We'll review your application and get back to you within 3-5 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/application-status'] });
      setLocation('/coach');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const updateApplicationData = (updates: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitApplication.mutate(applicationData);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(applicationData.firstName && applicationData.lastName && 
                 applicationData.email && applicationData.skillLevel);
      case 2:
        return !!(applicationData.whyCoach && applicationData.coachingGoals);
      case 3:
        return !!(applicationData.hoursPerWeek && applicationData.inPersonOnline);
      case 4:
        return !!(applicationData.reference1Name && applicationData.reference1Email &&
                 applicationData.reference2Name && applicationData.reference2Email);
      case 5:
        return applicationData.understandsLevel1 && applicationData.commitsToCertification && 
               applicationData.agreesToTerms;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformationStep data={applicationData} onChange={updateApplicationData} />;
      case 2:
        return <CoachingMotivationStep data={applicationData} onChange={updateApplicationData} />;
      case 3:
        return <AvailabilityCommitmentStep data={applicationData} onChange={updateApplicationData} />;
      case 4:
        return <ReferencesBackgroundStep data={applicationData} onChange={updateApplicationData} />;
      case 5:
        return <Level1CommitmentStep data={applicationData} onChange={updateApplicationData} />;
      default:
        return null;
    }
  };

  const getStepIcon = (step: number) => {
    const icons = [User, Heart, Calendar, Users, GraduationCap];
    const Icon = icons[step - 1];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/coach')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Coach Hub
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Coach Application</h1>
        <p className="text-muted-foreground">Join our certified coaching community</p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
          
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${step < currentStep ? 'bg-green-600 border-green-600 text-white' :
                    step === currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-400'}
                `}>
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : getStepIcon(step)}
                </div>
                <span className={`text-xs hidden sm:block ${
                  step <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={previousStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {currentStep < totalSteps ? (
          <Button 
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep) || submitApplication.isPending}
          >
            {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
function PersonalInformationStep({ data, onChange }: { data: ApplicationData; onChange: (updates: Partial<ApplicationData>) => void }) {
  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information & Playing Experience
        </CardTitle>
        <CardDescription>
          Tell us about yourself and your pickleball background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Your last name"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="location">Location (City, State)</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g., Austin, TX"
          />
        </div>
        
        <div>
          <Label htmlFor="skillLevel">Current Skill Level *</Label>
          <Select value={data.skillLevel} onValueChange={(value) => onChange({ skillLevel: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2.5">2.5 - Novice</SelectItem>
              <SelectItem value="3.0">3.0 - Beginner</SelectItem>
              <SelectItem value="3.5">3.5 - Intermediate</SelectItem>
              <SelectItem value="4.0">4.0 - Advanced</SelectItem>
              <SelectItem value="4.5">4.5 - Expert</SelectItem>
              <SelectItem value="5.0">5.0+ - Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="playingExperience">Playing Experience</Label>
          <Textarea
            id="playingExperience"
            value={data.playingExperience}
            onChange={(e) => onChange({ playingExperience: e.target.value })}
            placeholder="How long have you been playing? What tournaments have you participated in? Any notable achievements?"
            rows={3}
          />
        </div>
      </CardContent>
    </div>
  );
}

function CoachingMotivationStep({ data, onChange }: { data: ApplicationData; onChange: (updates: Partial<ApplicationData>) => void }) {
  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Why You Want to Coach
        </CardTitle>
        <CardDescription>
          Help us understand your motivation and goals as a coach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="whyCoach">Why do you want to become a pickleball coach? *</Label>
          <Textarea
            id="whyCoach"
            value={data.whyCoach}
            onChange={(e) => onChange({ whyCoach: e.target.value })}
            placeholder="Share your passion for coaching and helping others improve their game..."
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="teachingExperience">Previous Teaching or Coaching Experience</Label>
          <Textarea
            id="teachingExperience"
            value={data.teachingExperience}
            onChange={(e) => onChange({ teachingExperience: e.target.value })}
            placeholder="Any experience teaching or coaching (sports, academics, professional training, etc.)"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="coachingGoals">What are your goals as a coach? *</Label>
          <Textarea
            id="coachingGoals"
            value={data.coachingGoals}
            onChange={(e) => onChange({ coachingGoals: e.target.value })}
            placeholder="What type of coaching do you want to do? What impact do you want to make?"
            rows={3}
          />
        </div>
      </CardContent>
    </div>
  );
}

function AvailabilityCommitmentStep({ data, onChange }: { data: ApplicationData; onChange: (updates: Partial<ApplicationData>) => void }) {
  const scheduleOptions = [
    'Early Morning (6-9 AM)',
    'Morning (9-12 PM)',
    'Afternoon (12-5 PM)',
    'Evening (5-8 PM)',
    'Weekends'
  ];

  const toggleSchedule = (option: string) => {
    const current = data.preferredSchedule || [];
    const updated = current.includes(option)
      ? current.filter(s => s !== option)
      : [...current, option];
    onChange({ preferredSchedule: updated });
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability & Time Commitment
        </CardTitle>
        <CardDescription>
          Let us know your availability and coaching preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="hoursPerWeek">How many hours per week can you dedicate to coaching? *</Label>
          <Select value={data.hoursPerWeek} onValueChange={(value) => onChange({ hoursPerWeek: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select hours per week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-5">1-5 hours</SelectItem>
              <SelectItem value="5-10">5-10 hours</SelectItem>
              <SelectItem value="10-20">10-20 hours</SelectItem>
              <SelectItem value="20+">20+ hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Preferred Coaching Schedule (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {scheduleOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={data.preferredSchedule?.includes(option) || false}
                  onCheckedChange={() => toggleSchedule(option)}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="inPersonOnline">Coaching Format Preference *</Label>
          <Select value={data.inPersonOnline} onValueChange={(value) => onChange({ inPersonOnline: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select coaching format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-person">In-person only</SelectItem>
              <SelectItem value="online">Online only</SelectItem>
              <SelectItem value="both">Both in-person and online</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="travelDistance">How far are you willing to travel for in-person coaching?</Label>
          <Select value={data.travelDistance} onValueChange={(value) => onChange({ travelDistance: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select travel distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
              <SelectItem value="50">Within 50 miles</SelectItem>
              <SelectItem value="any">Any distance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </div>
  );
}

function ReferencesBackgroundStep({ data, onChange }: { data: ApplicationData; onChange: (updates: Partial<ApplicationData>) => void }) {
  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          References & Background
        </CardTitle>
        <CardDescription>
          Please provide two references who can speak to your character and abilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Reference 1 *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reference1Name">Full Name</Label>
              <Input
                id="reference1Name"
                value={data.reference1Name}
                onChange={(e) => onChange({ reference1Name: e.target.value })}
                placeholder="Reference's full name"
              />
            </div>
            <div>
              <Label htmlFor="reference1Email">Email Address</Label>
              <Input
                id="reference1Email"
                type="email"
                value={data.reference1Email}
                onChange={(e) => onChange({ reference1Email: e.target.value })}
                placeholder="reference@email.com"
              />
            </div>
          </div>
          <div className="mt-2">
            <Label htmlFor="reference1Relationship">Relationship to You</Label>
            <Input
              id="reference1Relationship"
              value={data.reference1Relationship}
              onChange={(e) => onChange({ reference1Relationship: e.target.value })}
              placeholder="e.g., Former coach, playing partner, colleague"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Reference 2 *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reference2Name">Full Name</Label>
              <Input
                id="reference2Name"
                value={data.reference2Name}
                onChange={(e) => onChange({ reference2Name: e.target.value })}
                placeholder="Reference's full name"
              />
            </div>
            <div>
              <Label htmlFor="reference2Email">Email Address</Label>
              <Input
                id="reference2Email"
                type="email"
                value={data.reference2Email}
                onChange={(e) => onChange({ reference2Email: e.target.value })}
                placeholder="reference@email.com"
              />
            </div>
          </div>
          <div className="mt-2">
            <Label htmlFor="reference2Relationship">Relationship to You</Label>
            <Input
              id="reference2Relationship"
              value={data.reference2Relationship}
              onChange={(e) => onChange({ reference2Relationship: e.target.value })}
              placeholder="e.g., Former coach, playing partner, colleague"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="backgroundCheck"
            checked={data.backgroundCheck}
            onCheckedChange={(checked) => onChange({ backgroundCheck: !!checked })}
          />
          <Label htmlFor="backgroundCheck" className="text-sm">
            I consent to a background check if required for coaching certification
          </Label>
        </div>
      </CardContent>
    </div>
  );
}

function Level1CommitmentStep({ data, onChange }: { data: ApplicationData; onChange: (updates: Partial<ApplicationData>) => void }) {
  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Level 1 Certification Commitment
        </CardTitle>
        <CardDescription>
          Confirm your understanding and commitment to our certification program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Level 1: Coaching Fundamentals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Duration:</div>
              <div className="text-muted-foreground">2-3 weeks</div>
            </div>
            <div>
              <div className="font-medium">Cost:</div>
              <div className="text-muted-foreground">$699</div>
            </div>
            <div>
              <div className="font-medium">Format:</div>
              <div className="text-muted-foreground">Online study + exam</div>
            </div>
            <div>
              <div className="font-medium">Requirements:</div>
              <div className="text-muted-foreground">80% exam pass rate</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="understandsLevel1"
              checked={data.understandsLevel1}
              onCheckedChange={(checked) => onChange({ understandsLevel1: !!checked })}
            />
            <Label htmlFor="understandsLevel1" className="text-sm leading-relaxed">
              I understand that all coaches must start with Level 1 certification regardless of experience, 
              and that level skipping requires administrator approval on a case-by-case basis
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="commitsToCertification"
              checked={data.commitsToCertification}
              onCheckedChange={(checked) => onChange({ commitsToCertification: !!checked })}
            />
            <Label htmlFor="commitsToCertification" className="text-sm leading-relaxed">
              I commit to completing the Level 1 certification within 30 days of approval and understand 
              the $699 certification fee
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreesToTerms"
              checked={data.agreesToTerms}
              onCheckedChange={(checked) => onChange({ agreesToTerms: !!checked })}
            />
            <Label htmlFor="agreesToTerms" className="text-sm leading-relaxed">
              I agree to maintain professional standards, provide quality coaching services, 
              and uphold the Pickle+ coaching community values
            </Label>
          </div>
        </div>
        
        <div>
          <Label htmlFor="additionalComments">Additional Comments or Questions</Label>
          <Textarea
            id="additionalComments"
            value={data.additionalComments}
            onChange={(e) => onChange({ additionalComments: e.target.value })}
            placeholder="Any additional information you'd like to share..."
            rows={3}
          />
        </div>
      </CardContent>
    </div>
  );
}

function getStepTitle(step: number): string {
  const titles = [
    'Personal Info',
    'Motivation',
    'Availability',
    'References',
    'Commitment'
  ];
  return titles[step - 1] || `Step ${step}`;
}