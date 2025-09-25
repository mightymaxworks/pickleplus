import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Award, Calendar, Clock, QrCode, Copy, Check, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

interface PassportConnectionsTabProps {
  user: any;
  qrCodeData: string;
  passportId: string;
}

export default function PassportConnectionsTab({ user, qrCodeData, passportId }: PassportConnectionsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedPassportId, setCopiedPassportId] = useState(false);

  // Fetch pending coach requests
  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['/api/student/coach-requests'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/student/coach-requests') as any;
        return response.requests || [];
      } catch (error) {
        // If error, return empty array (user might not have any requests)
        return [];
      }
    }
  });

  // Accept coach request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/student/coach-requests/${requestId}/accept`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Accepted",
        description: "Coach connection established successfully!",
        variant: "default"
      });
      
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

  const handleCopyPassportId = async () => {
    try {
      await navigator.clipboard.writeText(passportId);
      setCopiedPassportId(true);
      toast({
        title: "Copied!",
        description: "Passport ID copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedPassportId(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy passport ID",
        variant: "destructive",
      });
    }
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

  const requests = requestsData || [];
  const pendingRequestsCount = requests.length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qr-code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr-code" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="coach-requests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Coach Requests
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0.5">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr-code" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect & Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-4">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={128}
                    level="M"
                    className="block"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Scan to connect and view full profile
                </p>
                
                {/* Passport ID Section */}
                <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground mb-1">Passport ID</p>
                      <p className="font-mono text-lg font-semibold text-gray-900">{passportId}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPassportId}
                      className="ml-3"
                      data-testid="button-copy-passport"
                    >
                      {copiedPassportId ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your unique player identifier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coach-requests" className="space-y-4 mt-6">
          {isLoadingRequests ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Loading coach requests...</p>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
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
            <div className="space-y-4">
              {requests.map((request: CoachRequest) => (
                <Card key={request.id} className="border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {request.coach_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900" data-testid={`text-coach-name-${request.id}`}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}