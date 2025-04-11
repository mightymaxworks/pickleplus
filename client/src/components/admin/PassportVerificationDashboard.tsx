/**
 * PKL-278651-ADMIN-0002-UI
 * Passport Verification Admin Dashboard
 * 
 * This component provides a comprehensive interface for administrators to:
 * 1. Verify passport codes
 * 2. View verification logs
 * 3. Search logs by user, event, passport code, etc.
 * 
 * Mobile optimization features:
 * - Responsive table with horizontal scrolling for small screens
 * - Simplified layout for verification form on small screens
 * - Optimized QR scanner for mobile devices
 * - Collapsible search filters for log viewing
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
      return await response.json() as VerificationLog[];
    }
  });

  // Fetch events for dropdown
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await apiRequest('/api/events');
      return await response.json() as Event[];
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
      return await response.json() as VerificationResult;
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
          <TabsTrigger value="verify" className="flex flex-col sm:flex-row items-center px-1 py-1.5 sm:py-2">
            <ClipboardList className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex flex-col sm:flex-row items-center px-1 py-1.5 sm:py-2">
            <QrCode className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex flex-col sm:flex-row items-center px-1 py-1.5 sm:py-2">
            <Search className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="verify">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Verify Passport</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter a passport code to verify its validity. Optionally select an event to check if the passport is registered for that event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passportCode" className="text-sm font-medium">Passport Code</Label>
                    <div className="flex">
                      <Input
                        id="passportCode"
                        placeholder="Enter passport code"
                        value={passportCode}
                        onChange={(e) => setPassportCode(e.target.value)}
                        className="rounded-r-none"
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
                    <Label htmlFor="eventId" className="text-sm font-medium">Event (Optional)</Label>
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
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={verifyPassportMutation.isPending || !passportCode}
                    className="w-full"
                    size="lg"
                  >
                    {verifyPassportMutation.isPending ? (
                      <>
                        <span className="animate-pulse mr-2">•••</span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Passport
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanner">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">QR Code Scanner</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Scan passport QR codes using your device's camera to verify attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scannerEventId" className="text-sm font-medium">Event (Optional)</Label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger id="scannerEventId">
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
                        <p>• Make sure your camera is allowed in browser settings</p>
                        <p>• Hold the QR code steady and ensure good lighting</p>
                        <p>• Position the code within the scanning area</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Verification Logs</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and search through passport verification logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Collapsible Search Filters for Mobile */}
              <div className="mb-6">
                <details className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <summary className="cursor-pointer px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span className="font-medium">Search Filters</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Object.values(searchFilter).filter(Boolean).length} active filter(s)
                    </span>
                  </summary>
                  <div className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
                      
                      <div className="flex space-x-2">
                        <Button type="submit" variant="outline" className="flex-1">
                          <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setSearchFilter({})}
                          className="px-3"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </details>
              </div>
              
              {/* Responsive Table with horizontal scrolling for mobile */}
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Passport verification logs</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap w-28">Date</TableHead>
                        <TableHead className="whitespace-nowrap w-24">Passport</TableHead>
                        <TableHead className="whitespace-nowrap w-28">User</TableHead>
                        <TableHead className="whitespace-nowrap">Event</TableHead>
                        <TableHead className="whitespace-nowrap w-20">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Message</TableHead>
                        <TableHead className="whitespace-nowrap">Verified By</TableHead>
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
                            <TableCell className="whitespace-nowrap text-xs">
                              {log.timestamp ? format(new Date(log.timestamp), 'MM/dd/yy h:mm a') : 'N/A'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.passportCode}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              {log.user ? `${log.user.displayName || log.user.username}` : log.userId || 'N/A'}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-xs">
                              {log.event ? log.event.name : log.eventId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(log.status)}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-xs">
                              {log.message || '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassportVerificationDashboard;