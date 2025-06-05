/**
 * PKL-278651-TRAINING-CENTER-COMPREHENSIVE - Complete Training Center Booking Flow
 * 1. Facility selection (QR scan/code entry/dropdown)
 * 2. Detailed weekly calendar view
 * 3. Class selection with limits and minimums
 * 4. Coach credentials and class details
 * 5. Payment and registration
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { 
  Clock, 
  Users, 
  DollarSign, 
  MapPin, 
  Star, 
  Award, 
  User,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Calendar as CalendarIcon,
  QrCode,
  Building2,
  AlertTriangle,
  UserCheck,
  Target,
  Trophy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

interface WeeklySchedule {
  [date: string]: ClassDetails[];
}

export default function ComprehensiveBookingFlow() {
  const [currentStep, setCurrentStep] = useState<'facility' | 'calendar' | 'class-details' | 'payment' | 'confirmed'>('facility');
  const [facilityInput, setFacilityInput] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<TrainingCenter | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available training centers
  const { data: trainingCenters = [] } = useQuery({
    queryKey: ['/api/training-centers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/training-centers');
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
      setCurrentStep('calendar');
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
      setCurrentStep('confirmed');
      setShowPayment(false);
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
      setCurrentStep('calendar');
      toast({
        title: "Facility Selected",
        description: `Accessing ${facility.name}`,
      });
    }
  };

  const handleClassSelection = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
    setShowClassDetails(true);
  };

  const handleProceedToPayment = () => {
    setShowClassDetails(false);
    setShowPayment(true);
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

  // Step 1: Facility Selection
  if (currentStep === 'facility') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span>Select Training Facility</span>
            </CardTitle>
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
      </div>
    );
  }

  // Step 2: Weekly Calendar View
  if (currentStep === 'calendar') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedFacility?.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedFacility?.address}</p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep('facility')}>
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
                <CalendarIcon className="w-5 h-5" />
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
                      
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
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
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Booking Confirmation
  if (currentStep === 'confirmed') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg">{selectedClass?.name}</h3>
              <p className="text-gray-600">with {selectedClass?.coach_name}</p>
              <p className="text-sm text-gray-500">
                {selectedClass?.date} • {selectedClass?.start_time} - {selectedClass?.end_time}
              </p>
              <p className="text-sm text-gray-500">{selectedFacility?.name}</p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Payment processed successfully</p>
              <p>✓ Confirmation email sent</p>
              <p>✓ Calendar invite attached</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setCurrentStep('facility')} variant="outline" className="flex-1">
                Book Another Class
              </Button>
              <Button onClick={() => window.location.href = '/calendar/my-classes'} className="flex-1">
                View My Classes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Class Details Modal */}
      <Dialog open={showClassDetails} onOpenChange={setShowClassDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class & Coach Details</DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-6">
              {/* Class Info */}
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedClass.name}</h3>
                <p className="text-gray-600 mb-4">{selectedClass.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
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

              <Separator />

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

              <Separator />

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
                <Button variant="outline" onClick={() => setShowClassDetails(false)} className="flex-1">
                  Back to Calendar
                </Button>
                <Button 
                  onClick={handleProceedToPayment} 
                  disabled={
                    selectedClass.current_enrollment >= selectedClass.max_participants ||
                    selectedClass.status === 'cancelled'
                  }
                  className="flex-1"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold">{selectedClass.name}</h4>
                <p className="text-sm text-gray-600">with {selectedClass.coach_name}</p>
                <p className="text-sm text-gray-500">
                  {selectedClass.date} • {selectedClass.start_time} - {selectedClass.end_time}
                </p>
              </div>

              <div className="flex justify-between items-center py-2">
                <span>Class Fee:</span>
                <span className="font-semibold">${selectedClass.price_per_session}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center py-2 font-semibold">
                <span>Total:</span>
                <span>${selectedClass.price_per_session}</span>
              </div>

              {selectedClass.current_enrollment < selectedClass.min_participants && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    This class requires {selectedClass.min_participants} minimum participants. 
                    Currently has {selectedClass.current_enrollment}. Class will be confirmed once minimum is reached.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPayment(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={enrollMutation.isPending}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {enrollMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );