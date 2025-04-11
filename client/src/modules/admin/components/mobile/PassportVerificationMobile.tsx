/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Mobile-Optimized Passport Verification Component
 * 
 * This component provides a streamlined passport verification experience
 * optimized for mobile devices, focusing on quick scanning and verification.
 */

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  ClipboardList, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User, 
  Calendar,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PassportScanner from '@/components/admin/PassportScanner';

interface Event {
  id: number;
  name: string;
}

interface VerificationResult {
  valid: boolean;
  userId?: number;
  username?: string;
  message?: string;
  events?: Array<{id: number; name: string}>;
}

interface VerificationLog {
  id: number;
  passportCode: string;
  userId: number | null;
  eventId: number | null;
  timestamp: string;
  status: string;
  message: string | null;
  verifiedBy: number;
  deviceInfo: string | null;
  ipAddress: string | null;
  user?: {
    username: string;
    displayName: string;
  };
  event?: {
    name: string;
  };
  admin?: {
    username: string;
  };
}

export default function PassportVerificationMobile() {
  const { toast } = useToast();
  const [passportCode, setPassportCode] = useState('');
  const [eventId, setEventId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Fetch available events
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await apiRequest('GET' as const, '/api/events');
      return await response.json();
    }
  });
  
  // Fetch verification logs
  const { 
    data: logs,
    isLoading: logsLoading,
    refetch: refetchLogs
  } = useQuery<VerificationLog[]>({
    queryKey: ['/api/passport/verification-logs'],
    queryFn: async () => {
      const response = await apiRequest('GET' as const, '/api/passport/verification-logs');
      return await response.json();
    }
  });
  
  // Verify passport code mutation
  const verifyPassportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST' as const, '/api/passport/verify', {
        passportCode,
        eventId: eventId ? parseInt(eventId) : undefined
      });
      return await response.json() as VerificationResult;
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      
      if (data.valid) {
        toast({
          title: "Valid Passport",
          description: `User: ${data.username || 'Unknown'}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Invalid Passport",
          description: data.message || "Verification failed",
          variant: "destructive"
        });
      }
      
      // Refresh logs after verification
      refetchLogs();
    },
    onError: () => {
      toast({
        title: "Verification Error",
        description: "Failed to verify passport code",
        variant: "destructive"
      });
    }
  });
  
  // Handle verification form submission
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportCode) {
      verifyPassportMutation.mutate();
    }
  };
  
  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    if (status === 'valid') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">Valid</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">Invalid</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Passport Verification</h1>
      
      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="verify" className="flex flex-col items-center px-1 py-1.5">
            <ClipboardList className="w-4 h-4 mb-1" />
            <span className="text-xs">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex flex-col items-center px-1 py-1.5">
            <QrCode className="w-4 h-4 mb-1" />
            <span className="text-xs">Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex flex-col items-center px-1 py-1.5">
            <ClipboardList className="w-4 h-4 mb-1" />
            <span className="text-xs">Logs</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Manual Verification Tab */}
        <TabsContent value="verify" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Manual Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="passportCode" className="text-xs font-medium">Passport Code</Label>
                  <div className="flex">
                    <Input
                      id="passportCode"
                      placeholder="Enter passport code"
                      value={passportCode}
                      onChange={(e) => setPassportCode(e.target.value)}
                      className="rounded-r-none text-sm"
                      autoComplete="off"
                      autoCapitalize="characters"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-l-none border-l-0"
                      onClick={() => navigator.clipboard.readText().then(text => setPassportCode(text.trim()))}
                    >
                      <ClipboardList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventId" className="text-xs font-medium">Event (Optional)</Label>
                  <select 
                    id="eventId"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Any Event</option>
                    {events?.map((event) => (
                      <option key={event.id} value={event.id.toString()}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={verifyPassportMutation.isPending || !passportCode}
                  className="w-full"
                >
                  {verifyPassportMutation.isPending ? (
                    <>
                      <span className="animate-pulse mr-2">•••</span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </form>
              
              {/* Verification Result */}
              {verificationResult && (
                <div className={`mt-4 p-3 rounded-md ${verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start">
                    {verificationResult.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="ml-2">
                      <p className="font-medium text-sm">
                        {verificationResult.valid ? 'Valid Passport' : 'Invalid Passport'}
                      </p>
                      
                      {verificationResult.valid ? (
                        <>
                          <p className="text-xs mt-1 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {verificationResult.username || 'Unknown User'}
                          </p>
                          
                          {verificationResult.events && verificationResult.events.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Registered Events:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {verificationResult.events.map(event => (
                                  <Badge key={event.id} variant="outline" className="text-[10px] bg-white">
                                    {event.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs mt-1">
                          {verificationResult.message || 'Unknown error occurred'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Scanner Tab */}
        <TabsContent value="scanner" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">QR Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="scannerEventId" className="text-xs font-medium">Event (Optional)</Label>
                  <select 
                    id="scannerEventId"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Any Event</option>
                    {events?.map((event) => (
                      <option key={event.id} value={event.id.toString()}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-black">
                  <PassportScanner
                    eventId={eventId ? parseInt(eventId) : undefined}
                    onSuccessfulScan={() => refetchLogs()}
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Scanner Tips</h3>
                      <div className="mt-1 text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• Make sure camera is allowed in settings</p>
                        <p>• Hold QR code steady with good lighting</p>
                        <p>• Position code within scan area</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed} className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center justify-between w-full">
                    <span className="text-xs">Filter Options</span>
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  <Input 
                    placeholder="Search by passport code..." 
                    className="text-xs" 
                  />
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs">
                    <option value="">All Statuses</option>
                    <option value="valid">Valid</option>
                    <option value="invalid">Invalid</option>
                  </select>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Mobile-optimized logs display */}
              <div className="space-y-3">
                {logsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">Loading logs...</p>
                  </div>
                ) : logs && logs.length > 0 ? (
                  logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-xs">{log.passportCode}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {log.timestamp ? format(new Date(log.timestamp), 'MM/dd/yy h:mm a') : 'N/A'}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(log.status)}
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="text-gray-500">User:</span> {log.user ? log.user.displayName || log.user.username : 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-500">Event:</span> {log.event ? log.event.name : 'N/A'}
                        </div>
                      </div>
                      
                      {log.message && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="text-gray-500">Message:</span> {log.message}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">No verification logs found</p>
                  </div>
                )}
                
                {logs && logs.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View More Logs
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}