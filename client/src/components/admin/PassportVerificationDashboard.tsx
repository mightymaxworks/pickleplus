/**
 * PKL-278651-CONN-0004-PASS-ADMIN - Passport Verification Admin Dashboard
 * This component provides a comprehensive interface for administrators to:
 * 1. Verify passport codes
 * 2. View verification logs
 * 3. Search logs by user, event, passport code, etc.
 */

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Search, QrCode, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Import the scanner component
import PassportScanner from "./PassportScanner";

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
  // Additional fields from joins
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

const PassportVerificationDashboard: React.FC = () => {
  const { toast } = useToast();
  const [passportCode, setPassportCode] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<{
    passportCode?: string;
    userId?: string;
    eventId?: string;
    status?: string;
  }>({});

  interface Event {
    id: number;
    name: string;
  }

  // Fetch verification logs
  const {
    data: logs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['/api/passport/logs', searchFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (searchFilter.passportCode) {
        queryParams.append('passportCode', searchFilter.passportCode);
      }
      if (searchFilter.userId) {
        queryParams.append('userId', searchFilter.userId);
      }
      if (searchFilter.eventId) {
        queryParams.append('eventId', searchFilter.eventId);
      }
      if (searchFilter.status) {
        queryParams.append('status', searchFilter.status);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/passport/logs${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiRequest(endpoint);
      return response as VerificationLog[];
    }
  });

  // Fetch events for dropdown
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await apiRequest('/api/events');
      return response as Event[];
    }
  });

  interface VerificationResult {
    valid: boolean;
    userId?: number;
    username?: string;
    message?: string;
    events?: Array<{id: number; name: string}>;
  }

  // Verify passport mutation
  const verifyPassportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/passport/verify', {
        method: 'POST',
        body: JSON.stringify({
          passportCode,
          eventId: eventId ? parseInt(eventId) : undefined
        })
      });
      return response as VerificationResult;
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: "Passport verified successfully",
          description: `User: ${data.username || 'Unknown'}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid passport",
          description: data.message || "Passport verification failed",
          variant: "destructive",
        });
      }
      refetchLogs();
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: "There was an error verifying the passport",
        variant: "destructive",
      });
    }
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportCode.trim()) {
      toast({
        title: "Passport code required",
        description: "Please enter a passport code to verify",
        variant: "destructive",
      });
      return;
    }
    verifyPassportMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchLogs();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Valid</Badge>;
      case 'invalid':
        return <Badge className="bg-red-500"><XCircle className="w-4 h-4 mr-1" /> Invalid</Badge>;
      default:
        return <Badge className="bg-yellow-500"><AlertCircle className="w-4 h-4 mr-1" /> {status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Passport Verification Dashboard</h1>
      
      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="verify">
            <ClipboardList className="w-4 h-4 mr-2" />
            Manual Verification
          </TabsTrigger>
          <TabsTrigger value="scanner">
            <QrCode className="w-4 h-4 mr-2" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Search className="w-4 h-4 mr-2" />
            Verification Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Verify Passport</CardTitle>
              <CardDescription>
                Enter a passport code to verify its validity. Optionally select an event to check if the passport is registered for that event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passportCode">Passport Code</Label>
                    <Input
                      id="passportCode"
                      placeholder="Enter passport code"
                      value={passportCode}
                      onChange={(e) => setPassportCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event (Optional)</Label>
                    <Select value={eventId} onValueChange={setEventId}>
                      <SelectTrigger id="eventId">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Event</SelectItem>
                        {events?.map((event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={verifyPassportMutation.isPending || !passportCode}
                  className="w-full"
                >
                  {verifyPassportMutation.isPending ? "Verifying..." : "Verify Passport"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>
                Scan passport QR codes using your device's camera to verify attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PassportScanner
                eventId={eventId ? parseInt(eventId) : undefined}
                onSuccessfulScan={() => refetchLogs()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Verification Logs</CardTitle>
              <CardDescription>
                View and search through passport verification logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchPassportCode">Passport Code</Label>
                    <Input
                      id="searchPassportCode"
                      placeholder="Search by code"
                      value={searchFilter.passportCode || ''}
                      onChange={(e) => setSearchFilter(prev => ({ ...prev, passportCode: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="searchUserId">User ID</Label>
                    <Input
                      id="searchUserId"
                      placeholder="Search by user ID"
                      value={searchFilter.userId || ''}
                      onChange={(e) => setSearchFilter(prev => ({ ...prev, userId: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="searchEventId">Event ID</Label>
                    <Input
                      id="searchEventId"
                      placeholder="Search by event ID"
                      value={searchFilter.eventId || ''}
                      onChange={(e) => setSearchFilter(prev => ({ ...prev, eventId: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="searchStatus">Status</Label>
                    <Select 
                      value={searchFilter.status || ''} 
                      onValueChange={(value) => setSearchFilter(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="searchStatus">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" /> Search Logs
                </Button>
              </form>
              
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Passport verification logs</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Passport Code</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Verified By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading logs...</TableCell>
                      </TableRow>
                    ) : logs && logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy h:mm a') : 'N/A'}
                          </TableCell>
                          <TableCell>{log.passportCode}</TableCell>
                          <TableCell>
                            {log.user ? `${log.user.displayName || log.user.username}` : log.userId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.event ? log.event.name : log.eventId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>{log.message || '-'}</TableCell>
                          <TableCell>
                            {log.admin ? log.admin.username : log.verifiedBy}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No verification logs found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassportVerificationDashboard;