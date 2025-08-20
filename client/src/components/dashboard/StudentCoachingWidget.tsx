import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { User, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CoachConnection {
  id: number;
  status: 'active' | 'pending';
  studentRequestDate: string;
  coachApprovedDate?: string;
  coach: {
    id: number;
    displayName: string;
    username: string;
    passportCode: string;
    coachLevel: number;
  };
}

export function StudentCoachingWidget() {
  const [passportCode, setPassportCode] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student's coach connections
  const { data: connections, isLoading } = useQuery<CoachConnection[]>({
    queryKey: ['/api/student/coach-connections'],
    staleTime: 30000, // Cache for 30 seconds
  });

  // Request coach connection mutation
  const requestCoachMutation = useMutation({
    mutationFn: async (coachPassportCode: string) => {
      const response = await fetch('/api/student/request-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ coachPassportCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send coach request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your coach connection request has been sent successfully.",
      });
      setPassportCode('');
      setShowConnectForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/student/coach-connections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportCode.trim()) {
      requestCoachMutation.mutate(passportCode.trim().toUpperCase());
    }
  };

  const handlePassportCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPassportCode(value);
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Coaches
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

  const activeConnections = Array.isArray(connections) ? connections.filter(conn => conn.status === 'active') : [];
  const pendingConnections = Array.isArray(connections) ? connections.filter(conn => conn.status === 'pending') : [];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          My Coaches
        </CardTitle>
        <CardDescription>
          Connect with certified coaches for personalized training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Coaches */}
        {activeConnections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Active Connections</h4>
            {activeConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connection.coach?.displayName || 'Unknown Coach'}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {connection.coach?.coachLevel || 'N/A'} Coach
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Pending Requests */}
        {pendingConnections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Pending Requests</h4>
            {pendingConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connection.coach?.displayName || 'Unknown Coach'}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {connection.coach?.coachLevel || 'N/A'} Coach
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* No connections state */}
        {activeConnections.length === 0 && pendingConnections.length === 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">No coaches connected yet</p>
            <p className="text-xs text-gray-500">
              Connect with a coach using their passport code
            </p>
          </div>
        )}

        {/* Connect with Coach Form */}
        {showConnectForm ? (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
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
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={requestCoachMutation.isPending || passportCode.length < 3}
                size="sm"
                className="flex-1"
              >
                {requestCoachMutation.isPending ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowConnectForm(false);
                  setPassportCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button 
            onClick={() => setShowConnectForm(true)} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect with Coach
          </Button>
        )}
      </CardContent>
    </Card>
  );
}