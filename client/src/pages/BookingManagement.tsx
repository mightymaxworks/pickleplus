import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Clock, MapPin, Star, MessageCircle, X, RotateCcw } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';

interface Booking {
  id: number;
  sessionDate: string;
  timeSlot: string;
  sessionType: string;
  duration: number;
  location: string;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  coach: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
    certificationLevel: string;
  };
  specialRequests?: string;
  canCancel: boolean;
  canReschedule: boolean;
}

const SESSION_TYPE_LABELS = {
  individual: 'Individual Session',
  group: 'Group Session',
  clinic: 'Skills Clinic',
  assessment: 'Skill Assessment'
};

const LOCATION_LABELS = {
  coach_location: 'Coach\'s Facility',
  student_location: 'Your Location',
  neutral: 'Neutral Location',
  online: 'Online Session'
};

export default function BookingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch user's bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/booking/my-bookings'],
    queryFn: () => apiRequest('GET', '/api/booking/my-bookings').then(res => res.json())
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('POST', `/api/booking/${bookingId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Booking Cancelled',
        description: 'Your session has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/my-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel booking.',
        variant: 'destructive'
      });
    }
  });

  // Reschedule booking mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ bookingId, newDate, newTime }: { bookingId: number; newDate: string; newTime: string }) => {
      const response = await apiRequest('POST', `/api/booking/${bookingId}/reschedule`, {
        newDate,
        newTime
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Booking Rescheduled',
        description: 'Your session has been rescheduled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/my-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Reschedule Failed',
        description: error.message || 'Failed to reschedule booking.',
        variant: 'destructive'
      });
    }
  });

  const handleCancel = (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(bookingId);
    }
  };

  const handleReschedule = (bookingId: number) => {
    // In a real implementation, this would open a reschedule dialog
    toast({
      title: 'Reschedule Feature',
      description: 'Reschedule functionality will be available soon.',
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading your bookings...</div>;
  }

  const upcomingBookings = bookings?.filter(booking => 
    booking.status === 'confirmed' && isFuture(parseISO(`${booking.sessionDate}T${booking.timeSlot}`))
  ) || [];

  const pastBookings = bookings?.filter(booking => 
    booking.status === 'completed' || isPast(parseISO(`${booking.sessionDate}T${booking.timeSlot}`))
  ) || [];

  const cancelledBookings = bookings?.filter(booking => 
    booking.status === 'cancelled'
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      no_show: 'destructive'
    };
    
    const labels = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const sessionDateTime = parseISO(`${booking.sessionDate}T${booking.timeSlot}`);
    
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={booking.coach.profileImage} />
                <AvatarFallback>
                  {booking.coach.firstName[0]}{booking.coach.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {booking.coach.firstName} {booking.coach.lastName}
                </h3>
                <Badge variant="outline" className="mb-2">
                  {booking.coach.certificationLevel}
                </Badge>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(sessionDateTime, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(sessionDateTime, 'h:mm a')} ({booking.duration} min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{LOCATION_LABELS[booking.location as keyof typeof LOCATION_LABELS]}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-sm font-medium">
                    {SESSION_TYPE_LABELS[booking.sessionType as keyof typeof SESSION_TYPE_LABELS]}
                  </span>
                </div>
                
                {booking.specialRequests && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>Special Requests:</strong> {booking.specialRequests}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold mb-2">${booking.totalPrice}</div>
              {getStatusBadge(booking.status)}
              
              {booking.status === 'confirmed' && (
                <div className="mt-3 space-y-2">
                  {booking.canReschedule && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReschedule(booking.id)}
                      disabled={rescheduleMutation.isPending}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                  )}
                  {booking.canCancel && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelMutation.isPending}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
              
              {booking.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    toast({
                      title: 'Review Feature',
                      description: 'Session review functionality coming soon.',
                    });
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600">Manage your coaching sessions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any upcoming coaching sessions.
                </p>
                <Button onClick={() => window.location.href = '/coaches'}>
                  Find a Coach
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Sessions</h3>
                <p className="text-gray-600">
                  Your completed sessions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cancelled Sessions</h3>
                <p className="text-gray-600">
                  Your cancelled sessions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {cancelledBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}