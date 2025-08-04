import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Clock, MapPin, Star, DollarSign, Calendar as CalendarIcon, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  hourlyRate: number;
  certificationLevel: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  bio?: string;
  location?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

interface BookingFormData {
  date: Date;
  timeSlot: string;
  sessionType: string;
  duration: number;
  location: string;
  specialRequests?: string;
}

const SESSION_TYPES = [
  { value: 'individual', label: 'Individual Session', duration: 60 },
  { value: 'group', label: 'Group Session (2-4 players)', duration: 90 },
  { value: 'clinic', label: 'Skills Clinic', duration: 120 },
  { value: 'assessment', label: 'Skill Assessment', duration: 45 }
];

const LOCATIONS = [
  { value: 'coach_location', label: 'Coach\'s Facility' },
  { value: 'student_location', label: 'My Location' },
  { value: 'neutral', label: 'Neutral Location' },
  { value: 'online', label: 'Online Session' }
];

// Sample time slots - in real implementation, this would come from coach availability
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    ['00', '30'].forEach(minute => {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
      slots.push({
        id: `${format(date, 'yyyy-MM-dd')}-${timeString}`,
        time: timeString,
        available: Math.random() > 0.3, // 70% availability
        price: 95 + (hour > 16 ? 10 : 0) // Peak hours cost more
      });
    });
  }
  
  return slots;
};

export default function CoachBooking() {
  const [match, params] = useRoute('/coaches/book/:coachId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('individual');
  const [location, setLocationValue] = useState<string>('coach_location');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [step, setStep] = useState<'selection' | 'confirmation' | 'success'>('selection');

  const coachId = params?.coachId ? parseInt(params.coachId) : null;

  // Fetch coach details
  const { data: coach, isLoading: coachLoading } = useQuery<Coach>({
    queryKey: ['/api/coaches/profile', coachId],
    queryFn: () => apiRequest('GET', `/api/coaches/${coachId}/profile`).then(res => res.json()),
    enabled: !!coachId
  });

  // Generate available time slots for selected date
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/booking/create', bookingData);
      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: 'Booking Confirmed!',
        description: 'Your session has been successfully booked.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/my-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error processing your booking.',
        variant: 'destructive'
      });
    }
  });

  const handleBooking = () => {
    if (!selectedTimeSlot || !coach) return;

    const selectedSession = SESSION_TYPES.find(s => s.value === sessionType);
    const selectedSlot = timeSlots.find(s => s.id === selectedTimeSlot);
    
    if (!selectedSession || !selectedSlot) return;

    const bookingData = {
      coachId: coach.id,
      sessionDate: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedSlot.time,
      sessionType,
      duration: selectedSession.duration,
      location,
      specialRequests,
      totalPrice: selectedSlot.price
    };

    setStep('confirmation');
  };

  const confirmBooking = () => {
    const selectedSession = SESSION_TYPES.find(s => s.value === sessionType);
    const selectedSlot = timeSlots.find(s => s.id === selectedTimeSlot);
    
    bookingMutation.mutate({
      coachId: coach?.id,
      sessionDate: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedSlot?.time,
      sessionType,
      duration: selectedSession?.duration,
      location,
      specialRequests,
      totalPrice: selectedSlot?.price
    });
  };

  if (!match || !coachId) {
    return <div>Coach not found</div>;
  }

  if (coachLoading) {
    return <div className="p-6">Loading coach details...</div>;
  }

  if (!coach) {
    return <div className="p-6">Coach not found</div>;
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your session with {coach.firstName} {coach.lastName} has been successfully booked.
            </p>
            <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg mb-6">
              <p><strong>Date:</strong> {format(selectedDate, 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {timeSlots.find(s => s.id === selectedTimeSlot)?.time}</p>
              <p><strong>Session:</strong> {SESSION_TYPES.find(s => s.value === sessionType)?.label}</p>
              <p><strong>Location:</strong> {LOCATIONS.find(l => l.value === location)?.label}</p>
            </div>
            <div className="space-x-4">
              <Button onClick={() => setLocation('/booking/manage')}>
                Manage Bookings
              </Button>
              <Button variant="outline" onClick={() => setLocation('/coaches')}>
                Find More Coaches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSession = SESSION_TYPES.find(s => s.value === sessionType);
  const selectedSlot = timeSlots.find(s => s.id === selectedTimeSlot);
  const totalPrice = selectedSlot?.price || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/coaches')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coaches</span>
        </Button>
      </div>

      {/* Coach Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={coach.profileImage} />
              <AvatarFallback>{coach.firstName[0]}{coach.lastName[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{coach.firstName} {coach.lastName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <Badge variant="secondary">{coach.certificationLevel}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{coach.rating}</span>
                  <span>({coach.totalReviews} reviews)</span>
                </div>
                {coach.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{coach.location}</span>
                  </div>
                )}
              </div>
              
              {coach.specializations && coach.specializations.length > 0 && (
                <div className="mt-3 space-x-2">
                  {coach.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  ))}
                </div>
              )}
              
              {coach.bio && (
                <p className="mt-3 text-gray-700">{coach.bio}</p>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${coach.hourlyRate}/hr
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 'selection' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Type */}
              <div>
                <Label htmlFor="sessionType">Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedTimeSlot(''); // Reset time selection
                    }
                  }}
                  disabled={(date) => date < startOfDay(new Date())}
                  className="rounded-md border"
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocationValue}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any specific goals, equipment needs, or other requests..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle>
                Available Times - {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {timeSlots.map(slot => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => setSelectedTimeSlot(slot.id)}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-sm">${slot.price}</span>
                  </Button>
                ))}
              </div>
              
              {timeSlots.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No available times for this date
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'confirmation' && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Coach:</span>
                <span>{coach.firstName} {coach.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{selectedSlot?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Session:</span>
                <span>{selectedSession?.label} ({selectedSession?.duration} min)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span>{LOCATIONS.find(l => l.value === location)?.label}</span>
              </div>
              {specialRequests && (
                <div className="flex justify-between">
                  <span className="font-medium">Special Requests:</span>
                  <span className="text-right">{specialRequests}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total Price:</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('selection')}
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button 
                onClick={confirmBooking}
                disabled={bookingMutation.isPending}
                className="flex-1"
              >
                {bookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {step === 'selection' && selectedTimeSlot && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Session Summary</h3>
                <p className="text-sm text-gray-600">
                  {selectedSession?.label} on {format(selectedDate, 'MMM d')} at {selectedSlot?.time}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${totalPrice}</div>
                <Button onClick={handleBooking} className="mt-2">
                  Book Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}