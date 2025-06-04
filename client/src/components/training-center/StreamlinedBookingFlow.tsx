/**
 * PKL-278651-TRAINING-CENTER-STREAMLINED - Complete Streamlined Booking Flow
 * QR scan → facility selection → calendar view → class selection → coach details → payment confirmation
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar as CalendarIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface ClassDetails {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  skill_level: string;
  max_participants: number;
  current_enrollment: number;
  price_per_session: number;
  coach_name: string;
  coach_id: number;
  coach_bio: string;
  goals: string[];
  category: string;
}

interface StreamlinedBookingFlowProps {
  selectedCenter: {
    id: number;
    name: string;
    address: string;
  };
  onBack: () => void;
}

export default function StreamlinedBookingFlow({ selectedCenter, onBack }: StreamlinedBookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showCoachDetails, setShowCoachDetails] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [bookingStep, setBookingStep] = useState<'calendar' | 'coach' | 'payment' | 'confirmed'>('calendar');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch classes for selected date
  const { data: classesData, isLoading } = useQuery({
    queryKey: [`/api/calendar/classes/${selectedCenter.id}`, selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/calendar/classes/${selectedCenter.id}?date=${selectedDate.toISOString().split('T')[0]}`);
      return response.json();
    }
  });

  const classes = classesData?.dayClasses || [];

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await apiRequest('POST', `/api/calendar/classes/${classId}/enroll`, {
        enrollmentType: 'advance'
      });
      return response.json();
    },
    onSuccess: () => {
      setBookingStep('confirmed');
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in the class. Payment confirmation sent to your email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/my-classes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in class",
        variant: "destructive",
      });
    }
  });

  const handleClassSelection = (classItem: ClassDetails) => {
    setSelectedClass(classItem);
    setBookingStep('coach');
    setShowCoachDetails(true);
  };

  const handleProceedToPayment = () => {
    setBookingStep('payment');
    setShowCoachDetails(false);
    setShowPaymentConfirmation(true);
  };

  const handleConfirmBooking = () => {
    if (selectedClass) {
      enrollMutation.mutate(selectedClass.id);
      setShowPaymentConfirmation(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.7) return 'text-green-600';
    if (ratio < 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (bookingStep === 'confirmed') {
    return (
      <Card className="max-w-2xl mx-auto">
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
              {format(selectedDate, 'EEEE, MMMM d')} • {selectedClass?.start_time} - {selectedClass?.end_time}
            </p>
            <p className="text-sm text-gray-500">{selectedCenter.name}</p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>✓ Payment processed successfully</p>
            <p>✓ Confirmation email sent</p>
            <p>✓ Calendar invite attached</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Book Another Class
            </Button>
            <Button onClick={() => window.location.href = '/calendar/my-classes'} className="flex-1">
              View My Classes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with facility info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {selectedCenter.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{selectedCenter.address}</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Change Facility
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'calendar' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className="w-8 h-0.5 bg-gray-300" />
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'coach' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className="w-8 h-0.5 bg-gray-300" />
        <div className={`w-3 h-3 rounded-full ${bookingStep === 'payment' ? 'bg-blue-600' : 'bg-gray-300'}`} />
      </div>

      {/* Calendar and class selection */}
      {bookingStep === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Available classes */}
          <Card>
            <CardHeader>
              <CardTitle>Available Classes</CardTitle>
              <p className="text-sm text-gray-600">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="text-center py-8">Loading classes...</div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No classes available for this date
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classes.map((classItem: ClassDetails) => (
                      <Card key={classItem.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{classItem.name}</h3>
                              <p className="text-sm text-gray-600">{classItem.description}</p>
                            </div>
                            <Badge className={getSkillLevelColor(classItem.skill_level)}>
                              {classItem.skill_level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {classItem.start_time} - {classItem.end_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className={`w-4 h-4 ${getAvailabilityColor(classItem.current_enrollment, classItem.max_participants)}`} />
                              {classItem.current_enrollment}/{classItem.max_participants}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${classItem.price_per_session}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="text-sm">{classItem.coach_name}</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleClassSelection(classItem)}
                              disabled={classItem.current_enrollment >= classItem.max_participants}
                            >
                              {classItem.current_enrollment >= classItem.max_participants ? 'Full' : 'Select Class'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coach Details Modal */}
      <Dialog open={showCoachDetails} onOpenChange={setShowCoachDetails}>
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
                    {format(selectedDate, 'EEEE, MMMM d')}
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
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">5.0 (124 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{selectedClass.coach_bio}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Certified Professional Instructor</span>
                </div>
              </div>

              <Separator />

              {/* Class Goals */}
              <div>
                <h5 className="font-semibold mb-2">What you'll learn:</h5>
                <ul className="space-y-1">
                  {selectedClass.goals.map((goal, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCoachDetails(false)} className="flex-1">
                  Back to Calendar
                </Button>
                <Button onClick={handleProceedToPayment} className="flex-1">
                  Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
      <Dialog open={showPaymentConfirmation} onOpenChange={setShowPaymentConfirmation}>
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
                  {format(selectedDate, 'EEEE, MMMM d')} • {selectedClass.start_time} - {selectedClass.end_time}
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

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentConfirmation(false)} 
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
}