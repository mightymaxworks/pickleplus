/**
 * PKL-278651-COMM-0014-JOIN
 * Join Request Management Component
 * 
 * This component provides an interface for managing join requests in the community
 * management tab. It includes a panel with request counts and the join requests panel.
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JoinRequestsPanel } from "./JoinRequestsPanel";
import { CommunityJoinRequestStatus } from "@/types/community";
import { Bell, Users } from "lucide-react";

interface JoinRequestManagementProps {
  communityId: number;
}

export function JoinRequestManagement({ communityId }: JoinRequestManagementProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("pending");
  
  // Fetch request counts
  const { data: requestCounts, isLoading } = useQuery({
    queryKey: ["/api/communities", communityId, "join-requests-count"],
    queryFn: async () => {
      const response = await apiRequest<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
      }>(`/api/communities/${communityId}/join-requests/counts`);
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for latest counts
  });
  
  // Default counts while loading
  const counts = requestCounts || {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Join Request Management</h2>
        
        {/* Badge to show pending count */}
        {counts.pending > 0 && (
          <div className="flex items-center">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Bell className="h-3.5 w-3.5 mr-1" />
              {counts.pending} pending requests
            </Badge>
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              {counts.total === 1 ? "Request" : "Requests"} all time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pending}</div>
            <p className="text-xs text-muted-foreground">Need your attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.approved}</div>
            <p className="text-xs text-muted-foreground">
              {counts.approved === 1 ? "Member" : "Members"} added
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {counts.rejected === 1 ? "Request" : "Requests"} declined
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Requests Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending
            {counts.pending > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-yellow-500 text-white text-xs px-1.5"
              >
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-0">
          <JoinRequestsPanel communityId={communityId} />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-0">
          <JoinRequestsPanel communityId={communityId} />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-0">
          <JoinRequestsPanel communityId={communityId} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <JoinRequestsPanel communityId={communityId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}