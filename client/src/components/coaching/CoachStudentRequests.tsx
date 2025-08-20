import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { User, UserCheck, UserX, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudentRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  studentRequestDate: string;
  coachApprovedDate?: string;
  student: {
    id: number;
    displayName: string;
    username: string;
    passportCode: string;
    rankingPoints: number;
  };
}

export function CoachStudentRequests() {
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coach's student requests
  const { data: requests, isLoading } = useQuery<StudentRequest[]>({
    queryKey: ['/api/coach/student-requests'],
    staleTime: 30000, // Cache for 30 seconds
  });

  // Process request mutation (approve/reject)
  const processRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: number; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/coach/process-student-request/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'approve' ? 'approved' : 'rejected';
      toast({
        title: `Request ${actionText}!`,
        description: `Student connection request has been ${actionText}.`,
      });
      setProcessingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/coach/student-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessingRequestId(null);
    },
  });

  const handleProcessRequest = (requestId: number, action: 'approve' | 'reject') => {
    setProcessingRequestId(requestId);
    processRequestMutation.mutate({ requestId, action });
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = Array.isArray(requests) ? requests.filter(req => req.status === 'pending') : [];
  const recentlyProcessed = Array.isArray(requests) ? requests.filter(req => req.status !== 'pending').slice(0, 3) : [];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Requests
          </div>
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pendingRequests.length} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Manage student connection requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Pending Requests</h4>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.student?.displayName || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-gray-600">
                        @{request.student?.username || 'unknown'} • {request.student?.rankingPoints || 0} pts
                      </p>
                      <p className="text-xs text-gray-500">
                        Requested {formatDistanceToNow(new Date(request.studentRequestDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleProcessRequest(request.id, 'approve')}
                    disabled={processingRequestId === request.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingRequestId === request.id ? (
                      <>
                        <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProcessRequest(request.id, 'reject')}
                    disabled={processingRequestId === request.id}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Processed */}
        {recentlyProcessed.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Recently Processed</h4>
            {recentlyProcessed.map((request) => (
              <div
                key={request.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  request.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    request.status === 'approved'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    <User className={`w-4 h-4 ${
                      request.status === 'approved'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{request.student?.displayName || 'Unknown Student'}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.status === 'approved' ? 'Approved' : 'Rejected'} {
                        request.coachApprovedDate 
                          ? formatDistanceToNow(new Date(request.coachApprovedDate), { addSuffix: true })
                          : 'recently'
                      }
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={request.status === 'approved' ? 'default' : 'destructive'}
                  className={request.status === 'approved' 
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                  }
                >
                  {request.status === 'approved' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <UserX className="w-3 h-3 mr-1" />
                  )}
                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* No requests state */}
        {pendingRequests.length === 0 && recentlyProcessed.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">No student requests yet</p>
            <p className="text-xs text-gray-500">
              Students can connect with you using your passport code
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}