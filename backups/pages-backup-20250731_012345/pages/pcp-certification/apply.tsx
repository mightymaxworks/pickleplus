/**
 * PCP Certification Application Form
 * Multi-step application process for coaching certification
 */

import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Clock, 
  DollarSign, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  FileText,
  Target,
  CreditCard
} from 'lucide-react';

interface ApplicationData {
  motivation: string;
  experienceStatement: string;
  goals: string;
}

export default function PCPCertificationApplicationPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    motivation: '',
    experienceStatement: '',
    goals: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Fetch certification level details
  const { data: levelResponse, isLoading: levelLoading } = useQuery({
    queryKey: ['/api/pcp-certification/levels', levelId],
    queryFn: () => apiRequest('GET', `/api/pcp-certification/levels/${levelId}`).then(res => res.json()),
    enabled: !!levelId
  });

  const level = levelResponse?.data;

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const response = await apiRequest('POST', `/api/pcp-certification/apply/${levelId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your PCP certification application has been submitted successfully",
      });
      navigate('/pcp-certification');
      queryClient.invalidateQueries({ queryKey: ['/api/pcp-certification/my-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!applicationData.motivation || !applicationData.experienceStatement || !applicationData.goals) {
      toast({
        title: "Incomplete Application",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate(applicationData);
  };

  const handleFieldChange = (field: keyof ApplicationData, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              Please log in to apply for PCP certification
            </p>
            <Button onClick={() => navigate('/auth')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (levelLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading certification information...</p>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h3 className="font-semibold mb-2">Certification Level Not Found</h3>
            <Button onClick={() => navigate('/pcp-certification')}>
              Return to Certifications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StepOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Overview</h2>
        <p className="text-gray-600">
          You're applying for {level.levelName} certification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            {level.levelName}
          </CardTitle>
          <CardDescription>{level.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {level.duration <= 7 ? `${level.duration} day${level.duration > 1 ? 's' : ''}` : 
                 level.duration === 180 ? '6 months' : `${level.duration} days`} duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm">${(level.cost / 100).toFixed(0)} total cost</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Requirements</h4>
            <ul className="space-y-1">
              {level.requirements?.map((req: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Benefits</h4>
            <ul className="space-y-1">
              {level.benefits?.map((benefit: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StepMotivation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us Your Motivation</h2>
        <p className="text-gray-600">
          Help us understand why you want to become a PCP certified coach
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="motivation">Why do you want to pursue PCP certification? *</Label>
            <Textarea
              id="motivation"
              placeholder="Share your passion for coaching and how this certification aligns with your goals..."
              value={applicationData.motivation}
              onChange={(e) => handleFieldChange('motivation', e.target.value)}
              className="min-h-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StepExperience = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Experience</h2>
        <p className="text-gray-600">
          Tell us about your pickleball and coaching background
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="experience">Describe your pickleball and coaching experience *</Label>
            <Textarea
              id="experience"
              placeholder="Include your playing experience, any previous coaching, certifications, or relevant teaching background..."
              value={applicationData.experienceStatement}
              onChange={(e) => handleFieldChange('experienceStatement', e.target.value)}
              className="min-h-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StepGoals = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Goals</h2>
        <p className="text-gray-600">
          What do you hope to achieve with this certification?
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="goals">What are your coaching goals and aspirations? *</Label>
            <Textarea
              id="goals"
              placeholder="Describe what you hope to accomplish as a certified coach, your target students, and long-term vision..."
              value={applicationData.goals}
              onChange={(e) => handleFieldChange('goals', e.target.value)}
              className="min-h-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StepReview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">
          Please review your application before submitting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Certification Level</h4>
            <p className="text-sm text-gray-600">{level.levelName} ({level.levelCode})</p>
          </div>

          <div>
            <h4 className="font-semibold">Motivation</h4>
            <p className="text-sm text-gray-600">{applicationData.motivation}</p>
          </div>

          <div>
            <h4 className="font-semibold">Experience</h4>
            <p className="text-sm text-gray-600">{applicationData.experienceStatement}</p>
          </div>

          <div>
            <h4 className="font-semibold">Goals</h4>
            <p className="text-sm text-gray-600">{applicationData.goals}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Cost:</span>
              <span className="text-2xl font-bold">${(level.cost / 100).toFixed(0)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Payment will be processed after application approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <StepOverview />;
      case 2: return <StepMotivation />;
      case 3: return <StepExperience />;
      case 4: return <StepGoals />;
      case 5: return <StepReview />;
      default: return <StepOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/pcp-certification')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Certifications
            </Button>
            <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Application Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={submitApplicationMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}