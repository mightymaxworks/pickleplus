import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Award, Calendar, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CoachRequest {
  id: number;
  coach_id: number;
  student_id: number;
  status: string;
  student_request_date: string;
  coach_name: string;
  coach_email: string;
  coach_level: string;
  specializations: string[];
  years_experience: number;
  certifications: string[];
}

export default function StudentCoachRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending coach requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['/api/student/coach-requests'],
    queryFn: async () => {
      const response = await apiRequest('/api/student/coach-requests') as any;
      return response.requests || [];
    }
  });

  // Accept coach request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/student/coach-requests/${requestId}/accept`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Request Accepted",
        description: "Coach connection established successfully!",
        variant: "default"
      });
      
      // Invalidate and refetch requests
      queryClient.invalidateQueries({ queryKey: ['/api/student/coach-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Accept Failed",
        description: error?.message || "Failed to accept coach request",
        variant: "destructive"
      });
    }
  });

  // Reject coach request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/student/coach-requests/${requestId}/reject`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "Coach request has been declined.",
        variant: "default"
      });
      
      // Invalidate and refetch requests
      queryClient.invalidateQueries({ queryKey: ['/api/student/coach-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reject Failed",
        description: error?.message || "Failed to reject coach request",
        variant: "destructive"
      });
    }
  });

  const handleAccept = (requestId: number) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: number) => {
    rejectMutation.mutate(requestId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'L5': case 'LEVEL 5': return 'default';
      case 'L4': case 'LEVEL 4': return 'secondary';
      case 'L3': case 'LEVEL 3': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-600">Loading coach requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Requests</h3>
              <p className="text-red-700">Failed to load coach requests. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const requests = requestsData || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Requests</h1>
          <p className="text-gray-600">
            Review and manage incoming coach connection requests.
          </p>
        </div>

        {/* Coach Requests List */}
        {requests.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You don't have any pending coach requests at the moment. 
                When coaches want to connect with you for assessments, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request: CoachRequest) => (
              <Card key={request.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {request.coach_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {request.coach_name || 'Coach'}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{request.coach_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {request.coach_level && (
                        <Badge variant={getLevelBadgeVariant(request.coach_level)}>
                          <Award className="h-3 w-3 mr-1" />
                          {request.coach_level}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(request.student_request_date)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Coach Details */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {request.years_experience && (
                      <div>
                        <span className="font-medium text-gray-700">Experience:</span>
                        <span className="ml-2 text-gray-600">{request.years_experience} years</span>
                      </div>
                    )}
                    
                    {request.specializations && request.specializations.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Specializations:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {request.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {request.certifications && request.certifications.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Certifications:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {request.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      data-testid={`button-accept-${request.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                      data-testid={`button-reject-${request.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}