import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Connection, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { PlayerConnections } from "@/components/social/PlayerConnections";
import { ConnectionRequestForm } from "@/components/social/ConnectionRequestForm";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getModuleAPI } from "@/modules/moduleRegistration";
import { SocialModuleAPI } from "@/modules/types";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  // Get the social module API
  const socialAPI = getModuleAPI<SocialModuleAPI>("social");

  // Fetch connections on component mount
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const connectionData = await socialAPI.getConnections(user.id);
        setConnections(connectionData);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast({
          title: "Failed to load connections",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user, socialAPI, toast]);

  // Group connections by status
  const pendingConnections = connections.filter(
    (conn) => conn.status === "pending"
  );
  const activeConnections = connections.filter(
    (conn) => conn.status === "accepted"
  );

  // Handle new connection request
  const handleNewConnection = (newConnection: Connection) => {
    setConnections((prev) => [...prev, newConnection]);
    setOpenDialog(false);
    toast({
      title: "Connection request sent",
      description: "The player will be notified of your request",
    });
  };

  // Handle connection status change
  const handleConnectionUpdate = (updatedConnection: Connection) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === updatedConnection.id ? updatedConnection : conn
      )
    );
    
    toast({
      title: `Connection ${updatedConnection.status}`,
      description: updatedConnection.status === "accepted" 
        ? "You are now connected with this player" 
        : "Connection request has been declined",
    });
  };

  return (
    <MainLayout>
      <div className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Player Connections</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect with a Player</DialogTitle>
              </DialogHeader>
              <ConnectionRequestForm 
                currentUserId={user?.id || 0} 
                onConnectionRequested={handleNewConnection} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-muted-foreground mb-6">
          Connect with other pickleball players to arrange matches, find partners, and build your network.
        </p>

        {loading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">
                Active Connections ({activeConnections.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Requests ({pendingConnections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeConnections.length > 0 ? (
                <PlayerConnections 
                  connections={activeConnections} 
                  currentUserId={user?.id || 0}
                  isPending={false}
                  onConnectionUpdate={handleConnectionUpdate}
                />
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <h3 className="text-lg font-medium mb-2">No active connections yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other players to build your pickleball network
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenDialog(true)}
                    className="gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Find Players
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingConnections.length > 0 ? (
                <PlayerConnections 
                  connections={pendingConnections} 
                  currentUserId={user?.id || 0}
                  isPending={true}
                  onConnectionUpdate={handleConnectionUpdate}
                />
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <h3 className="text-lg font-medium">No pending connection requests</h3>
                  <p className="text-muted-foreground">
                    When you send or receive connection requests, they will appear here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}