import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, UserCog, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CoachProfileForm } from "@/components/profile/CoachProfileForm";
import { RedeemCodeForm } from "@/components/profile/RedeemCodeForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function CoachProfileEditPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Check if user has coaching access or active profile
  const { data: coachProfile, isLoading } = useQuery({
    queryKey: ['/api/coach/profile'],
    retry: false
  });
  
  // Get current user info to check if they have coach access
  const { data: user } = useQuery({
    queryKey: ['/api/auth/current-user']
  });
  
  const hasCoachAccess = user?.isCoach || user?.hasCoachAccess;
  
  // Handler for when the user successfully redeems a code
  const handleCodeRedeemed = () => {
    // Refresh the current user data
    setActiveTab("profile");
  };
  
  // Handler for when the profile is saved
  const handleProfileSaved = () => {
    // Redirect to the profile view page
    setLocation("/coach/profile");
  };
  
  return (
    <div className="container max-w-4xl py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Coach Profile</h1>
        <p className="text-muted-foreground">
          Create or edit your coaching profile to connect with students
        </p>
      </div>
      
      {!hasCoachAccess ? (
        // No coach access - show access card
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Coaching Access Required
            </CardTitle>
            <CardDescription>
              You need to unlock coaching features to create a profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              To create a coaching profile and access coaching features, you need to either:
            </p>
            
            <Tabs defaultValue="code" className="mb-4">
              <TabsList className="mb-4">
                <TabsTrigger value="code">Redemption Code</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Enter a Coach Access Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have a coach access code, enter it below to unlock coaching features.
                  </p>
                  <RedeemCodeForm 
                    codeType="coach" 
                    onSuccess={handleCodeRedeemed} 
                    buttonText="Unlock Coaching Features"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="subscription">
                <div className="text-center py-6">
                  <UserCog className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="text-lg font-medium mb-2">Subscribe to Coaching Plan</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Get unlimited access to coaching features with a monthly or annual subscription.
                  </p>
                  <Button className="mx-auto">View Subscription Plans</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        // Has coach access - show profile form
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile" className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                Profile Details
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Access & Subscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <CoachProfileForm 
                initialData={coachProfile} 
                onSuccess={handleProfileSaved} 
              />
            </TabsContent>
            
            <TabsContent value="access">
              <Card>
                <CardHeader>
                  <CardTitle>Coaching Access</CardTitle>
                  <CardDescription>
                    Manage your coaching subscription and access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.isCoach ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
                      <h3 className="font-medium flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Active Coaching Subscription
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your coaching subscription is active until {new Date(user.coachExpiresAt || Date.now() + 31536000000).toLocaleDateString()}
                      </p>
                      <Button className="mt-4" variant="outline">Manage Subscription</Button>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
                      <h3 className="font-medium flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                        Coach Access via Redemption Code
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You currently have access to coaching features through a redemption code.
                      </p>
                      <Button className="mt-4" variant="outline">Upgrade to Subscription</Button>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Additional Access Codes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have another coaching access code? Enter it below to extend your access.
                    </p>
                    <RedeemCodeForm codeType="coach" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}