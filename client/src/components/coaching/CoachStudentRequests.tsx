import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, User, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StudentRequest {
  id: number;
  studentRequestDate: string;
  coachPassportCode: string;
  notes: string;
  student: {
    id: number;
    displayName: string;
    username: string;
    passportCode: string;
    skillLevel: number;
  };
}

export function CoachStudentRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get pending student requests
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['/api/coach/pending-requests'],
    retry: false,
  });

  // Respond to student request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ connectionId, approved }: { connectionId: number; approved: boolean }) => {
      const response = await apiRequest('POST', '/api/coach/respond-to-request', {
        connectionId,
        approved
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.approved ? "Student Approved" : "Request Rejected",
        description: data.message
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/assigned-students'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (connectionId: number) => {
    respondToRequestMutation.mutate({ connectionId, approved: true });
  };

  const handleReject = (connectionId: number) => {
    respondToRequestMutation.mutate({ connectionId, approved: false });
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading student requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (!pendingRequests || !Array.isArray(pendingRequests) || pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Connection Requests
          </CardTitle>
          <CardDescription>
            Manage requests from students who want to connect with you for coaching
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">No pending requests</p>
          <p className="text-sm text-gray-500 mt-1">
            Students can request to connect with you using your passport code
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Student Connection Requests
        </CardTitle>
        <CardDescription>
          Review and approve student connection requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(pendingRequests as StudentRequest[]).map((request: StudentRequest) => (
          <div key={request.id} className="border rounded-lg p-4 bg-orange-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{request.student.displayName}</h3>
                    <Badge variant="outline" className="text-xs">
                      Skill Level {request.student.skillLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Username: @{request.student.username}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Passport: {request.student.passportCode}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Requested {formatDate(request.studentRequestDate)}</span>
                  </div>
                  {request.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {request.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={respondToRequestMutation.isPending}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={respondToRequestMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {respondToRequestMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}