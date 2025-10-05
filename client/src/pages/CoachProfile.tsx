// Coach Profile Detail Page - Coach Marketplace Discovery
// UDF Development: Coach Marketplace Discovery System

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Heart, 
  MessageSquare, 
  Calendar,
  Shield,
  Award,
  ChevronLeft,
  Send,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { CoachWithMarketplaceData, CoachMarketplaceReview } from '../../../shared/schema/coach-marketplace';

const CoachProfile: React.FC = () => {
  const { coachId } = useParams();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    technicalSkills: 5,
    communication: 5,
    reliability: 5,
    valueForMoney: 5,
    tags: [] as string[]
  });

  const [reviewFilter, setReviewFilter] = useState('all');

  // Get coach profile
  const { data: coach, isLoading } = useQuery({
    queryKey: ['/api/coaches', coachId],
    queryFn: async () => {
      const response = await fetch(`/api/coaches/${coachId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to load coach profile');
      return response.json() as CoachWithMarketplaceData;
    },
    enabled: !!coachId
  });

  // Favorite coach mutation
  const favoriteMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      const response = await fetch(`/api/coaches/${coachId}/favorite`, {
        method: action === 'add' ? 'POST' : 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update favorites');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches', coachId] });
      toast({ title: 'Favorites updated successfully' });
    }
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await fetch(`/api/coaches/${coachId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches', coachId] });
      setReviewForm({
        rating: 5,
        title: '',
        content: '',
        technicalSkills: 5,
        communication: 5,
        reliability: 5,
        valueForMoney: 5,
        tags: []
      });
      toast({ title: 'Review submitted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
              />
            </svg>
          </div>
          <p>Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Coach Not Found</h2>
          <Button onClick={() => setLocation('/coaches')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const averageDetailedRating = coach.reviews.length > 0 
    ? (coach.reviews.reduce((sum, r) => 
        sum + ((r.technicalSkills || 0) + (r.communication || 0) + (r.reliability || 0) + (r.valueForMoney || 0)) / 4, 0
      ) / coach.reviews.length).toFixed(1)
    : '0.0';

  const filteredReviews = coach.reviews.filter(review => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === '5') return review.rating === 5;
    if (reviewFilter === '4') return review.rating === 4;
    if (reviewFilter === '3') return review.rating === 3;
    if (reviewFilter === '2') return review.rating === 2;
    if (reviewFilter === '1') return review.rating === 1;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/coaches')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Coach Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${coach.displayName}`} />
                <AvatarFallback>{coach.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{coach.displayName}</h1>
                    {coach.tagline && (
                      <p className="text-lg text-gray-600 mt-1">{coach.tagline}</p>
                    )}
                    
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-lg font-semibold">{coach.averageRating}</span>
                        <span className="ml-1 text-gray-500">({coach.totalReviews} reviews)</span>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-4 w-4 mr-1" />
                        {coach.totalSessions} sessions
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => favoriteMutation.mutate(coach.isFavorited ? 'remove' : 'add')}
                      disabled={favoriteMutation.isPending}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${coach.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {coach.isFavorited ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Coach
                    </Button>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({coach.totalReviews})</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* Specialties */}
                  {coach.specialties && coach.specialties.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Specialties</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Teaching Style */}
                  {coach.teachingStyle && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Teaching Style</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Approach</p>
                            <p className="capitalize">{coach.teachingStyle.approach}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Intensity</p>
                            <p className="capitalize">{coach.teachingStyle.intensity}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Focus</p>
                            <p className="capitalize">{coach.teachingStyle.focus}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Ratings */}
                  {coach.reviews.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Ratings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['technicalSkills', 'communication', 'reliability', 'valueForMoney'].map((skill) => {
                            const average = coach.reviews.reduce((sum, r) => sum + (r[skill as keyof CoachMarketplaceReview] as number || 0), 0) / coach.reviews.length;
                            return (
                              <div key={skill} className="flex items-center justify-between">
                                <span className="text-sm font-medium capitalize">
                                  {skill.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        className={`h-4 w-4 ${star <= average ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">{average.toFixed(1)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Review Filter */}
                  <div className="flex items-center gap-4">
                    <Filter className="h-4 w-4" />
                    <Select value={reviewFilter} onValueChange={setReviewFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reviews</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              {review.isVerifiedBooking && (
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {review.title && (
                            <h4 className="font-semibold mb-2">{review.title}</h4>
                          )}
                          
                          {review.content && (
                            <p className="text-gray-700 mb-3">{review.content}</p>
                          )}
                          
                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {review.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Write Review Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        reviewMutation.mutate(reviewForm);
                      }} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Overall Rating</label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Review Title</label>
                          <input
                            type="text"
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            placeholder="Summary of your experience"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Your Review</label>
                          <Textarea
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Share your experience with this coach..."
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        
                        <Button type="submit" disabled={reviewMutation.isPending}>
                          <Send className="h-4 w-4 mr-2" />
                          {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="availability" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule & Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Response Time</p>
                          <p className="text-lg font-semibold">{coach.responseTime}h</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Sessions Completed</p>
                          <p className="text-lg font-semibold">{coach.totalSessions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                          <p className="text-lg font-semibold">${coach.hourlyRate}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Rating</p>
                          <p className="text-lg font-semibold">{coach.averageRating}/5</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Calendar integration coming soon!</p>
                        <Button size="lg">
                          <Calendar className="h-5 w-5 mr-2" />
                          Book a Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  {coach.isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </CardContent>
            </Card>

            {/* Coach Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Coach Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{coach.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{coach.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold">{coach.averageRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{coach.responseTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold">{coach.profileViews}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {coach.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{coach.location}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;