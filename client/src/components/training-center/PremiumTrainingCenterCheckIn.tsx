/**
 * Premium Training Center Experience - Passport Style Interface
 * Sophisticated design matching the passport aesthetic
 */

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  Users, 
  Trophy, 
  QrCode,
  CheckCircle,
  UserCheck,
  Star,
  DollarSign,
  Zap,
  Shield,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  Clock3,
  MapPinned,
  Building2,
  Crown,
  Flame
} from 'lucide-react';

interface CheckInResponse {
  success: boolean;
  center: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
  availableCoaches: Array<{
    id: number;
    name: string;
    specializations: string[];
    hourlyRate: number;
  }>;
}

interface SessionResponse {
  success: boolean;
  session: {
    id: number;
    center: string;
    coach: string;
    checkInTime: string;
    status: string;
    challengesCompleted: number;
  };
}

export default function PremiumTrainingCenterCheckIn() {
  const [qrCode, setQrCode] = useState('');
  const [checkedInCenter, setCheckedInCenter] = useState<CheckInResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available training centers
  const { data: centers } = useQuery({
    queryKey: ['/api/training-center/locations'],
  });

  // Get active session
  const { data: activeSessionData } = useQuery({
    queryKey: ['/api/training-center/session/active/1'],
    refetchInterval: 30000,
  });

  // Location check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest('POST', '/api/training-center/checkin', {
        qrCode,
        playerId: 1
      });
      return response.json();
    },
    onSuccess: (data: CheckInResponse) => {
      setCheckedInCenter(data);
      toast({
        title: "🏆 Elite Access Granted",
        description: `Welcome to ${data.center.name}! Select your preferred coach to begin your Player Development Hub training experience.`,
      });
      setQrCode('');
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: error.message || "Unable to access Player Development Hub facility",
        variant: "destructive"
      });
    }
  });

  // Coach selection mutation
  const selectCoachMutation = useMutation({
    mutationFn: async (coachId: number) => {
      if (!checkedInCenter) throw new Error('No center selected');
      
      const response = await apiRequest('POST', '/api/training-center/select-coach', {
        centerId: checkedInCenter.center.id,
        coachId,
        playerId: 1
      });
      return response.json();
    },
    onSuccess: (data: SessionResponse) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-center/session/active/1'] });
      toast({
        title: "🎯 Session Activated",
        description: `Your Player Development Hub training session with ${data.session.coach} has begun!`,
      });
      setCheckedInCenter(null);
    },
    onError: (error: any) => {
      toast({
        title: "Session Failed",
        description: error.message || "Unable to start training session",
        variant: "destructive"
      });
    }
  });

  const handleCheckIn = () => {
    if (!qrCode.trim()) {
      toast({
        title: "QR Code Required",
        description: "Please enter a valid facility access code",
        variant: "destructive"
      });
      return;
    }
    checkInMutation.mutate(qrCode);
  };

  const handleCoachSelection = (coachId: number) => {
    selectCoachMutation.mutate(coachId);
  };

  const activeSession = activeSessionData?.activeSession;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/50">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Player Development Hub
            </h1>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Connect with certified coaches at Player Development Hub facilities for personalized training
          </p>
        </div>

        {/* Active Session Display */}
        {activeSession && (
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Active Training Session</CardTitle>
                    <CardDescription className="text-emerald-100">
                      Session in progress at {activeSession.center}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Crown className="h-4 w-4 mr-1" />
                  Premium
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-emerald-200" />
                  <div>
                    <p className="font-medium">Coach</p>
                    <p className="text-emerald-100">{activeSession.coach}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock3 className="h-5 w-5 text-emerald-200" />
                  <div>
                    <p className="font-medium">Started</p>
                    <p className="text-emerald-100">
                      {new Date(activeSession.checkInTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-emerald-200" />
                  <div>
                    <p className="font-medium">Challenges</p>
                    <p className="text-emerald-100">{activeSession.challengesCompleted} completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coach Selection Interface */}
        {checkedInCenter && (
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <MapPinned className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {checkedInCenter.center.name}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {checkedInCenter.center.address}, {checkedInCenter.center.city}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-6">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Select Your Elite Coach
                  </h3>
                </div>
                
                <div className="grid gap-4">
                  {checkedInCenter.availableCoaches.map((coach) => (
                    <Card 
                      key={coach.id} 
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-slate-200 bg-gradient-to-r from-white to-slate-50"
                      onClick={() => handleCoachSelection(coach.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{coach.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {coach.specializations.slice(0, 2).map((spec, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="text-xs bg-blue-100 text-blue-700"
                                  >
                                    {spec}
                                  </Badge>
                                ))}
                                {coach.specializations.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{coach.specializations.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-slate-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold">{coach.hourlyRate}</span>
                              <span className="text-sm">/hr</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facility Access */}
        {!checkedInCenter && !activeSession && (
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Facility Access</CardTitle>
                <CardDescription className="text-slate-600">
                  Scan your facility QR code to begin your Player Development Hub training experience
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md mx-auto space-y-4">
                <Input
                  placeholder="Enter facility access code (e.g., TC001-SG)"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="text-center text-lg h-12 border-slate-300 focus:border-blue-500"
                />
                <Button 
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending || !qrCode.trim()}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                >
                  {checkInMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Accessing Facility...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Access Player Development Hub</span>
                    </div>
                  )}
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Available Centers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Available Development Centers</span>
                </h3>
                <div className="grid gap-3">
                  {centers?.centers?.map((center: any) => (
                    <Card key={center.id} className="bg-gradient-to-r from-slate-50 to-white border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">{center.name}</h4>
                              <p className="text-sm text-slate-600">{center.address}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{center.courtCount} courts</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>{center.operatingHours.open}-{center.operatingHours.close}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}