/**
 * PKL-278651-PLAYER-DEVELOPMENT-HUB - Player Development Hub
 * Complete training center management with refined booking flow:
 * 1. Facility selection (QR scan/code entry/dropdown)
 * 2. Detailed weekly calendar view
 * 3. Class selection with limits and minimums
 * 4. Coach credentials and class details
 * 5. Payment and registration
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, 
  User, 
  Calendar, 
  Building2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  Award,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertTriangle
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";

interface TrainingCenter {
  id: number;
  name: string;
  address: string;
  qrCode: string;
}

interface ClassDetails {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  skill_level: string;
  max_participants: number;
  min_participants: number;
  current_enrollment: number;
  price_per_session: number;
  coach_name: string;
  coach_id: number;
  coach_bio: string;
  coach_certifications: string[];
  coach_rating: number;
  coach_reviews_count: number;
  goals: string[];
  category: string;
  date: string;
  status: 'available' | 'full' | 'cancelled' | 'minimum_not_met';
}

export default function PlayerDevelopmentHub() {
  const [activeTab, setActiveTab] = useState('facility-selection');
  const [facilityInput, setFacilityInput] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<TrainingCenter | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available training centers
  const { data: trainingCenters = [] } = useQuery({
    queryKey: ['/api/calendar/training-centers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/calendar/training-centers');
      return response.json();
    }
  });

  // Weekly schedule for selected facility
  const { data: weeklySchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: [`/api/calendar/weekly-schedule/${selectedFacility?.id}`, format(currentWeek, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!selectedFacility) return {};
      const response = await apiRequest('GET', `/api/calendar/weekly-schedule/${selectedFacility.id}?week=${format(currentWeek, 'yyyy-MM-dd')}`);
      return response.json();
    },
    enabled: !!selectedFacility
  });

  // Facility check-in mutation
  const facilityCheckIn = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest('POST', '/api/training-center/checkin', { 
        qrCode: input.startsWith('TC') ? input : undefined,
        facilityId: !input.startsWith('TC') ? parseInt(input) : undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedFacility(data.center);
      setActiveTab('weekly-calendar');
      toast({
        title: "Facility Access Granted",
        description: `Welcome to ${data.center.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Access Failed",
        description: error.message || "Could not access facility",
        variant: "destructive",
      });
    }
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await apiRequest('POST', `/api/calendar/classes/${classId}/enroll`, {
        enrollmentType: 'advance'
      });
      return response.json();
    },
    onSuccess: () => {
      setActiveTab('booking-confirmed');
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in the class. Payment confirmation sent to your email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/weekly-schedule'] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in class",
        variant: "destructive",
      });
    }
  });

  const handleFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facilityInput.trim()) {
      facilityCheckIn.mutate(facilityInput.trim());
    }
  };

  const handleFacilitySelect = (facilityId: string) => {
    const facility = trainingCenters.find((c: TrainingCenter) => c.id.toString() === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setActiveTab('weekly-calendar');
      toast({
        title: "Facility Selected",
        description: `Accessing ${facility.name}`,
      });
    }
  };

  const handleClassSelection = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
    setActiveTab('class-details');
  };

  const handleConfirmBooking = () => {
    if (selectedClass) {
      enrollMutation.mutate(selectedClass.id);
    }
  };

  const getClassStatusBadge = (classItem: ClassDetails) => {
    const { current_enrollment, max_participants, min_participants, status } = classItem;
    
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    if (current_enrollment >= max_participants) {
      return <Badge variant="destructive">Full</Badge>;
    }
    
    if (current_enrollment < min_participants) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300">
        Need {min_participants - current_enrollment} more
      </Badge>;
    }
    
    const spotsLeft = max_participants - current_enrollment;
    if (spotsLeft <= 2) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">
        {spotsLeft} spots left
      </Badge>;
    }
    
    return <Badge variant="outline" className="text-green-600 border-green-300">Available</Badge>;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <StandardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 mr-3" />
              <h1 className="text-4xl font-bold">Player Development Hub</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Complete training center management with facility selection, detailed scheduling, 
              class limits, and coach credentials
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="facility-selection" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Facility Selection</span>
              </TabsTrigger>
              <TabsTrigger value="weekly-calendar" className="flex items-center space-x-2" disabled={!selectedFacility}>
                <Calendar className="w-4 h-4" />
                <span>Weekly Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="class-details" className="flex items-center space-x-2" disabled={!selectedClass}>
                <User className="w-4 h-4" />
                <span>Class Details</span>
              </TabsTrigger>
              <TabsTrigger value="booking-confirmed" className="flex items-center space-x-2" disabled>
                <CheckCircle className="w-4 h-4" />
                <span>Confirmed</span>
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Facility Selection */}
            <TabsContent value="facility-selection" className="space-y-6">
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <span>Select Training Facility</span>
                  </CardTitle>
                  <CardDescription>
                    Scan QR code, enter facility code, or select from available centers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code / Manual Entry */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Scan QR Code or Enter Facility Code
                    </h3>
                    <form onSubmit={handleFacilitySubmit} className="flex gap-3">
                      <Input
                        placeholder="Enter facility code (e.g., TC001-SG)"
                        value={facilityInput}
                        onChange={(e) => setFacilityInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={facilityCheckIn.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {facilityCheckIn.isPending ? 'Checking...' : 'Access'}
                      </Button>
                    </form>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* Facility Dropdown */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Select from Available Facilities
                    </h3>
                    <Select onValueChange={handleFacilitySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a training center" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingCenters.map((center: TrainingCenter) => (
                          <SelectItem key={center.id} value={center.id.toString()}>
                            <div>
                              <div className="font-medium">{center.name}</div>
                              <div className="text-sm text-gray-500">{center.address}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Access Buttons */}
                  <div>
                    <h3 className="font-semibold mb-3">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setFacilityInput('TC001-SG')}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <div className="text-center">
                          <div className="font-semibold">Singapore Elite</div>
                          <div className="text-sm text-gray-500">TC001-SG</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFacilityInput('TC002-SG')}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <Building2 className="w-6 h-6 text-green-600" />
                        <div className="text-center">
                          <div className="font-semibold">Marina Bay Courts</div>
                          <div className="text-sm text-gray-500">TC002-SG</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Weekly Calendar */}
            <TabsContent value="weekly-calendar" className="space-y-6">
              {selectedFacility && (
                <>
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            {selectedFacility.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{selectedFacility.address}</p>
                        </div>
                        <Button variant="outline" onClick={() => setActiveTab('facility-selection')}>
                          Change Facility
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Weekly Calendar */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Weekly Schedule
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <span className="text-sm font-medium px-4">
                            {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingSchedule ? (
                        <div className="text-center py-8">Loading schedule...</div>
                      ) : (
                        <div className="grid grid-cols-7 gap-4">
                          {weekDays.map((day) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayClasses = weeklySchedule?.schedule?.[dateKey] || [];
                            const isToday = isSameDay(day, new Date());

                            return (
                              <div key={dateKey} className="space-y-2">
                                <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}>
                                  <div className="font-semibold">{format(day, 'EEE')}</div>
                                  <div className="text-sm">{format(day, 'MMM d')}</div>
                                </div>
                                
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {dayClasses.length === 0 ? (
                                    <div className="text-center text-gray-400 text-sm py-4">
                                      No classes
                                    </div>
                                  ) : (
                                    dayClasses.map((classItem: ClassDetails) => (
                                      <Card 
                                        key={`${classItem.id}-${dateKey}`}
                                        className="cursor-pointer hover:shadow-md transition-shadow p-2"
                                        onClick={() => handleClassSelection(classItem)}
                                      >
                                        <div className="space-y-1">
                                          <div className="font-medium text-sm">{classItem.name}</div>
                                          <div className="text-xs text-gray-600">
                                            {classItem.start_time} - {classItem.end_time}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {classItem.coach_name}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <Badge className={`text-xs ${getSkillLevelColor(classItem.skill_level)}`}>
                                              {classItem.skill_level}
                                            </Badge>
                                            <div className="text-xs text-gray-500">
                                              {classItem.current_enrollment}/{classItem.max_participants}
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            {getClassStatusBadge(classItem)}
                                            <div className="text-xs font-medium">${classItem.price_per_session}</div>
                                          </div>
                                        </div>
                                      </Card>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Step 3: Class Details */}
            <TabsContent value="class-details" className="space-y-6">
              {selectedClass && (
                <Card>
                  <CardHeader>
                    <CardTitle>Class & Coach Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Class Info */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{selectedClass.name}</h3>
                      <p className="text-gray-600 mb-4">{selectedClass.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {selectedClass.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedClass.start_time} - {selectedClass.end_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {selectedClass.current_enrollment}/{selectedClass.max_participants} enrolled
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          ${selectedClass.price_per_session}
                        </div>
                      </div>
                      
                      {selectedClass.current_enrollment < selectedClass.min_participants && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Minimum enrollment required: {selectedClass.min_participants} participants
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1">
                            Need {selectedClass.min_participants - selectedClass.current_enrollment} more participants for this class to proceed
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Coach Info */}
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{selectedClass.coach_name}</h4>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < selectedClass.coach_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {selectedClass.coach_rating.toFixed(1)} ({selectedClass.coach_reviews_count} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{selectedClass.coach_bio}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-semibold">Certifications:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedClass.coach_certifications.map((cert: string, index: number) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Class Goals */}
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        What you'll learn:
                      </h5>
                      <ul className="space-y-1">
                        {selectedClass.goals.map((goal: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setActiveTab('weekly-calendar')} className="flex-1">
                        Back to Calendar
                      </Button>
                      <Button 
                        onClick={handleConfirmBooking} 
                        disabled={
                          selectedClass.current_enrollment >= selectedClass.max_participants ||
                          selectedClass.status === 'cancelled' ||
                          enrollMutation.isPending
                        }
                        className="flex-1"
                      >
                        {enrollMutation.isPending ? 'Processing...' : (
                          <>
                            Confirm & Pay ${selectedClass.price_per_session}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Step 4: Booking Confirmed */}
            <TabsContent value="booking-confirmed" className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {selectedClass && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{selectedClass.name}</h3>
                      <p className="text-gray-600">with {selectedClass.coach_name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedClass.date} • {selectedClass.start_time} - {selectedClass.end_time}
                      </p>
                      <p className="text-sm text-gray-500">{selectedFacility?.name}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Payment processed successfully</p>
                    <p>✓ Confirmation email sent</p>
                    <p>✓ Calendar invite attached</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => {
                      setActiveTab('facility-selection');
                      setSelectedClass(null);
                      setSelectedFacility(null);
                    }} variant="outline" className="flex-1">
                      Book Another Class
                    </Button>
                    <Button onClick={() => window.location.href = '/calendar/my-classes'} className="flex-1">
                      View My Classes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StandardLayout>
  );
}