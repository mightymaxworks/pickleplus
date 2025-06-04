/**
 * Training Center Management Hub with Calendar Integration
 * Complete interface for QR check-in, individual coaching, and class scheduling
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import TrainingCalendar from '@/components/training-center/TrainingCalendar';
import StreamlinedBookingFlow from '@/components/training-center/StreamlinedBookingFlow';
import { 
  QrCode, 
  User, 
  Calendar, 
  Building2,
  MapPin,
  Clock,
  Users,
  Trophy,
  Star,
  CheckCircle,
  Play,
  Zap
} from 'lucide-react';

export default function TrainingCenterTabsPage() {
  const [qrCode, setQrCode] = useState('');
  const [checkedInCenter, setCheckedInCenter] = useState<any>(null);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // QR Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest('POST', '/api/training-center/checkin', { qrCode });
      return response.json();
    },
    onSuccess: (data) => {
      setCheckedInCenter(data);
      toast({
        title: "Check-in Successful!",
        description: `Welcome to ${data.center.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/training-center'] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleQrCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      toast({
        title: "QR Code Required",
        description: "Please enter a QR code to check in",
        variant: "destructive",
      });
      return;
    }
    checkInMutation.mutate(qrCode.trim());
  };

  const handleCoachSelection = (coach: any) => {
    setSelectedCoach(coach);
    toast({
      title: "Coach Selected",
      description: `Ready to begin session with ${coach.name}`,
    });
  };

  return (
    <StandardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Training Center Hub
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Elite pickleball training facilities with professional coaching and advance class booking
            </p>
          </div>

          {/* Main Interface with Tabs */}
          <Tabs defaultValue="checkin" className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="checkin" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Check-In</span>
              </TabsTrigger>
              <TabsTrigger value="individual" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Individual Coaching</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Class Schedule</span>
              </TabsTrigger>
            </TabsList>

            {/* Check-In Tab */}
            <TabsContent value="checkin" className="space-y-6">
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <QrCode className="w-6 h-6 text-blue-600" />
                    <span>Facility Check-In</span>
                  </CardTitle>
                  <CardDescription>
                    Scan or enter your facility QR code to access training center services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleQrCheckIn} className="space-y-4">
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Enter QR code (e.g., TC001-SG)"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={checkInMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {checkInMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check In
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Quick Access QR Codes */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setQrCode('TC001-SG')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div className="text-center">
                        <div className="font-semibold">Singapore Elite</div>
                        <div className="text-sm text-slate-500">TC001-SG</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setQrCode('TC002-SG')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Building2 className="w-6 h-6 text-indigo-600" />
                      <div className="text-center">
                        <div className="font-semibold">Marina Bay Pro</div>
                        <div className="text-sm text-slate-500">TC002-SG</div>
                      </div>
                    </Button>
                  </div>

                  {/* Check-in Status */}
                  {checkedInCenter && (
                    <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">
                            Checked in to {checkedInCenter.center.name}
                          </h3>
                          <p className="text-sm text-green-600">
                            {checkedInCenter.center.address}, {checkedInCenter.center.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">
                        Ready to begin your training session!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual Coaching Tab */}
            <TabsContent value="individual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <span>Individual Coaching Sessions</span>
                  </CardTitle>
                  <CardDescription>
                    Select a professional coach for personalized training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {checkedInCenter?.availableCoaches ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {checkedInCenter.availableCoaches.map((coach: any) => (
                        <Card 
                          key={coach.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedCoach?.id === coach.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => handleCoachSelection(coach)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                {coach.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">{coach.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    ${coach.hourlyRate}/hr
                                  </Badge>
                                  <div className="flex items-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {coach.specializations.slice(0, 2).map((spec: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <User className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p>Please check in to a training center first to see available coaches</p>
                    </div>
                  )}

                  {selectedCoach && (
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-blue-800">
                            Ready to start session with {selectedCoach.name}
                          </h3>
                          <p className="text-sm text-blue-600">
                            ${selectedCoach.hourlyRate}/hour • Professional Coaching
                          </p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Play className="w-4 h-4 mr-2" />
                          Begin Session
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>Class Schedule & Booking</span>
                  </CardTitle>
                  <CardDescription>
                    Browse and book group classes in advance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {checkedInCenter ? (
                    <TrainingCalendar 
                      centerId={checkedInCenter.center.id}
                      centerName={checkedInCenter.center.name}
                      userId={1} // Current user ID
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">Check in to view class schedule</h3>
                      <p>Please check in to a training center first to see available classes and book sessions</p>
                      <div className="mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => document.querySelector('[value="checkin"]')?.click()}
                          className="mx-auto"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Go to Check-In
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StandardLayout>
  );
}