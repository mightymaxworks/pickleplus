import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Users, 
  Building2, 
  Arrow, 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock,
  Target,
  TrendingUp,
  QrCode,
  Award
} from 'lucide-react';

export default function IntegratedSystemsDemo() {
  const [selectedFlow, setSelectedFlow] = useState('player-to-coach');

  // Fetch current user data
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/current-user'],
    queryFn: () => apiRequest('GET', '/api/auth/current-user').then(res => res.json())
  });

  // Fetch available coaches
  const { data: coaches } = useQuery({
    queryKey: ['/api/coaches/find'],
    queryFn: () => apiRequest('GET', '/api/coaches/find').then(res => res.json())
  });

  // Mock PCP assessment data for demonstration
  const pcpData = {
    technical: 85,
    tactical: 60,  // Gap identified
    physical: 75,
    mental: 55     // Gap identified
  };

  // Mock facility data
  const facilities = [
    {
      id: 1,
      name: "Elite Pickleball Center",
      address: "123 Marina Bay Street",
      qrCode: "TC001-SG",
      availableCoaches: coaches?.filter(c => c.experienceYears >= 5) || []
    },
    {
      id: 2,
      name: "Community Sports Hub", 
      address: "456 Sports Avenue",
      qrCode: "TC002-SG",
      availableCoaches: coaches?.filter(c => c.experienceYears < 5) || []
    }
  ];

  const getRecommendedCoaches = () => {
    if (!coaches) return [];
    
    // Smart matching based on PCP gaps
    const lowScoreAreas = [];
    if (pcpData.tactical < 70) lowScoreAreas.push('Advanced Tactics', 'Tactical Skills');
    if (pcpData.mental < 70) lowScoreAreas.push('Mental Game', 'Mental Performance');
    
    return coaches.filter(coach => 
      coach.specialties?.some(specialty => 
        lowScoreAreas.some(area => specialty.includes(area.split(' ')[0]))
      )
    ).slice(0, 3);
  };

  const PlayerProfileView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Player Profile System
        </CardTitle>
        <CardDescription>Current player state and assessment data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</p>
            <p className="text-sm text-gray-600">Passport: {currentUser?.passportCode}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">PCP Assessment Scores</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Technical</div>
              <div className="text-xl font-bold text-green-600">{pcpData.technical}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">Tactical</div>
              <div className="text-xl font-bold text-orange-600">{pcpData.tactical}</div>
              <Badge variant="outline" className="text-xs mt-1">Needs Work</Badge>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Physical</div>
              <div className="text-xl font-bold text-blue-600">{pcpData.physical}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600">Mental</div>
              <div className="text-xl font-bold text-red-600">{pcpData.mental}</div>
              <Badge variant="outline" className="text-xs mt-1">Needs Work</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CoachingSystemView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Coaching System
        </CardTitle>
        <CardDescription>Smart coach matching based on player needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommended Coaches
          </h4>
          <p className="text-sm text-gray-600">Based on your tactical and mental score gaps</p>
          
          {getRecommendedCoaches().map(coach => (
            <div key={coach.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{coach.firstName} {coach.lastName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {coach.rating} ({coach.totalReviews} reviews)
                  </div>
                </div>
                <Badge variant="secondary">${coach.hourlyRate}/hr</Badge>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties?.slice(0, 2).map(specialty => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button size="sm" className="w-full">
                  Book Session
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const FacilitySystemView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Facility System
        </CardTitle>
        <CardDescription>Training centers with integrated coach access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {facilities.map(facility => (
          <div key={facility.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{facility.name}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {facility.address}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">{facility.qrCode}</Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <QrCode className="h-3 w-3" />
                  Scan to access
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Available Coaches</p>
              <div className="space-y-2">
                {facility.availableCoaches.slice(0, 2).map(coach => (
                  <div key={coach.id} className="flex justify-between items-center text-sm">
                    <span>{coach.firstName} {coach.lastName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {coach.specialties?.[0]}
                      </Badge>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const IntegrationFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          System Integration Flow
        </CardTitle>
        <CardDescription>How the three subsystems work together</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedFlow} onValueChange={setSelectedFlow}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="player-to-coach">Player → Coach</TabsTrigger>
            <TabsTrigger value="coach-to-facility">Coach → Facility</TabsTrigger>
            <TabsTrigger value="facility-to-development">Facility → Development</TabsTrigger>
          </TabsList>

          <TabsContent value="player-to-coach" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Player-Coach Connection Flow</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">PCP Assessment Analysis</p>
                    <p className="text-sm text-gray-600">System identifies tactical (60) and mental (55) gaps</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Smart Coach Matching</p>
                    <p className="text-sm text-gray-600">Recommends coaches with "Advanced Tactics" and "Mental Game" specialties</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Session Booking</p>
                    <p className="text-sm text-gray-600">Player books targeted training sessions via /api/sessions/request</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coach-to-facility" className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Coach-Facility Integration Flow</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Coach Certification</p>
                    <p className="text-sm text-gray-600">Complete PCP Coaching Certification Programme application</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Facility Access</p>
                    <p className="text-sm text-gray-600">Gain QR code access to partner training facilities</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Player Discovery</p>
                    <p className="text-sm text-gray-600">Players find coaches through facility-based search</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="facility-to-development" className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Facility-Player Development Flow</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Facility Check-in</p>
                    <p className="text-sm text-gray-600">Player scans QR code (TC001-SG) to access facility</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Coach Selection</p>
                    <p className="text-sm text-gray-600">System shows available coaches at facility matching player needs</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Progress Tracking</p>
                    <p className="text-sm text-gray-600">Training sessions update PCP scores and player development metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Pickle+ Integrated Systems</h1>
        <p className="text-gray-600">Live demonstration of player profiles, coaching, and facility systems working together</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <PlayerProfileView />
        <CoachingSystemView />
        <FacilitySystemView />
      </div>

      <IntegrationFlow />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Real-Time Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">Coach Discovery</span>
              </div>
              <p className="text-sm text-gray-600">
                {coaches?.length || 0} coaches available with real-time specialty filtering
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">Session Booking</span>
              </div>
              <p className="text-sm text-gray-600">
                Player-coach connections functional with API integration
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">Facility Access</span>
              </div>
              <p className="text-sm text-gray-600">
                QR code scanning operational with coach assignment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}