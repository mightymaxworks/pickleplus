/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Enhanced booking interface with real-time availability
 * Priority 1: Enhanced Booking Interface
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { StandardLayout } from '@/components/layout/StandardLayout';
import WisePaymentForm from '@/components/payments/WisePaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Calendar as CalendarIcon,
  Phone,
  Globe,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building2,
  DollarSign,
  User,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { format, addDays, isSameDay, parseISO, isAfter, isBefore } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number; // minutes
  courtNumber?: number;
  coachId?: number;
  coachName?: string;
}

interface BookingData {
  facilityId: number;
  date: string;
  time: string;
  duration: number;
  participants: number;
  courtNumber?: number;
  coachId?: number;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  specialRequests?: string;
}

const FacilityBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const facilityId = parseInt(id || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [participants, setParticipants] = useState(1);
  const [bookingStep, setBookingStep] = useState<'datetime' | 'details' | 'payment' | 'confirmation'>('datetime');
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});

  // Fetch facility details
  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ['/api/facilities', facilityId],
    queryFn: () => apiRequest(`/api/facilities/${facilityId}`)
  });

  // Fetch availability for selected date
  const { data: availability, isLoading: availabilityLoading, refetch: refetchAvailability } = useQuery({
    queryKey: ['/api/facilities', facilityId, 'availability', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest(`/api/facilities/${facilityId}/availability?date=${format(selectedDate, 'yyyy-MM-dd')}`),
    enabled: !!facilityId
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingData) => apiRequest('/api/facility-bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      setBookingStep('confirmation');
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', facilityId, 'availability'] });
      toast({
        title: "Booking Confirmed!",
        description: "Your court booking has been successfully confirmed.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      refetchAvailability();
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setBookingData(prev => ({
      ...prev,
      facilityId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: slot.time,
      duration: slot.duration,
      participants,
      courtNumber: slot.courtNumber,
      coachId: slot.coachId
    }));
  };

  const handleBookingSubmit = (formData: any) => {
    const finalBookingData: BookingData = {
      ...bookingData as BookingData,
      playerName: formData.playerName,
      playerEmail: formData.playerEmail,
      playerPhone: formData.playerPhone,
      specialRequests: formData.specialRequests
    };

    createBookingMutation.mutate(finalBookingData);
  };

  if (facilityLoading) {
    return (
      <StandardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StandardLayout>
    );
  }

  if (!facility) {
    return (
      <StandardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Facility Not Found</h2>
          <p className="text-gray-500">The facility you're looking for doesn't exist or is no longer available.</p>
          <Button 
            onClick={() => window.history.back()} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </StandardLayout>
    );
  }

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  isBefore(date, new Date()) || 
                  isAfter(date, addDays(new Date(), 30))
                }
                className="rounded-md border"
                data-testid="calendar-date-select"
              />
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Times</CardTitle>
              <p className="text-sm text-gray-500">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </CardHeader>
            <CardContent>
              {availabilityLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : availability?.availability?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No available time slots for this date</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto" data-testid="timeslots-list">
                  {availability?.availability?.map((slot: TimeSlot, index: number) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot?.time === slot.time ? "default" : "outline"}
                      className="w-full justify-between p-4 h-auto"
                      disabled={!slot.available}
                      onClick={() => handleTimeSlotSelect(slot)}
                      data-testid={`timeslot-${slot.time}`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{slot.time}</span>
                        {slot.coachName && (
                          <Badge variant="secondary" className="text-xs">
                            Coach: {slot.coachName}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${slot.price}</div>
                        <div className="text-xs text-gray-500">{slot.duration}min</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participants Selection */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Number of Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="participants">Participants:</Label>
              <Select value={participants.toString()} onValueChange={(value) => setParticipants(parseInt(value))}>
                <SelectTrigger className="w-32" data-testid="select-participants">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => setBookingStep('details')}
            disabled={!selectedTimeSlot}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-continue-details"
          >
            Continue to Details
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      handleBookingSubmit({
        playerName: formData.get('playerName'),
        playerEmail: formData.get('playerEmail'),
        playerPhone: formData.get('playerPhone'),
        specialRequests: formData.get('specialRequests')
      });
    }}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
          
          {/* Booking Summary */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Date & Time:</strong><br />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTimeSlot?.time}
                </div>
                <div>
                  <strong>Duration:</strong><br />
                  {selectedTimeSlot?.duration} minutes
                </div>
                <div>
                  <strong>Participants:</strong><br />
                  {participants} {participants === 1 ? 'person' : 'people'}
                </div>
                <div>
                  <strong>Total Price:</strong><br />
                  <span className="text-lg font-bold">${selectedTimeSlot?.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="playerName">Full Name *</Label>
                <Input
                  id="playerName"
                  name="playerName"
                  required
                  placeholder="Enter your full name"
                  data-testid="input-player-name"
                />
              </div>
              <div>
                <Label htmlFor="playerEmail">Email Address *</Label>
                <Input
                  id="playerEmail"
                  name="playerEmail"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  data-testid="input-player-email"
                />
              </div>
              <div>
                <Label htmlFor="playerPhone">Phone Number *</Label>
                <Input
                  id="playerPhone"
                  name="playerPhone"
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                  data-testid="input-player-phone"
                />
              </div>
              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  data-testid="textarea-special-requests"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBookingStep('datetime')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Date/Time
            </Button>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-confirm-booking"
            >
              {createBookingMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-6">
          Your court booking has been successfully confirmed. You'll receive a confirmation email shortly.
        </p>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-left">
            <div className="flex justify-between">
              <span>Facility:</span>
              <span className="font-medium">{facility.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">{selectedTimeSlot?.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{selectedTimeSlot?.duration} min</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">${selectedTimeSlot?.price}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center mt-6">
          <Button variant="outline" onClick={() => window.location.href = '/facilities'}>
            Browse More Facilities
          </Button>
          <Button onClick={() => window.location.href = '/profile'}>
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <StandardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4 p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Facilities
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Book Your Court</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{facility.name}</span>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{facility.address}, {facility.city}</span>
              </div>
            </div>
            
            {facility.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{facility.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({facility.reviewsCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {['datetime', 'details', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  bookingStep === step ? 'bg-primary text-white' : 
                  (bookingStep === 'confirmation' && index < 2) || 
                  (bookingStep === 'details' && index === 0) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium capitalize">{step.replace('datetime', 'Date & Time')}</span>
                {index < 2 && <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Content */}
        <Card>
          <CardContent className="p-6">
            {bookingStep === 'datetime' && renderDateTimeSelection()}
            {bookingStep === 'details' && renderBookingDetails()}
            {bookingStep === 'confirmation' && renderConfirmation()}
          </CardContent>
        </Card>

        {/* Facility Info Footer */}
        <Card className="mt-6 bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{facility.courtCount} Courts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="capitalize">{facility.courtSurface}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {facility.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{facility.phoneNumber}</span>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};

export default FacilityBooking;