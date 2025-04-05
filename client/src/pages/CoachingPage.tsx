import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CoachingConnections } from "@/components/social/CoachingConnections";
import { User, Coach } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { UserCog, UserSearch, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { RequestCoachConnection } from "@/components/social/RequestCoachConnection";

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("connections");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  
  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/current-user"],
  });
  
  // Get available coaches
  const { data: coaches, isLoading: isCoachesLoading } = useQuery<Coach[]>({
    queryKey: ["/api/coaches"],
    // Handle the case if the API isn't implemented yet
    retry: false
  });
  
  // Show coach request form when a coach is selected
  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setActiveTab("request");
  };
  
  // Return to coaches list after request is sent
  const handleRequestSent = () => {
    setSelectedCoach(null);
    setActiveTab("connections");
  };
  
  return (
    <div className="container max-w-5xl py-6">
      <title>Coaching Connections | Pickle+</title>
      
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-2">
          <Link to="/profile">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Coaching Connections</h1>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Coaching in Pickle+</CardTitle>
            <CardDescription>
              Connect with coaches to improve your pickleball skills or become a coach to help others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Coaching connections help you track your pickleball journey and improve your skills. 
              Request a coaching connection from available coaches or apply to become a coach yourself.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="connections" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            My Coaching Connections
          </TabsTrigger>
          <TabsTrigger value="find" className="flex items-center">
            <UserSearch className="mr-2 h-4 w-4" />
            Find a Coach
          </TabsTrigger>
        </TabsList>
        
        {/* My Coaching Connections Tab */}
        <TabsContent value="connections">
          <CoachingConnections />
        </TabsContent>
        
        {/* Find a Coach Tab */}
        <TabsContent value="find">
          {coaches && coaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((coach) => (
                <Card key={coach.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{coach.displayName || coach.username}</CardTitle>
                    <CardDescription>
                      {coach.specialties && coach.specialties.length > 0 
                        ? coach.specialties.join(", ") 
                        : "Pickleball Coach"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">
                      {coach.bio || "No bio available"}
                    </p>
                    <div className="text-sm mb-4">
                      <div className="mb-1"><strong>Skill Level:</strong> {coach.skillLevel || "Not specified"}</div>
                      {coach.isPCPCertified && (
                        <div className="mb-1"><strong>Certification:</strong> PCP Certified</div>
                      )}
                      {coach.yearsCoaching && (
                        <div className="mb-1"><strong>Experience:</strong> {coach.yearsCoaching} years coaching</div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleSelectCoach(coach)}
                      className="w-full"
                    >
                      Request as Coach
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Find a Coach</CardTitle>
                <CardDescription>
                  Connect with a coach to improve your pickleball skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserSearch className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  {isCoachesLoading ? (
                    <p className="text-lg font-medium">Loading available coaches...</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium mb-1">No coaches available yet</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Check back soon as we add more coaches to the platform. In the meantime, you can still track your progress and improve your skills through matches and tournaments.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Request Coach Tab - Only shown when a coach is selected */}
        {selectedCoach && (
          <TabsContent value="request">
            <div className="max-w-2xl mx-auto">
              <Button 
                variant="ghost" 
                className="mb-4"
                onClick={() => {
                  setSelectedCoach(null);
                  setActiveTab("find");
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Coaches List
              </Button>
              
              <RequestCoachConnection 
                coach={selectedCoach} 
                onRequestSent={handleRequestSent}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}