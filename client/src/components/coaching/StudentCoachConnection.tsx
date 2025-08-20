import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, UserCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Coach {
  id: number;
  displayName: string;
  username: string;
  passportCode: string;
  coachLevel: number;
}

interface CoachConnection {
  id: number;
  coach: Coach;
  status: 'pending' | 'active' | 'inactive';
  studentRequestDate: string;
  coachApprovedDate?: string;
}

export function StudentCoachConnection() {
  const [passportCode, setPassportCode] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current coach connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['/api/student/coach-connections'],
    retry: false,
  });

  // Request coach connection mutation
  const requestCoachMutation = useMutation({
    mutationFn: async (coachPassportCode: string) => {
      const response = await apiRequest('POST', '/api/student/request-coach', {
        coachPassportCode: coachPassportCode.toUpperCase()
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Coach Connection Requested",
        description: `Request sent to ${data.coachDisplayName}. They will receive a notification to approve your request.`
      });
      setPassportCode('');
      queryClient.invalidateQueries({ queryKey: ['/api/student/coach-connections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportCode.trim().length === 0) {
      toast({
        title: "Passport Code Required",
        description: "Please enter your coach's passport code",
        variant: "destructive",
      });
      return;
    }
    requestCoachMutation.mutate(passportCode.trim());
  };

  const formatPassportCode = (code: string) => {
    // Format as user types - uppercase and limit to 8 characters
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  };

  const handlePassportCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassportCode(formatPassportCode(e.target.value));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your coach connections...</p>
        </CardContent>
      </Card>
    );
  }

  const activeConnections = Array.isArray(connections) ? connections.filter((conn: CoachConnection) => conn.status === 'active') : [];
  const pendingConnections = Array.isArray(connections) ? connections.filter((conn: CoachConnection) => conn.status === 'pending') : [];

  return (
    <div className="space-y-6">
      {/* Active Coach Connections */}
      {activeConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Your Coaches ({activeConnections.length})
            </CardTitle>
            <CardDescription>
              You are currently connected to these coaches for assessments and training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeConnections.map((connection: CoachConnection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{connection.coach?.displayName || 'Unknown Coach'}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {connection.coach?.coachLevel || 'N/A'} Coach • {connection.coach?.passportCode || 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              Waiting for coach approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingConnections.map((connection: CoachConnection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{connection.coach?.displayName || 'Unknown Coach'}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {connection.coach?.coachLevel || 'N/A'} Coach • {connection.coach?.passportCode || 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                  Pending
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request New Coach Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Connect with a Coach</CardTitle>
          <CardDescription>
            Enter your coach's passport code to request a connection. Your coach will need to approve the request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passport-code">Coach Passport Code</Label>
              <Input
                id="passport-code"
                type="text"
                placeholder="e.g., ABC12DEF"
                value={passportCode}
                onChange={handlePassportCodeChange}
                maxLength={8}
                className="uppercase"
                disabled={requestCoachMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Ask your coach for their 8-character passport code
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={requestCoachMutation.isPending || passportCode.length < 3}
              className="w-full"
            >
              {requestCoachMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Sending Request...
                </>
              ) : (
                'Request Coach Connection'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">How it works</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>1. Get each coach's passport code in person at courts or events</li>
                <li>2. Enter codes and send connection requests to multiple coaches</li>
                <li>3. Each coach will approve their individual request</li>
                <li>4. Work with multiple coaches for diverse training perspectives</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}