/**
 * PKL-278651-FACILITY-MGMT-002 - Priority 2: Revenue Generation
 * Facility-Specific Coach Discovery and Integration
 * 
 * Allows users to discover coaches available at specific facilities and book
 * combined facility + coaching sessions with revenue sharing
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  DollarSign, 
  Award,
  ChevronRight,
  Heart,
  BookOpen,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StandardLayout } from '@/components/layout/StandardLayout';

interface FacilityCoach {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  coachLevel: number;
  specialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: {
    date: string;
    timeSlots: string[];
  }[];
  partnership: {
    facilityCommission: number;
    isActive: boolean;
    joinedDate: string;
  };
  description: string;
  certifications: string[];
}

interface FacilityInfo {
  id: number;
  name: string;
  location: string;
  amenities: string[];
  courtTypes: string[];
}

export default function FacilityCoaches() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const facilityId = parseInt(params.facilityId as string);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('week');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Get facility information
  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ['/api/facilities', facilityId],
    queryFn: () => fetch(`/api/facilities/${facilityId}`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!facilityId
  });

  // Get coaches available at this facility
  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ['/api/coach-marketplace/facilities', facilityId, 'coaches', selectedTimeFrame, selectedSpecialty],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeFrame: selectedTimeFrame,
        ...(selectedSpecialty !== 'all' && { specialty: selectedSpecialty })
      });
      
      const response = await fetch(`/api/coach-marketplace/facilities/${facilityId}/coaches?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch facility coaches');
      }
      
      const data = await response.json();
      return data.coaches || []; // Handle backend response shape { coaches: [...] }
    },
    enabled: !!facilityId
  });

  // Book facility + coach session
  const bookSessionMutation = useMutation({
    mutationFn: async ({ coachId, date, time, duration }: { 
      coachId: number; 
      date: string; 
      time: string; 
      duration: number;
    }) => {
      const response = await fetch('/api/coach-marketplace/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          facilityId,
          coachId,
          date,
          time,
          duration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to book session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Session Booked Successfully!',
        description: `Your coaching session has been confirmed. Booking ID: ${data.bookingId}`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/coach-marketplace/facilities', facilityId, 'coaches'] });
      navigate(`/booking-confirmation/${data.bookingId}`);
    },
    onError: () => {
      toast({
        title: 'Booking Failed',
        description: 'Unable to book session. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleBookCoach = (coach: FacilityCoach) => {
    // For MVP, we'll book the first available slot
    const firstAvailable = coach.availability?.[0];
    if (firstAvailable && firstAvailable.timeSlots.length > 0) {
      bookSessionMutation.mutate({
        coachId: coach.id,
        date: firstAvailable.date,
        time: firstAvailable.timeSlots[0],
        duration: 60 // Default 1 hour
      });
    }
  };

  const specialtyOptions = [
    'all',
    'Beginner Training',
    'Advanced Strategy',
    'Tournament Prep',
    'Technical Skills',
    'Mental Game',
    'Physical Conditioning'
  ];

  const getCoachLevelBadge = (level: number) => {
    const levels = ['Trainee', 'Associate', 'Senior', 'Expert', 'Master'];
    const colors = ['gray', 'blue', 'green', 'orange', 'red'];
    return { label: levels[level] || 'Trainee', color: colors[level] || 'gray' };
  };

  if (facilityLoading) {
    return (
      <StandardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="relative w-8 h-8 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
                <polygon
                  points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="8"
                />
              </svg>
            </div>
            <p className="text-gray-600">Loading facility information...</p>
          </div>
        </div>
      </StandardLayout>
    );
  }

  if (!facility) {
    return (
      <StandardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facility Not Found</h2>
          <Button onClick={() => navigate('/facilities')} variant="outline">
            Back to Facilities
          </Button>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/facilities')}
              className="text-orange-600 hover:text-orange-700"
            >
              Facilities
            </Button>
            <ChevronRight className="w-4 h-4" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/facilities/${facilityId}`)}
              className="text-orange-600 hover:text-orange-700"
            >
              {facility.name}
            </Button>
            <ChevronRight className="w-4 h-4" />
            <span>Coaches</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Coaches at {facility.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{facility.location}</span>
                </div>
                {coaches?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{coaches.length} available coaches</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Find Your Perfect Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coaches List */}
        {coachesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse" data-testid={`coach-skeleton-${i}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coaches && coaches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach: FacilityCoach) => {
              const levelBadge = getCoachLevelBadge(coach.coachLevel);
              
              return (
                <Card key={coach.id} className="hover:shadow-lg transition-shadow" data-testid={`coach-card-${coach.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={coach.avatarUrl} alt={coach.name} />
                          <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{coach.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`bg-${levelBadge.color}-100 text-${levelBadge.color}-800`}>
                              <Award className="w-3 h-3 mr-1" />
                              Level {coach.coachLevel}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{coach.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({coach.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-2">{coach.description}</p>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {coach.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {coach.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{coach.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Pricing & Availability */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">${coach.hourlyRate}/hour</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Facility gets {coach.partnership.facilityCommission}% commission
                        </div>
                      </div>

                      {coach.availability && coach.availability.length > 0 && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <Clock className="w-4 h-4" />
                            <span>Next available: {coach.availability[0].date}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {coach.availability[0].timeSlots.slice(0, 3).join(', ')}
                            {coach.availability[0].timeSlots.length > 3 && ` +${coach.availability[0].timeSlots.length - 3} more slots`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleBookCoach(coach)}
                        disabled={bookSessionMutation.isPending || !coach.availability?.length}
                        className="flex-1"
                        data-testid={`book-coach-${coach.id}`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {bookSessionMutation.isPending ? 'Booking...' : 'Book Session'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/coach/${coach.id}`)}
                        data-testid={`view-coach-${coach.id}`}
                      >
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coaches Available</h3>
              <p className="text-gray-600 mb-6">
                There are currently no coaches available at this facility for your selected criteria.
                Try adjusting your time frame or specialty filters.
              </p>
              <div className="space-y-2">
                <Button onClick={() => setSelectedTimeFrame('month')} variant="outline">
                  Expand to This Month
                </Button>
                <br />
                <Button onClick={() => navigate(`/facilities/${facilityId}`)} variant="ghost">
                  Book Facility Only
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardLayout>
  );
}