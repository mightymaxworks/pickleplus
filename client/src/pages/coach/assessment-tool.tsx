/**
 * PCP Assessment Tool Page
 * 4-dimensional assessment system for coaches to evaluate players
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Target, 
  Brain, 
  Activity, 
  Heart,
  Save,
  Eye,
  Users,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AssessmentDimension {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  weight: number;
  description: string;
  criteria: string[];
}

interface AssessmentData {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  notes: {
    technical: string;
    tactical: string;
    physical: string;
    mental: string;
    overall: string;
  };
}

export default function CoachAssessmentToolPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    technical: 50,
    tactical: 50,
    physical: 50,
    mental: 50,
    notes: {
      technical: '',
      tactical: '',
      physical: '',
      mental: '',
      overall: ''
    }
  });

  // Get student ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const studentIdFromUrl = urlParams.get('student');

  // Fetch coach's students
  const { data: students } = useQuery({
    queryKey: ['/api/coach/students'],
    staleTime: 30000,
  });

  // Mock students data
  const mockStudents = [
    { id: 1, name: 'Sarah Johnson', level: '3.5' },
    { id: 2, name: 'Mike Chen', level: '4.0' },
    { id: 3, name: 'Emma Wilson', level: '3.0' }
  ];

  const availableStudents = students || mockStudents;

  // Assessment dimensions with PCP methodology
  const dimensions: AssessmentDimension[] = [
    {
      id: 'technical',
      name: 'Technical Skills',
      icon: <Target className="h-5 w-5" />,
      color: 'blue',
      weight: 40,
      description: 'Stroke mechanics, consistency, and technical fundamentals',
      criteria: [
        'Serve consistency and placement',
        'Forehand and backhand technique',
        'Volley and net play skills',
        'Return of serve quality',
        'Shot placement accuracy'
      ]
    },
    {
      id: 'tactical',
      name: 'Tactical Awareness',
      icon: <Brain className="h-5 w-5" />,
      color: 'purple',
      weight: 25,
      description: 'Game strategy, decision-making, and court positioning',
      criteria: [
        'Shot selection and timing',
        'Court positioning and movement',
        'Pattern recognition',
        'Opponent analysis',
        'Strategic adaptability'
      ]
    },
    {
      id: 'physical',
      name: 'Physical Fitness',
      icon: <Activity className="h-5 w-5" />,
      color: 'green',
      weight: 20,
      description: 'Athletic ability, movement, and physical conditioning',
      criteria: [
        'Speed and agility',
        'Endurance and stamina',
        'Balance and coordination',
        'Flexibility and mobility',
        'Recovery between points'
      ]
    },
    {
      id: 'mental',
      name: 'Mental Game',
      icon: <Heart className="h-5 w-5" />,
      color: 'orange',
      weight: 15,
      description: 'Mental toughness, focus, and competitive mindset',
      criteria: [
        'Focus and concentration',
        'Pressure handling',
        'Confidence and composure',
        'Competitive spirit',
        'Learning attitude'
      ]
    }
  ];

  // Save assessment mutation
  const saveAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/coach/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save assessment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Assessment Saved',
        description: 'Player assessment has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/students'] });
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Calculate overall PCP rating
  const calculateOverallRating = () => {
    return Math.round(
      (assessmentData.technical * 0.40) +
      (assessmentData.tactical * 0.25) +
      (assessmentData.physical * 0.20) +
      (assessmentData.mental * 0.15)
    );
  };

  const handleSaveAssessment = () => {
    if (!selectedStudent) {
      toast({
        title: 'Select Student',
        description: 'Please select a student to assess.',
        variant: 'destructive',
      });
      return;
    }

    const overallRating = calculateOverallRating();
    
    saveAssessmentMutation.mutate({
      studentId: selectedStudent,
      assessment: {
        ...assessmentData,
        overallRating,
        assessmentDate: new Date().toISOString(),
        coachId: 1 // This would come from auth context
      }
    });
  };

  // Set student from URL if provided
  React.useEffect(() => {
    if (studentIdFromUrl && !selectedStudent) {
      setSelectedStudent(parseInt(studentIdFromUrl));
    }
  }, [studentIdFromUrl, selectedStudent]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/coach/students')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PCP Assessment Tool</h1>
          <p className="text-gray-600">4-Dimensional Player Evaluation System</p>
        </div>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Student to Assess
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availableStudents.map((student: any) => (
              <Button
                key={student.id}
                variant={selectedStudent === student.id ? 'default' : 'outline'}
                className="h-auto p-4 justify-start"
                onClick={() => setSelectedStudent(student.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm opacity-70">Level {student.level}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          {/* Overall Rating Preview */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {calculateOverallRating()}/100
              </div>
              <div className="text-gray-600">Current PCP Rating</div>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                {dimensions.map((dim) => (
                  <div key={dim.id} className="text-center">
                    <div className="font-medium">{dim.weight}%</div>
                    <div className="text-gray-600">{dim.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Dimensions */}
          <div className="space-y-6">
            {dimensions.map((dimension) => (
              <Card key={dimension.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${dimension.color}-100 text-${dimension.color}-600`}>
                      {dimension.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {dimension.name}
                        <Badge variant="outline">{dimension.weight}% weight</Badge>
                      </div>
                      <div className="text-sm font-normal text-gray-600">
                        {dimension.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Criteria Checklist */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Assessment Criteria:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dimension.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          {criterion}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Rating: {assessmentData[dimension.id as keyof typeof assessmentData]}%
                      </label>
                      <div className="text-xs text-gray-500">
                        {assessmentData[dimension.id as keyof typeof assessmentData] < 30 ? 'Needs Development' :
                         assessmentData[dimension.id as keyof typeof assessmentData] < 60 ? 'Developing' :
                         assessmentData[dimension.id as keyof typeof assessmentData] < 80 ? 'Proficient' : 'Advanced'}
                      </div>
                    </div>
                    <Slider
                      value={[assessmentData[dimension.id as keyof typeof assessmentData] as number]}
                      onValueChange={(value) => 
                        setAssessmentData(prev => ({
                          ...prev,
                          [dimension.id]: value[0]
                        }))
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes & Observations:
                    </label>
                    <Textarea
                      placeholder={`Specific observations about ${dimension.name.toLowerCase()}...`}
                      value={assessmentData.notes[dimension.id as keyof typeof assessmentData.notes]}
                      onChange={(e) => 
                        setAssessmentData(prev => ({
                          ...prev,
                          notes: {
                            ...prev.notes,
                            [dimension.id]: e.target.value
                          }
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Overall performance summary, key strengths, areas for improvement, and recommended focus areas..."
                value={assessmentData.notes.overall}
                onChange={(e) => 
                  setAssessmentData(prev => ({
                    ...prev,
                    notes: {
                      ...prev.notes,
                      overall: e.target.value
                    }
                  }))
                }
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline"
              onClick={() => setLocation(`/coach/student/${selectedStudent}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Student Profile
            </Button>
            <Button 
              onClick={handleSaveAssessment}
              disabled={saveAssessmentMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveAssessmentMutation.isPending ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}