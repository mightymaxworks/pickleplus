/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Enhanced booking interface with real-time availability
 * Priority 1: Enhanced Booking Interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { MobilePage, SectionCard, StickyActionBar, ResponsiveGrid, MobileBottomSheet } from '@/components/mobile';
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
import { format, addDays, isSameDay, parseISO, isAfter, isBefore, startOfDay } from "date-fns";

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
  const [, setLocation] = useLocation();
  const detailsFormRef = useRef<HTMLFormElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [participants, setParticipants] = useState(1);
  const [bookingStep, setBookingStep] = useState<'datetime' | 'details' | 'confirmation'>('datetime');
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    currency: string;
    transactionId?: string;
  } | null>(null);

  const [bookingDetails, setBookingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Fetch facility details
  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ['/api/facilities', facilityId],
    queryFn: async () => {
      const response = await apiRequest(`/api/facilities/${facilityId}`);
      return await response.json();
    }
  });

  // Fetch availability for selected date
  const { data: availability, isLoading: availabilityLoading, refetch: refetchAvailability } = useQuery({
    queryKey: ['/api/facilities', facilityId, 'availability', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await apiRequest(`/api/facilities/${facilityId}/availability?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      const data = await response.json();
      // Ensure we return an array of time slots
      return Array.isArray(data) ? data : (data?.availability || data?.timeSlots || []);
    },
    enabled: !!facilityId
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingData & { paymentData?: any }) => apiRequest('/api/facility-bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      setBookingStep('confirmation');
      queryClient.invalidateQueries({ queryKey: ['/api/facilities', facilityId, 'availability'] });
      toast({
        title: "Booking Confirmed!",
        description: "Your court booking has been successfully confirmed with payment processed.",
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
    // Parse name into first/last for compatibility
    const fullName = formData.playerName || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Update booking details state
    setBookingDetails({
      firstName,
      lastName,
      email: formData.playerEmail || formData.email || '',
      phone: formData.playerPhone || formData.phone || '',
      notes: formData.specialRequests || formData.notes || ''
    });

    // Check if payment is required (if price > 0)
    if (selectedTimeSlot && selectedTimeSlot.price > 0) {
      // Go to payment step via bottom sheet
      setPaymentData({
        amount: selectedTimeSlot.price,
        currency: 'USD'
      });
      setShowPaymentSheet(true);
    } else {
      // No payment required, proceed directly to booking
      const finalBookingData: BookingData = {
        ...bookingData as BookingData,
        playerName: formData.playerName || `${formData.firstName} ${formData.lastName}`,
        playerEmail: formData.playerEmail || formData.email,
        playerPhone: formData.playerPhone || formData.phone,
        specialRequests: formData.specialRequests || formData.notes
      };

      createBookingMutation.mutate(finalBookingData);
    }
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful:', paymentResult);
    
    // Close payment sheet
    setShowPaymentSheet(false);
    
    // Update payment data with transaction info
    setPaymentData(prev => prev ? {
      ...prev,
      transactionId: paymentResult.transactionId || paymentResult.id
    } : null);

    // Create booking with payment information
    if (selectedDate && selectedTimeSlot && facility) {
      const bookingDataWithPayment: BookingData & { paymentData?: any } = {
        facilityId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTimeSlot.time,
        duration: selectedTimeSlot.duration,
        participants,
        courtNumber: selectedTimeSlot.courtNumber,
        coachId: selectedTimeSlot.coachId,
        playerName: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
        playerEmail: bookingDetails.email,
        playerPhone: bookingDetails.phone,
        specialRequests: bookingDetails.notes,
        paymentData: {
          transactionId: paymentResult.transactionId || paymentResult.id,
          amount: selectedTimeSlot.price,
          currency: 'USD',
          paymentMethod: 'wise'
        }
      };
      
      createBookingMutation.mutate(bookingDataWithPayment);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setShowPaymentSheet(false);
    toast({
      title: "Payment Failed",
      description: error || "There was an error processing your payment. Please try again.",
      variant: "destructive"
    });
  };

  if (facilityLoading) {
    return (
      <MobilePage title="Loading..." showBackButton={false}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <SectionCard>
            <div className="space-y-3">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </SectionCard>
        </div>
      </MobilePage>
    );
  }

  if (!facility) {
    return (
      <MobilePage title="Not Found" showBackButton>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Facility Not Found</h2>
          <p className="text-gray-500">The facility you're looking for doesn't exist or is no longer available.</p>
        </div>
      </MobilePage>
    );
  }

  const renderDateTimeSelection = () => (
    <div className="space-y-4">
      {/* Calendar */}
      <SectionCard title="Choose Date">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => 
            isBefore(startOfDay(date), startOfDay(new Date())) || 
            isAfter(startOfDay(date), startOfDay(addDays(new Date(), 30)))
          }
          className="w-full justify-center"
          data-testid="calendar-date-select"
        />
      </SectionCard>

      {/* Time Slots */}
      <SectionCard 
        title="Available Times" 
        subtitle={format(selectedDate, 'EEEE, MMMM d, yyyy')}
      >
        {availabilityLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : !availability || availability.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No available time slots for this date</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto" data-testid="timeslots-list">
            {(availability || []).map((slot: TimeSlot, index: number) => (
              <Button
                key={index}
                variant={selectedTimeSlot?.time === slot.time ? "default" : "outline"}
                className="w-full justify-between p-4 h-auto min-h-[60px]"
                disabled={!slot.available}
                onClick={() => handleTimeSlotSelect(slot)}
                data-testid={`timeslot-${slot.time}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{slot.time}</span>
                  {slot.coachName && (
                    <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                      Coach: {slot.coachName}
                    </Badge>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">${slot.price}</div>
                  <div className="text-xs text-gray-500">{slot.duration}min</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Participants Selection */}
      <SectionCard title="Number of Participants">
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
      </SectionCard>
    </div>
  );

  const renderBookingDetails = () => (
    <form ref={detailsFormRef} onSubmit={(e) => {
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

  const renderPaymentStep = () => {
    if (!paymentData || !selectedTimeSlot) {
      return <div>Payment data not available</div>;
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Payment Information</h3>
          <p className="text-gray-600">
            Complete your booking by securely processing payment through Wise.
          </p>
        </div>

        {/* Booking Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Facility:</span>
              <span className="font-medium">{facility.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-medium">
                {format(selectedDate, 'MMM d, yyyy')} at {selectedTimeSlot.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{selectedTimeSlot.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Participants:</span>
              <span className="font-medium">{participants} player{participants > 1 ? 's' : ''}</span>
            </div>
            {selectedTimeSlot.coachName && (
              <div className="flex justify-between">
                <span>Coach:</span>
                <span className="font-medium">{selectedTimeSlot.coachName}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${paymentData.amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <WisePaymentForm
          amount={paymentData.amount}
          currency={paymentData.currency}
          paymentType="facility_booking"
          resourceId={facilityId.toString()}
          recipientName={facility.name}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setBookingStep('details')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
        </div>
      </div>
    );
  };

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
          <Button variant="outline" onClick={() => setLocation('/facilities')}>
            Browse More Facilities
          </Button>
          <Button onClick={() => setLocation('/profile')}>
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );

  // Get step title
  const getStepTitle = () => {
    switch (bookingStep) {
      case 'datetime': return 'Select Date & Time';
      case 'details': return 'Booking Details';
      case 'confirmation': return 'Booking Confirmed';
      default: return 'Book Court';
    }
  };

  const getStickyActions = () => {
    if (bookingStep === 'datetime' && selectedTimeSlot) {
      return (
        <StickyActionBar
          primaryAction={{
            label: 'Continue to Details',
            onClick: () => setBookingStep('details')
          }}
        />
      );
    }
    
    if (bookingStep === 'details') {
      return (
        <StickyActionBar
          secondaryAction={{
            label: 'Back',
            onClick: () => setBookingStep('datetime')
          }}
          primaryAction={{
            label: 'Continue',
            onClick: () => {
              detailsFormRef.current?.requestSubmit();
            }
          }}
        />
      );
    }
    
    if (bookingStep === 'confirmation') {
      return (
        <StickyActionBar
          primaryAction={{
            label: 'Browse More Facilities',
            onClick: () => setLocation('/facilities')
          }}
        />
      );
    }
    
    return null;
  };

  return (
    <>
      <MobilePage 
        title={getStepTitle()}
        stickyActions={getStickyActions()}
      >
        {/* Facility Info Header */}
        <SectionCard className="mb-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate">{facility.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{facility.address}, {facility.city}</span>
              </div>
            </div>
            {facility.rating && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{facility.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Progress Indicator - Simplified for Mobile */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2">
            {['datetime', 'details', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  bookingStep === step ? 'bg-primary text-white' : 
                  (bookingStep === 'confirmation' && index < 2) || 
                  (bookingStep === 'details' && index === 0) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Content */}
        {bookingStep === 'datetime' && renderDateTimeSelection()}
        {bookingStep === 'details' && renderBookingDetails()}
        {bookingStep === 'confirmation' && renderConfirmation()}

        {/* Facility Details */}
        <SectionCard title="Facility Details" className="mt-6">
          <ResponsiveGrid colsSm={2} gap="sm">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{facility.courtCount} Courts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{facility.courtSurface}</span>
            </div>
            {facility.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{facility.phoneNumber}</span>
              </div>
            )}
            {facility.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <span>Website</span>
              </div>
            )}
          </ResponsiveGrid>
        </SectionCard>
      </MobilePage>

      {/* Payment Bottom Sheet */}
      <MobileBottomSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        title="Complete Payment"
        description={`Pay $${paymentData?.amount} to confirm your booking`}
      >
        {paymentData && (
          <WisePaymentForm
            amount={paymentData.amount}
            currency={paymentData.currency}
            recipientName={facility.name}
            paymentType="facility_booking"
            resourceId={facilityId.toString()}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </MobileBottomSheet>
    </>
  );
};

export default FacilityBooking;