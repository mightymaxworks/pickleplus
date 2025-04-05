import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserCheck, XCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { getProfileColorsByLevel, getXPTierInfo } from "@/hooks/useXPTier";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function CoachingConnections() {
  const { toast } = useToast();
  
  // Get coaching connections
  const { 
    data: coachingConnections, 
    isLoading: isCoachingLoading,
    error: coachingError
  } = useQuery({
    queryKey: ['/api/connections/coaching'],
    retry: false
  });
  
  // Get pending requests
  const { 
    data: pendingRequests, 
    isLoading: isPendingLoading,
    error: pendingError
  } = useQuery({
    queryKey: ['/api/connections/received'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/connections/received?type=coach&status=pending');
      return await res.json();
    },
    retry: false
  });
  
  // Handle updating connection status
  const handleUpdateStatus = async (connectionId: number, status: 'accepted' | 'declined' | 'ended') => {
    try {
      await apiRequest('PATCH', `/api/connections/${connectionId}/status`, { status });
      
      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/connections/coaching'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/connections/received'] });
      
      const action = status === 'accepted' ? 'accepted' : status === 'declined' ? 'declined' : 'ended';
      
      toast({
        title: `Connection ${action}`,
        description: `The coaching connection was successfully ${action}.`,
        variant: status === 'accepted' ? 'default' : status === 'declined' ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Error updating connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the connection. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // If there are errors, show error message
  if (coachingError || pendingError) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Coaching Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading coaching connections. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Pending coaching requests */}
      {!isPendingLoading && pendingRequests && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Pending Coaching Requests
            </CardTitle>
            <CardDescription>People who want you as their coach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((connection: any) => {
                // Get tier info for user color styling
                const tier = getXPTierInfo(connection.requesterLevel || 1);
                const colors = getProfileColorsByLevel(connection.requesterLevel || 1);
                
                return (
                  <div key={connection.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`border-2 ${colors.border}`}>
                        <AvatarImage src={connection.requesterProfilePicture} />
                        <AvatarFallback className={colors.bg}>
                          {connection.requesterUsername?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{connection.requesterDisplayName || connection.requesterUsername}</div>
                        <div className="text-sm text-muted-foreground">{connection.notes || "No message"}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center"
                        onClick={() => handleUpdateStatus(connection.id, 'accepted')}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center text-red-500"
                        onClick={() => handleUpdateStatus(connection.id, 'declined')}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Active coaching connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Coaching Connections
          </CardTitle>
          <CardDescription>
            {isPendingLoading 
              ? "Loading coaching connections..." 
              : `You have ${coachingConnections?.length || 0} active coaching connections`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCoachingLoading ? (
            // Loading skeletons
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center border rounded-lg p-3">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : coachingConnections?.length > 0 ? (
            <div className="space-y-3">
              {coachingConnections.map((item: any) => {
                const { user, connection } = item;
                
                // Get tier info for user color styling
                const tier = getXPTierInfo(user.level || 1);
                const colors = getProfileColorsByLevel(user.level || 1);
                
                // Determine relationship type (coach or student)
                const isMyCoach = connection.recipientId === user.id;
                const relationshipLabel = isMyCoach ? "Your coach" : "Your student";
                
                return (
                  <div key={connection.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`border-2 ${colors.border}`}>
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className={colors.bg}>
                          {user.username?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center">
                          {user.displayName || user.username}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {relationshipLabel}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {connection.startDate 
                            ? `Connected since ${new Date(connection.startDate).toLocaleDateString()}`
                            : "Recently connected"}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        asChild
                        size="sm" 
                        variant="ghost" 
                        className="flex items-center"
                      >
                        <Link to={`/profile/${user.id}`}>
                          <span>View Profile</span>
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center"
                        disabled // Message feature not yet implemented
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">No coaching connections yet</p>
              <p className="text-sm max-w-md mx-auto">
                Connect with coaches to improve your game or become a coach to help others level up their pickleball skills.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}