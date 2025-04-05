import { useState, useEffect } from "react";
import { Connection, User } from "@shared/schema";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  UserCheck, 
  UserX,
  Calendar,
  Clock,
  User2 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getModuleAPI } from "@/modules/moduleRegistration";
import { SocialModuleAPI, UserModuleAPI } from "@/modules/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Extended connection type that includes user data
interface EnhancedConnection extends Connection {
  requesterData?: User;
  recipientData?: User;
}

interface PlayerConnectionsProps {
  connections: Connection[];
  currentUserId: number;
  isPending: boolean;
  onConnectionUpdate: (connection: Connection) => void;
}

export function PlayerConnections({ 
  connections, 
  currentUserId,
  isPending,
  onConnectionUpdate
}: PlayerConnectionsProps) {
  const { toast } = useToast();
  const [loadingConnectionId, setLoadingConnectionId] = useState<number | null>(null);
  const [enhancedConnections, setEnhancedConnections] = useState<EnhancedConnection[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const socialAPI = getModuleAPI<SocialModuleAPI>("social");
  const userAPI = getModuleAPI<UserModuleAPI>("user");

  // Load user data for connections
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUsers(true);
        
        // Create list of unique user IDs we need to fetch
        const userIds = new Set<number>();
        connections.forEach(conn => {
          if (conn.requesterId !== currentUserId) userIds.add(conn.requesterId);
          if (conn.recipientId !== currentUserId) userIds.add(conn.recipientId);
        });
        
        // Fetch user data and create a map
        const userPromises = Array.from(userIds).map(async (id) => {
          try {
            const userData = await fetch(`/api/users/${id}`).then(res => res.json());
            return { id, userData };
          } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            return { id, userData: null };
          }
        });
        
        const userResults = await Promise.all(userPromises);
        const userMap = new Map<number, User>();
        userResults.forEach(result => {
          if (result.userData) {
            userMap.set(result.id, result.userData);
          }
        });
        
        // Enhance connections with user data
        const enhanced = connections.map(conn => ({
          ...conn,
          requesterData: userMap.get(conn.requesterId),
          recipientData: userMap.get(conn.recipientId)
        }));
        
        setEnhancedConnections(enhanced);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Still use the original connections without user data
        setEnhancedConnections(connections as EnhancedConnection[]);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    if (connections.length > 0) {
      fetchUserData();
    } else {
      setEnhancedConnections([]);
      setLoadingUsers(false);
    }
  }, [connections, currentUserId]);

  if (connections.length === 0) {
    return null;
  }
  
  if (loadingUsers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const handleAcceptConnection = async (connectionId: number) => {
    try {
      setLoadingConnectionId(connectionId);
      const updatedConnection = await socialAPI.respondToConnection(connectionId, "accepted");
      onConnectionUpdate(updatedConnection);
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Failed to accept connection",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoadingConnectionId(null);
    }
  };

  const handleDeclineConnection = async (connectionId: number) => {
    try {
      setLoadingConnectionId(connectionId);
      const updatedConnection = await socialAPI.respondToConnection(connectionId, "declined");
      onConnectionUpdate(updatedConnection);
    } catch (error) {
      console.error("Error declining connection:", error);
      toast({
        title: "Failed to decline connection",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoadingConnectionId(null);
    }
  };

  // Get formatted connection date
  const getConnectionDate = (connection: Connection) => {
    const date = connection.createdAt 
      ? new Date(connection.createdAt) 
      : new Date();
      
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get user info from connection
  const getConnectionUser = (connection: EnhancedConnection) => {
    // If current user is the requester, show recipient info
    if (connection.requesterId === currentUserId) {
      return {
        id: connection.recipientId,
        name: connection.recipientData?.displayName || "Player",
        initials: connection.recipientData?.avatarInitials || "P+",
        isRequester: false
      };
    } 
    // Otherwise show requester info
    return {
      id: connection.requesterId,
      name: connection.requesterData?.displayName || "Player",
      initials: connection.requesterData?.avatarInitials || "P+",
      isRequester: true
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => {
        const connectionUser = getConnectionUser(connection);
        const isLoading = loadingConnectionId === connection.id;
        const isPendingRequest = isPending && connectionUser.isRequester;
        
        return (
          <Card key={connection.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback>{connectionUser.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{connectionUser.name}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getConnectionDate(connection)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={connection.type === "coach" ? "default" : "outline"}>
                  {connection.type === "partner" ? "Playing Partner" : 
                   connection.type === "friend" ? "Friend" : 
                   connection.type === "coach" ? "Coach" : 
                   connection.type === "teammate" ? "Teammate" : 
                   "Connection"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {connection.notes && (
                <p className="text-sm text-muted-foreground italic">
                  "{connection.notes}"
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              {isPending ? (
                connectionUser.isRequester ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Waiting for response
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeclineConnection(connection.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Skeleton className="h-4 w-16" /> : "Decline"}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptConnection(connection.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Skeleton className="h-4 w-16" /> : "Accept"}
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex w-full justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserCheck className="h-3 w-3" />
                    Connected
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Record Match
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Remove Connection
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove your connection with this player. You can always reconnect later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeclineConnection(connection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}