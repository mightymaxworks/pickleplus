/**
 * PKL-278651-COMM-0014-JOIN
 * Join Request Management Component
 * 
 * This component provides an interface for managing join requests in the community
 * management tab. It includes a panel with request counts and the join requests panel.
 */

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  // Active tab state - defaults to pending tab
  const [activeTab, setActiveTab] = useState<string>("pending");
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // You could also add analytics tracking here
    console.log(`Join request tab changed to: ${value}`);
  };
  
  // Get access to the query client for manual cache operations
  const queryClient = useQueryClient();
  
  // Every time a tab change happens, we invalidate queries to refresh data
  useEffect(() => {
    // Invalidate the requests query for the current tab to ensure fresh data
    queryClient.invalidateQueries({
      queryKey: ["/api/communities", communityId, "join-requests", activeTab],
    });
    
    // We could also refresh counts if needed
    queryClient.invalidateQueries({
      queryKey: ["/api/communities", communityId, "join-requests-count"],
    });
  }, [activeTab, communityId, queryClient]);
  
  // Fetch request counts - using mock data until API is implemented
  const { data: requestCounts, isLoading } = useQuery({
    queryKey: ["/api/communities", communityId, "join-requests-count"],
    queryFn: async () => {
      // Mock data until API endpoint is implemented
      return {
        pending: 2,
        approved: 1,
        rejected: 1,
        total: 4
      };
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
      
      {/* Stats Cards - Clickable to filter */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "all" ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"}`}
          onClick={() => handleTabChange("all")}
        >
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
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "pending" ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"}`}
          onClick={() => handleTabChange("pending")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pending}</div>
            <p className="text-xs text-muted-foreground">Need your attention</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "approved" ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"}`}
          onClick={() => handleTabChange("approved")}
        >
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
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "rejected" ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"}`}
          onClick={() => handleTabChange("rejected")}
        >
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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
          <JoinRequestsPanel communityId={communityId} statusFilter="pending" />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-0">
          <JoinRequestsPanel communityId={communityId} statusFilter="approved" />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-0">
          <JoinRequestsPanel communityId={communityId} statusFilter="rejected" />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <JoinRequestsPanel communityId={communityId} statusFilter="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
}