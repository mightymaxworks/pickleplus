/**
 * PKL-278651-COMM-0014-JOIN
 * Join Request Management Panel
 * 
 * This component provides an interface for community administrators to
 * manage pending join requests for communities that require approval.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, User, Search, RefreshCw, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useCommunityContext } from "@/lib/providers/CommunityProvider";
import { CommunityJoinRequest, CommunityJoinRequestStatus } from "@/types/community";
import { useToast } from "@/hooks/use-toast";

// Mock data function for join requests
function getMockJoinRequests(status: string): CommunityJoinRequest[] {
  const baseRequests: CommunityJoinRequest[] = [
    {
      id: 1,
      communityId: 2,
      userId: 2,
      message: "I'd love to join your community to improve my skills!",
      status: CommunityJoinRequestStatus.PENDING,
      reviewedByUserId: null,
      reviewedAt: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      updatedAt: null,
      user: {
        username: "pickleballpro",
        displayName: "Pickleball Pro",
        avatarUrl: null,
        email: "pro@example.com",
        skillLevel: "Advanced",
        playerRating: 4.2
      }
    },
    {
      id: 2,
      communityId: 2,
      userId: 3,
      message: "New to the area, looking for players!",
      status: CommunityJoinRequestStatus.PENDING,
      reviewedByUserId: null,
      reviewedAt: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      updatedAt: null,
      user: {
        username: "newbie_player",
        displayName: "Newbie Player",
        avatarUrl: null,
        email: "newbie@example.com",
        skillLevel: "Beginner",
        playerRating: 2.5
      }
    },
    {
      id: 3,
      communityId: 2,
      userId: 4,
      message: "Tournament player looking for practice partners",
      status: CommunityJoinRequestStatus.APPROVED,
      reviewedByUserId: 1,
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: {
        username: "tournament_ace",
        displayName: "Tournament Ace",
        avatarUrl: null,
        email: "ace@example.com",
        skillLevel: "Expert",
        playerRating: 4.8
      }
    },
    {
      id: 4,
      communityId: 2,
      userId: 5,
      message: "Not a good fit for the community",
      status: CommunityJoinRequestStatus.REJECTED,
      reviewedByUserId: 1,
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      user: {
        username: "random_player",
        displayName: "Random Player",
        avatarUrl: null,
        email: "random@example.com",
        skillLevel: "Intermediate",
        playerRating: 3.1
      }
    }
  ];
  
  // Filter the data based on status
  if (status === "all") {
    return baseRequests;
  } else if (status === "pending") {
    return baseRequests.filter(r => r.status === CommunityJoinRequestStatus.PENDING);
  } else if (status === "approved") {
    return baseRequests.filter(r => r.status === CommunityJoinRequestStatus.APPROVED);
  } else if (status === "rejected") {
    return baseRequests.filter(r => r.status === CommunityJoinRequestStatus.REJECTED);
  }
  
  return baseRequests;
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JoinRequestsPanelProps {
  communityId: number;
  statusFilter?: string;
}

export function JoinRequestsPanel({ communityId, statusFilter: initialStatusFilter = "pending" }: JoinRequestsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  
  // Sync with parent component's statusFilter prop when it changes
  useEffect(() => {
    if (initialStatusFilter !== statusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);
  
  // Fetch join requests
  const { 
    data: joinRequests, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["/api/communities", communityId, "join-requests", statusFilter],
    queryFn: async () => {
      // For now, since the API doesn't exist yet, return mock data
      // This will be replaced with actual API call when endpoint is implemented
      return getMockJoinRequests(statusFilter);
    }
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      // Mock implementation until API endpoint is ready
      console.log(`Approving request ${requestId}`);
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["/api/communities", communityId, "join-requests"]
      });
      toast({
        title: "Request approved",
        description: "The member has been added to the community.",
      });
    },
    onError: (err) => {
      console.error("Error approving request:", err);
      toast({
        title: "Error",
        description: "Failed to approve the request. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      // Mock implementation until API endpoint is ready
      console.log(`Rejecting request ${requestId}`);
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["/api/communities", communityId, "join-requests"]
      });
      toast({
        title: "Request rejected",
        description: "The join request has been rejected.",
      });
    },
    onError: (err) => {
      console.error("Error rejecting request:", err);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch();
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle approve action
  const handleApprove = (requestId: number) => {
    approveMutation.mutate(requestId);
  };

  // Handle reject action
  const handleReject = (requestId: number) => {
    rejectMutation.mutate(requestId);
  };

  // Check if there's any pending action
  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Join Requests</CardTitle>
            <CardDescription>
              Manage requests to join your community
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </form>
            
            <Select 
              value={statusFilter} 
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[130px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Requests</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9" 
              onClick={() => refetch()} 
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Error loading join requests. Please try again.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4" 
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : joinRequests && joinRequests.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {joinRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.user?.avatarUrl || undefined} alt={request.user?.username || 'User'} />
                          <AvatarFallback className="text-xs">
                            {request.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium">{request.user?.username || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {request.user?.email || `ID: ${request.userId}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {request.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => handleApprove(request.id)}
                              disabled={isPending}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs border-red-200 hover:bg-red-100 hover:text-red-600"
                                  disabled={isPending}
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this join request? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleReject(request.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        
                        {request.status === "approved" && (
                          <Badge 
                            variant="outline" 
                            className="border-green-200 text-green-700 bg-green-50"
                          >
                            Approved
                          </Badge>
                        )}
                        
                        {request.status === "rejected" && (
                          <Badge 
                            variant="outline" 
                            className="border-red-200 text-red-700 bg-red-50"
                          >
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-3 mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No join requests found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {statusFilter === "pending" 
                ? "There are no pending join requests for your community at the moment."
                : statusFilter === "approved"
                ? "No approved join requests match your search criteria."
                : statusFilter === "rejected"
                ? "No rejected join requests match your search criteria."
                : "No join requests match your search criteria."
              }
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("pending");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
      {joinRequests && joinRequests.length > 0 && (
        <CardFooter className="flex justify-between border-t py-3 px-6">
          <div className="text-sm text-muted-foreground">
            Showing {joinRequests.length} {joinRequests.length === 1 ? "request" : "requests"}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper component to display the status badge
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">{status}</Badge>
      );
  }
}