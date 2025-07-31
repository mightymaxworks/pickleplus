import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RedeemCodeForm } from "@/components/profile/RedeemCodeForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChevronLeft, ArrowRight, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function CoachProfileEditPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch current user info
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/current-user"],
    retry: false
  });
  
  // Check if user has coach access or is a coach
  const hasCoachAccess = currentUser?.hasCoachAccess;
  const isCoach = currentUser?.isCoach;
  
  // Fetch coach profile data if user is a coach
  const { data: coachProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["/api/coach/profile"],
    retry: 0,
    enabled: !!isCoach
  });
  
  // Handle a successful code redemption
  const handleCodeRedeemed = () => {
    toast({
      title: "Code redeemed successfully!",
      description: "You now have access to coaching features.",
      variant: "default",
    });
    
    // Refresh the current user data and coach profile
    queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
    refetchProfile();
  };
  
  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Coach Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your coaching profile and subscription
          </p>
        </div>
        {isCoach && (
          <Button asChild className="flex items-center gap-2">
            <Link to="/coach/profile">
              View Public Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <Card>
            <CardHeader>
              <CardTitle>Coaching Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type:</span>
                  <span className="text-sm">{isCoach ? "Coach" : "Player"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center">
                    {isCoach ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm text-amber-600">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                
                {isCoach && coachProfile?.subscriptionEndsAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan expires:</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">{formatDate(coachProfile?.subscriptionEndsAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Redemption code form if user doesn't have coach access */}
          {!hasCoachAccess && (
            <RedeemCodeForm 
              title="Get Coach Access"
              description="Enter your coach invitation code to unlock coaching features."
              endpoint="/api/coach/redeem-code"
              buttonText="Activate Coach Access"
              onSuccess={handleCodeRedeemed}
            />
          )}
          
          {/* Subscription management if user is already a coach */}
          {isCoach && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your coaching plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm mb-1">Current plan:</p>
                  <p className="font-medium">Pickleball Coach</p>
                  {coachProfile?.subscriptionEndsAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires on {formatDate(coachProfile.subscriptionEndsAt)}
                    </p>
                  )}
                </div>
                <Button className="w-full">Manage Subscription</Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coach Profile</CardTitle>
              <CardDescription>
                {isCoach 
                  ? "Manage your public coaching profile"
                  : "Complete your profile after activating coach access"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasCoachAccess ? (
                <div className="py-8 text-center">
                  <h3 className="font-medium text-lg mb-2">Activate coach access first</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to either subscribe to the coaching plan or redeem a coach invitation code.
                  </p>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General Info</TabsTrigger>
                    <TabsTrigger value="services">Services & Pricing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="py-4">
                    <p className="text-muted-foreground mb-6">
                      Your coaching profile is {isCoach ? "active and" : "not set up yet. Once activated, it will be"} visible to players.
                    </p>
                    
                    <Button variant="default" className="w-full">
                      {isCoach ? "Edit Profile" : "Complete Profile Setup"}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="services" className="py-4">
                    <p className="text-muted-foreground mb-6">
                      Define the coaching services you offer, including session types, formats, and pricing.
                    </p>
                    
                    <Button variant="default" className="w-full">
                      {isCoach ? "Edit Services" : "Set Up Services"}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}