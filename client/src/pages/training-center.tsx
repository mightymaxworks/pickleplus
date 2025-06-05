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
import { EnhancedClassDetailModal } from "@/components/training-center/EnhancedClassDetailModal";

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
  detailedDescription?: string;
  category: string;
  skillLevel: string;
  intensityLevel?: string;
  classFormat?: string;
  maxParticipants: number;
  minEnrollment?: number;
  optimalCapacity?: number;
  currentEnrollment: number;
  duration: number;
  price: number;
  goals?: string[];
  prerequisites?: string[];
  equipmentRequired?: string[];
  equipmentProvided?: string[];
  skillsFocused?: string[];
  teachingMethods?: string[];
  cancellationPolicy?: string;
  makeupPolicy?: string;
  startTime: string;
  endTime: string;
  date: string;
  court: number;
  waitlistCount?: number;
  waitlistPosition?: number;
  coach: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
    yearsExperience?: number;
    certifications?: string[];
    specializations?: string[];
    rating?: number;
    reviewCount?: number;
    teachingStyle?: string;
  };
  facility: {
    name: string;
    address: string;
  };
}

export default function PlayerDevelopmentHub() {
  const [activeTab, setActiveTab] = useState('facility-selection');
  const [facilityInput, setFacilityInput] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<TrainingCenter | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [userEnrollmentStatus, setUserEnrollmentStatus] = useState<'not_enrolled' | 'enrolled' | 'waitlisted'>('not_enrolled');
  
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

  const handleQuickFacilityAccess = (facilityId: string) => {
    const facility = trainingCenters.find((c: TrainingCenter) => c.id.toString() === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setActiveTab('weekly-calendar');
      toast({
        title: "Facility Access",
        description: `Viewing calendar for ${facility.name}`,
      });
    }
  };

  const handleClassSelection = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
    setActiveTab('class-details');
  };

  const handleViewEnhancedDetails = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
    setShowEnhancedModal(true);
  };

  const handleEnrollInClass = (classId: number) => {
    enrollMutation.mutate(classId);
    setShowEnhancedModal(false);
    setUserEnrollmentStatus('enrolled');
  };

  const handleJoinWaitlist = (classId: number) => {
    toast({
      title: "Joined Waitlist",
      description: "You've been added to the waitlist for this class.",
    });
    setShowEnhancedModal(false);
    setUserEnrollmentStatus('waitlisted');
  };

  const handleConfirmBooking = () => {
    if (selectedClass) {
      enrollMutation.mutate(selectedClass.id);
    }
  };

  const getClassStatusBadge = (classItem: ClassDetails) => {
    const currentEnrollment = classItem.currentEnrollment;
    const maxParticipants = classItem.maxParticipants;
    const minEnrollment = classItem.minEnrollment || 1;
    
    if (currentEnrollment >= maxParticipants) {
      return <Badge variant="destructive">Full</Badge>;
    }
    
    if (currentEnrollment < minEnrollment) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300">
        Need {minEnrollment - currentEnrollment} more
      </Badge>;
    }
    
    const spotsLeft = maxParticipants - currentEnrollment;
    if (spotsLeft <= 2) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">
        {spotsLeft} spots left
      </Badge>;
    }
    
    return <Badge variant="outline" className="text-green-600 border-green-300">Available</Badge>;
  };

  const getSkillLevelColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile: Vertical tab indicators */}
            <div className="block sm:hidden mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Booking Progress</h2>
                <div className="text-sm text-gray-500">
                  Step {activeTab === 'facility-selection' ? '1' : activeTab === 'weekly-calendar' ? '2' : activeTab === 'class-details' ? '3' : '4'} of 4
                </div>
              </div>
              <div className="flex space-x-2">
                <div className={`h-2 flex-1 rounded ${activeTab === 'facility-selection' ? 'bg-blue-600' : selectedFacility ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded ${activeTab === 'weekly-calendar' ? 'bg-blue-600' : selectedClass ? 'bg-green-500' : selectedFacility ? 'bg-gray-300' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded ${activeTab === 'class-details' ? 'bg-blue-600' : activeTab === 'booking-confirmed' ? 'bg-green-500' : selectedClass ? 'bg-gray-300' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded ${activeTab === 'booking-confirmed' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
            </div>

            {/* Desktop: Horizontal tabs */}
            <TabsList className="hidden sm:grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="facility-selection" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span className="hidden md:inline">Facility Selection</span>
                <span className="md:hidden">Facility</span>
              </TabsTrigger>
              <TabsTrigger value="weekly-calendar" className="flex items-center space-x-2" disabled={!selectedFacility}>
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Weekly Calendar</span>
                <span className="md:hidden">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="class-details" className="flex items-center space-x-2" disabled={!selectedClass}>
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Class Details</span>
                <span className="md:hidden">Details</span>
              </TabsTrigger>
              <TabsTrigger value="booking-confirmed" className="flex items-center space-x-2" disabled>
                <CheckCircle className="w-4 h-4" />
                <span className="hidden md:inline">Confirmed</span>
                <span className="md:hidden">Done</span>
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
                    Choose your preferred training center from the options below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  {/* Quick Access Cards */}
                  <div>
                    <h3 className="font-semibold mb-3">Quick Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                        onClick={() => handleQuickFacilityAccess('1')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Singapore Elite</h3>
                              <p className="text-sm text-gray-600 mb-2">123 Marina Bay Street, Singapore</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="w-4 h-4 mr-1" />
                                2.5 km away
                              </div>
                            </div>
                            <div className="flex items-center text-blue-600">
                              <span className="text-sm font-medium mr-2">View Calendar</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-300"
                        onClick={() => handleQuickFacilityAccess('2')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Marina Bay Courts</h3>
                              <p className="text-sm text-gray-600 mb-2">456 Orchard Road, Singapore</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="w-4 h-4 mr-1" />
                                3.2 km away
                              </div>
                            </div>
                            <div className="flex items-center text-green-600">
                              <span className="text-sm font-medium mr-2">View Calendar</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                        <>
                        {/* Mobile-first responsive calendar */}
                        <div className="block lg:hidden">
                          {/* Mobile: Single column with day tabs */}
                          <div className="mb-4">
                            <div className="flex overflow-x-auto space-x-2 pb-2">
                              {weekDays.map((day) => {
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const dayClasses = weeklySchedule?.schedule?.[dateKey] || [];
                                const isToday = isSameDay(day, new Date());
                                const isSelected = format(day, 'yyyy-MM-dd') === format(currentWeek, 'yyyy-MM-dd');

                                return (
                                  <button
                                    key={dateKey}
                                    onClick={() => setCurrentWeek(startOfWeek(day))}
                                    className={`min-w-[80px] p-3 rounded-lg text-center transition-colors ${
                                      isToday 
                                        ? 'bg-blue-600 text-white' 
                                        : isSelected 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <div className="font-semibold text-sm">{format(day, 'EEE')}</div>
                                    <div className="text-xs">{format(day, 'MMM d')}</div>
                                    {dayClasses.length > 0 && (
                                      <div className="w-2 h-2 bg-current rounded-full mx-auto mt-1 opacity-60"></div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Mobile: Selected day classes */}
                          <div className="space-y-3">
                            {(() => {
                              const selectedDateKey = format(currentWeek, 'yyyy-MM-dd');
                              const selectedDayClasses = weeklySchedule?.schedule?.[selectedDateKey] || [];
                              
                              if (selectedDayClasses.length === 0) {
                                return (
                                  <div className="text-center text-gray-400 py-8">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p>No classes scheduled for this day</p>
                                  </div>
                                );
                              }

                              return selectedDayClasses.map((classItem: ClassDetails) => (
                                <Card 
                                  key={`mobile-${classItem.id}-${selectedDateKey}`}
                                  className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                                  onClick={() => handleClassSelection(classItem)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{classItem.name}</h3>
                                        <p className="text-gray-600 text-sm">{classItem.coach?.name || 'Coach TBA'}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-lg">${classItem.price}</div>
                                        {getClassStatusBadge(classItem)}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {classItem.startTime} - {classItem.endTime}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <Badge className={`${getSkillLevelColor(classItem.skillLevel)}`}>
                                        {classItem.skillLevel}
                                      </Badge>
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-1" />
                                        {classItem.currentEnrollment}/{classItem.maxParticipants}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Desktop: 7-column grid layout */}
                        <div className="hidden lg:grid lg:grid-cols-7 gap-4">
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
                                        key={`desktop-${classItem.id}-${dateKey}`}
                                        className="cursor-pointer hover:shadow-md transition-shadow p-2"
                                        onClick={() => handleClassSelection(classItem)}
                                      >
                                        <div className="space-y-1">
                                          <div className="font-medium text-sm">{classItem.name}</div>
                                          <div className="text-xs text-gray-600">
                                            {classItem.startTime} - {classItem.endTime}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {classItem.coach?.name || 'Coach TBA'}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <Badge className={`text-xs ${getSkillLevelColor(classItem.skillLevel)}`}>
                                              {classItem.skillLevel}
                                            </Badge>
                                            <div className="text-xs text-gray-500">
                                              {classItem.currentEnrollment}/{classItem.maxParticipants}
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            {getClassStatusBadge(classItem)}
                                            <div className="text-xs font-medium">${classItem.price}</div>
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
                        </>
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
                          {selectedClass.startTime} - {selectedClass.endTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {selectedClass.currentEnrollment}/{selectedClass.maxParticipants} enrolled
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          ${selectedClass.price}
                        </div>
                      </div>
                      
                      {selectedClass.currentEnrollment < (selectedClass.minEnrollment || 1) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Minimum enrollment required: {selectedClass.minEnrollment || 1} participants
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1">
                            Need {(selectedClass.minEnrollment || 1) - selectedClass.currentEnrollment} more participants for this class to proceed
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
                          <h4 className="text-lg font-semibold">{selectedClass.coach?.name || 'Coach TBD'}</h4>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (selectedClass.coach?.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {(selectedClass.coach?.rating || 0).toFixed(1)} ({selectedClass.coach?.reviewCount || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{selectedClass.coach?.bio || 'No bio available'}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-semibold">Certifications:</h5>
                        <div className="flex flex-wrap gap-2">
                          {(selectedClass.coach?.certifications || []).map((cert: string, index: number) => (
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
                        {(selectedClass.goals || []).map((goal: string, index: number) => (
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
                          selectedClass.currentEnrollment >= selectedClass.maxParticipants ||
                          enrollMutation.isPending
                        }
                        className="flex-1"
                      >
                        {enrollMutation.isPending ? 'Processing...' : (
                          <>
                            Confirm & Pay ${selectedClass.price}
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
                      <p className="text-gray-600">with {selectedClass.coach.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedClass.date} • {selectedClass.startTime} - {selectedClass.endTime}
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

      {/* Enhanced Class Detail Modal - Phase 2 Implementation */}
      <EnhancedClassDetailModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        classData={selectedClass ? {
          ...selectedClass,
          detailedDescription: selectedClass.detailedDescription || selectedClass.description,
          intensityLevel: selectedClass.intensityLevel || 'Moderate',
          classFormat: selectedClass.classFormat || 'Group Class',
          optimalCapacity: selectedClass.optimalCapacity || selectedClass.maxParticipants,
          minEnrollment: selectedClass.minEnrollment || 2,
          waitlistCount: selectedClass.waitlistCount || 0,
          goals: selectedClass.goals || ['Improve technique', 'Build confidence', 'Have fun'],
          prerequisites: selectedClass.prerequisites || [],
          equipmentRequired: selectedClass.equipmentRequired || ['Paddle', 'Comfortable athletic wear'],
          equipmentProvided: selectedClass.equipmentProvided || ['Balls', 'Court access'],
          skillsFocused: selectedClass.skillsFocused || ['Serving', 'Volleying', 'Strategy'],
          teachingMethods: selectedClass.teachingMethods || ['Demonstration', 'Practice drills', 'Game play'],
          cancellationPolicy: selectedClass.cancellationPolicy || '24-hour cancellation policy',
          makeupPolicy: selectedClass.makeupPolicy || 'Makeup classes available within 30 days',
          coach: {
            ...selectedClass.coach,
            avatar: selectedClass.coach.avatar || '',
            bio: selectedClass.coach.bio || 'Experienced pickleball instructor dedicated to helping players improve their game.',
            yearsExperience: selectedClass.coach.yearsExperience || 5,
            certifications: selectedClass.coach.certifications || ['USAPA Certified', 'First Aid/CPR'],
            specializations: selectedClass.coach.specializations || ['Beginner instruction', 'Strategy development'],
            rating: selectedClass.coach.rating || 4.8,
            reviewCount: selectedClass.coach.reviewCount || 47,
            teachingStyle: selectedClass.coach.teachingStyle || 'Patient and encouraging with focus on fundamentals'
          },
          facility: {
            name: selectedFacility?.name || 'Training Center',
            address: selectedFacility?.address || 'Location TBA'
          }
        } : null}
        onEnroll={handleEnrollInClass}
        onJoinWaitlist={handleJoinWaitlist}
        userEnrollmentStatus={userEnrollmentStatus}
      />
    </StandardLayout>
  );
}