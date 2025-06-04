/**
 * PKL-278651-TRAINING-CENTER-001 - Training Center Check-In Interface
 * QR code scanning and session management for players and coaches
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  MapPin, 
  Clock, 
  User, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Award
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TrainingCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  qrCode: string;
  courtCount: number;
  operatingHours: any;
}

interface ActiveSession {
  id: number;
  center: string;
  coach: string;
  checkInTime: string;
  status: string;
  challengesCompleted: number;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  skillLevel: string;
  difficultyRating: number;
  estimatedDuration: number;
  instructions: string;
  coachingTips: string;
  successCriteria: string;
  badgeReward: string;
}

export default function TrainingCenterCheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeResults, setChallengeResults] = useState({
    isCompleted: false,
    successRate: 0,
    timeSpent: 0,
    coachNotes: ''
  });

  // Get available training centers
  const { data: centers = [] } = useQuery({
    queryKey: ['/api/training-center/locations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/training-center/locations');
      const data = await res.json();
      return data.centers;
    }
  });

  // Get active session for current user
  const { data: activeSession } = useQuery({
    queryKey: ['/api/training-center/session/active'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/training-center/session/active/1'); // TODO: Get actual user ID
      const data = await res.json();
      return data.activeSession;
    },
    refetchInterval: 30000 // Check every 30 seconds
  });

  // Get challenges by skill level
  const { data: challenges = [] } = useQuery({
    queryKey: ['/api/training-center/challenges', 'BEGINNER'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/training-center/challenges/by-level/BEGINNER');
      const data = await res.json();
      return data.challenges;
    },
    enabled: !!activeSession
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const res = await apiRequest('POST', '/api/training-center/checkin', {
        qrCode,
        playerId: 1 // TODO: Get actual user ID
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Check-in failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      console.log('Check-in successful:', data);
      if (data.success && data.session) {
        toast({
          title: "Check-in Successful! ✅",
          description: `Welcome to ${data.session.center}! Your coach is ${data.session.coach}.`,
        });
      } else {
        toast({
          title: "Check-in Complete",
          description: "You have successfully checked in to the training center.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/training-center/session/active'] });
      setQrCode('');
    },
    onError: (error: any) => {
      console.error('Check-in error:', error);
      toast({
        title: "Check-in Failed",
        description: error.message || "Unable to check in at this time",
        variant: "destructive"
      });
    }
  });

  // Complete challenge mutation
  const completeChallengeM = useMutation({
    mutationFn: async (challengeData: any) => {
      const res = await apiRequest('POST', '/api/training-center/challenge/complete', challengeData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.badgeAwarded ? "Challenge Complete - Badge Earned!" : "Challenge Complete",
        description: data.badgeAwarded 
          ? `You earned the ${data.badgeAwarded} badge!`
          : "Great job completing this challenge!"
      });
      setSelectedChallenge(null);
      setChallengeResults({
        isCompleted: false,
        successRate: 0,
        timeSpent: 0,
        coachNotes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/training-center/challenges'] });
    }
  });

  const handleCheckIn = () => {
    if (!qrCode.trim()) {
      toast({
        title: "QR Code Required",
        description: "Please enter or scan a training center QR code",
        variant: "destructive"
      });
      return;
    }
    checkInMutation.mutate(qrCode);
  };

  const handleCompleteChallenge = () => {
    if (!selectedChallenge || !activeSession) return;

    completeChallengeM.mutate({
      sessionId: activeSession.id,
      challengeId: selectedChallenge.id,
      playerId: 1, // TODO: Get actual user ID
      coachId: 1, // TODO: Get actual coach ID from session
      isCompleted: challengeResults.isCompleted,
      successRate: challengeResults.successRate,
      timeSpent: challengeResults.timeSpent,
      coachNotes: challengeResults.coachNotes
    });
  };

  if (activeSession) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Active Training Session
            </CardTitle>
            <CardDescription>
              You're checked in at {activeSession.center} with {activeSession.coach}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Check-in Time</div>
                <div className="font-medium">
                  {new Date(activeSession.checkInTime).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Challenges Completed</div>
                <div className="font-medium">{activeSession.challengesCompleted}</div>
              </div>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              {activeSession.status}
            </Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Available Challenges</TabsTrigger>
            <TabsTrigger value="progress">Session Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <div className="grid gap-4">
              {challenges.map((challenge: Challenge) => (
                <Card key={challenge.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {challenge.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Difficulty: {challenge.difficultyRating}/5
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {challenge.estimatedDuration} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {challenge.badgeReward}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Instructions:</strong> {challenge.instructions}
                      </div>
                      
                      <div className="text-sm text-blue-700">
                        <strong>Coaching Tips:</strong> {challenge.coachingTips}
                      </div>

                      <Button 
                        onClick={() => setSelectedChallenge(challenge)}
                        className="w-full"
                      >
                        Start Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
                <CardDescription>Your training progress today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Session Duration</span>
                      <span>
                        {Math.floor((Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000)} minutes
                      </span>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Challenges Completed</span>
                      <span>{activeSession.challengesCompleted}/5</span>
                    </div>
                    <Progress value={(activeSession.challengesCompleted / 5) * 100} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedChallenge && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Complete Challenge: {selectedChallenge.name}</CardTitle>
              <CardDescription>{selectedChallenge.successCriteria}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Success Rate (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={challengeResults.successRate}
                    onChange={(e) => setChallengeResults(prev => ({
                      ...prev,
                      successRate: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time Spent (minutes)</label>
                  <Input
                    type="number"
                    min="0"
                    value={challengeResults.timeSpent}
                    onChange={(e) => setChallengeResults(prev => ({
                      ...prev,
                      timeSpent: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Coach Notes</label>
                <Textarea
                  value={challengeResults.coachNotes}
                  onChange={(e) => setChallengeResults(prev => ({
                    ...prev,
                    coachNotes: e.target.value
                  }))}
                  placeholder="Coach observations and feedback..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={challengeResults.isCompleted}
                  onChange={(e) => setChallengeResults(prev => ({
                    ...prev,
                    isCompleted: e.target.checked
                  }))}
                />
                <label className="text-sm">Challenge completed successfully</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCompleteChallenge} disabled={completeChallengeM.isPending}>
                  Record Result
                </Button>
                <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Training Center Check-In
          </CardTitle>
          <CardDescription>
            Scan your training center QR code or enter it manually to start your session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">QR Code</label>
            <Input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter training center QR code (e.g., TC001-SG)"
            />
          </div>
          
          <Button 
            onClick={handleCheckIn} 
            disabled={checkInMutation.isPending}
            className="w-full"
          >
            {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Available Training Centers
          </CardTitle>
          <CardDescription>Find a training center near you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {centers.map((center: TrainingCenter) => (
              <Card key={center.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{center.name}</h3>
                    <p className="text-sm text-gray-600">{center.address}, {center.city}</p>
                    <p className="text-sm text-gray-500">{center.courtCount} courts available</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQrCode(center.qrCode);
                      // Auto-trigger check-in after setting QR code
                      setTimeout(() => {
                        checkInMutation.mutate(center.qrCode);
                      }, 100);
                    }}
                    disabled={checkInMutation.isPending}
                  >
                    {checkInMutation.isPending ? 'Checking In...' : 'Check In Here'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}