/**
 * Provisional Rating Management System
 * 
 * Comprehensive system for managing PROVISIONAL vs CONFIRMED ratings with:
 * - L4+ coach validation workflow
 * - Rating expiry management and notifications
 * - Upgrade pathways from PROVISIONAL to CONFIRMED
 * - Student and coach interfaces for rating status
 * - Automated expiry handling and renewal processes
 * 
 * UDF Compliance: Rules 31-34 (Enhanced Coach Assessment System)
 * 
 * @version 2.0.0
 * @lastModified September 23, 2025
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Star,
  Calendar,
  User,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  Award,
  Eye,
  ArrowUp,
  Timer,
  Bell,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface StudentRating {
  id: number;
  studentId: number;
  studentName: string;
  currentPCP: number;
  ratingStatus: 'PROVISIONAL' | 'CONFIRMED';
  assessmentDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  assessingCoach: {
    id: number;
    name: string;
    level: number;
  };
  skillsAssessed: number;
  assessmentConfidence: number;
  validationRequests?: ValidationRequest[];
  canBeConfirmed: boolean;
  requiresValidation: boolean;
}

interface ValidationRequest {
  id: number;
  requestedBy: number;
  requestedByName: string;
  targetRatingId: number;
  status: 'pending' | 'approved' | 'rejected';
  requestNotes?: string;
  reviewNotes?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewedByName?: string;
}

interface L4PlusCoach {
  id: number;
  name: string;
  level: number;
  validationsCompleted: number;
  averageReviewTime: number;
  specializations: string[];
  availability: 'available' | 'busy' | 'away';
}

interface ProvisionalRatingManagementProps {
  userId: number;
  userRole: 'student' | 'coach' | 'admin';
  studentId?: number; // For coach/admin viewing specific student
}

export function ProvisionalRatingManagement({
  userId,
  userRole,
  studentId
}: ProvisionalRatingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ratings');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'provisional' | 'expiring' | 'confirmed'>('all');

  const targetStudentId = studentId || (userRole === 'student' ? userId : null);

  // Fetch student ratings
  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['/api/coaching/student-ratings', targetStudentId],
    queryFn: async () => {
      if (!targetStudentId) return [];
      const response = await apiRequest('GET', `/api/coaching/student-ratings/${targetStudentId}`);
      return response.json() as Promise<StudentRating[]>;
    },
    enabled: !!targetStudentId
  });

  // Fetch validation requests (for coaches and admins)
  const { data: validationRequests } = useQuery({
    queryKey: ['/api/coaching/validation-requests', userId, userRole],
    queryFn: async () => {
      const endpoint = userRole === 'admin' ? 
        '/api/coaching/validation-requests/all' : 
        `/api/coaching/validation-requests/coach/${userId}`;
      const response = await apiRequest('GET', endpoint);
      return response.json() as Promise<ValidationRequest[]>;
    },
    enabled: userRole === 'coach' || userRole === 'admin'
  });

  // Fetch available L4+ coaches for validation requests
  const { data: l4PlusCoaches } = useQuery({
    queryKey: ['/api/coaching/l4-plus-coaches'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coaching/l4-plus-coaches');
      return response.json() as Promise<L4PlusCoach[]>;
    },
    enabled: userRole === 'student' || userRole === 'coach'
  });

  // Request validation mutation
  const requestValidation = useMutation({
    mutationFn: async ({ ratingId, validatorId, notes }: { ratingId: number; validatorId: number; notes?: string }) => {
      const response = await apiRequest('POST', '/api/coaching/request-validation', {
        ratingId,
        validatorId,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/student-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/validation-requests'] });
      toast({
        title: "Validation Requested",
        description: "Your rating validation request has been submitted to an L4+ coach.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit validation request",
        variant: "destructive",
      });
    }
  });

  // Review validation request (for L4+ coaches)
  const reviewValidation = useMutation({
    mutationFn: async ({ requestId, action, notes }: { requestId: number; action: 'approve' | 'reject'; notes?: string }) => {
      const response = await apiRequest('POST', '/api/coaching/review-validation', {
        requestId,
        action,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/validation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/student-ratings'] });
      toast({
        title: "Validation Reviewed",
        description: "Rating validation has been processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to process validation review",
        variant: "destructive",
      });
    }
  });

  // Renew expiring rating
  const renewRating = useMutation({
    mutationFn: async ({ ratingId }: { ratingId: number }) => {
      const response = await apiRequest('POST', '/api/coaching/renew-rating', { ratingId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/student-ratings'] });
      toast({
        title: "Rating Renewed",
        description: "Rating expiry has been extended by 60 days.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Renewal Failed",
        description: error.message || "Failed to renew rating",
        variant: "destructive",
      });
    }
  });

  // Filter ratings
  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    
    return ratings.filter(rating => {
      switch (selectedFilter) {
        case 'provisional':
          return rating.ratingStatus === 'PROVISIONAL';
        case 'confirmed':
          return rating.ratingStatus === 'CONFIRMED';
        case 'expiring':
          return rating.daysUntilExpiry <= 14; // Expiring within 14 days
        default:
          return true;
      }
    });
  }, [ratings, selectedFilter]);

  // Get rating status badge
  const getRatingStatusBadge = (rating: StudentRating) => {
    if (rating.ratingStatus === 'CONFIRMED') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>
      );
    }

    if (rating.daysUntilExpiry <= 7) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <Timer className="w-3 h-3 mr-1" />
          Expiring in {rating.daysUntilExpiry} days
        </Badge>
      );
    }

    if (rating.daysUntilExpiry <= 14) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Expires in {rating.daysUntilExpiry} days
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Shield className="w-3 h-3 mr-1" />
        Provisional
      </Badge>
    );
  };

  if (ratingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading rating information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="provisional-rating-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'student' ? 'My Ratings' : 'Rating Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            Manage PROVISIONAL and CONFIRMED assessment ratings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedFilter} onValueChange={setSelectedFilter as any}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="provisional">Provisional</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ratings">Ratings Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation Requests</TabsTrigger>
          <TabsTrigger value="coaches">L4+ Coaches</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings" className="space-y-6">
          {/* Summary Cards */}
          {ratings && ratings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                      <p className="text-2xl font-bold text-blue-600">{ratings.length}</p>
                    </div>
                    <Star className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {ratings.filter(r => r.ratingStatus === 'CONFIRMED').length}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Provisional</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {ratings.filter(r => r.ratingStatus === 'PROVISIONAL').length}
                      </p>
                    </div>
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-red-600">
                        {ratings.filter(r => r.daysUntilExpiry <= 14).length}
                      </p>
                    </div>
                    <Timer className="w-6 h-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rating Cards */}
          <div className="space-y-4">
            {filteredRatings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No ratings found matching the selected filter</p>
                </CardContent>
              </Card>
            ) : (
              filteredRatings.map((rating) => (
                <Card key={rating.id} className="border-l-4 border-l-blue-400" data-testid={`rating-card-${rating.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            PCP Rating: {rating.currentPCP.toFixed(2)}
                          </h3>
                          {getRatingStatusBadge(rating)}
                          <Badge variant="outline" className="text-xs">
                            {rating.assessmentConfidence * 100}% confidence
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Assessed by: <span className="font-medium">
                                {rating.assessingCoach.name} (L{rating.assessingCoach.level})
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Assessment Date: {new Date(rating.assessmentDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Skills Assessed: <span className="font-medium">{rating.skillsAssessed}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Expires: {new Date(rating.expiryDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Days Until Expiry: <span className={`font-medium ${
                                rating.daysUntilExpiry <= 7 ? 'text-red-600' : 
                                rating.daysUntilExpiry <= 14 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {rating.daysUntilExpiry}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Expiry Warning */}
                        {rating.daysUntilExpiry <= 14 && rating.ratingStatus === 'PROVISIONAL' && (
                          <Alert className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {rating.daysUntilExpiry <= 7 ? 
                                <strong>URGENT: This provisional rating expires in {rating.daysUntilExpiry} days!</strong> :
                                <strong>This provisional rating expires in {rating.daysUntilExpiry} days.</strong>
                              }
                              {rating.canBeConfirmed && " Consider requesting L4+ coach validation to make it permanent."}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Validation Status */}
                        {rating.validationRequests && rating.validationRequests.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Validation Requests:</p>
                            <div className="space-y-2">
                              {rating.validationRequests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      Requested from: {request.requestedByName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {new Date(request.requestedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge variant={
                                    request.status === 'approved' ? 'default' :
                                    request.status === 'rejected' ? 'destructive' : 'secondary'
                                  }>
                                    {request.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-6">
                        {rating.ratingStatus === 'PROVISIONAL' && rating.canBeConfirmed && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Open validation request modal - would need modal implementation
                              // For now, just show available coaches
                              console.log('Request validation for rating:', rating.id);
                            }}
                            data-testid={`request-validation-${rating.id}`}
                          >
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Request Confirmation
                          </Button>
                        )}
                        
                        {rating.daysUntilExpiry <= 30 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => renewRating.mutate({ ratingId: rating.id })}
                            disabled={renewRating.isPending}
                            data-testid={`renew-rating-${rating.id}`}
                          >
                            {renewRating.isPending ? (
                              <>
                                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
                                Renewing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Renew
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {/* Validation Requests Queue */}
          {validationRequests && validationRequests.length > 0 ? (
            <div className="space-y-4">
              {validationRequests.map((request) => (
                <Card key={request.id} data-testid={`validation-request-${request.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Validation Request #{request.id}
                          </h3>
                          <Badge variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {request.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">
                            Requested by: <span className="font-medium">{request.requestedByName}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(request.requestedAt).toLocaleString()}
                          </p>
                          {request.requestNotes && (
                            <p className="text-sm text-gray-600">
                              Notes: <span className="italic">"{request.requestNotes}"</span>
                            </p>
                          )}
                          {request.reviewNotes && (
                            <p className="text-sm text-gray-600">
                              Review: <span className="italic">"{request.reviewNotes}"</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {request.status === 'pending' && userRole === 'coach' && (
                        <div className="flex flex-col gap-2 ml-6">
                          <Button
                            size="sm"
                            onClick={() => reviewValidation.mutate({ 
                              requestId: request.id, 
                              action: 'approve',
                              notes: 'Approved by L4+ coach validation'
                            })}
                            disabled={reviewValidation.isPending}
                            data-testid={`approve-validation-${request.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reviewValidation.mutate({ 
                              requestId: request.id, 
                              action: 'reject',
                              notes: 'Rejected - requires additional assessment'
                            })}
                            disabled={reviewValidation.isPending}
                            data-testid={`reject-validation-${request.id}`}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No validation requests found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coaches" className="space-y-6">
          {/* L4+ Coaches Available for Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Available L4+ Coaches</CardTitle>
              <CardDescription>
                These coaches are qualified to confirm PROVISIONAL ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {l4PlusCoaches && l4PlusCoaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {l4PlusCoaches.map((coach) => (
                    <div key={coach.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">L{coach.level}</Badge>
                          <div className={`w-2 h-2 rounded-full ${
                            coach.availability === 'available' ? 'bg-green-500' :
                            coach.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Validations Completed: {coach.validationsCompleted}</p>
                        <p>Avg Review Time: {coach.averageReviewTime} hours</p>
                        {coach.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {coach.specializations.map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No L4+ coaches available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProvisionalRatingManagement;