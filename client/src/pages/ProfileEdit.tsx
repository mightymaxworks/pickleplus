import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="profile-edit pb-20 md:pb-6">
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/profile")}
          className="flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Back to Profile
        </Button>
      </div>
      
      <Card className="mb-6 pickle-shadow">
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>
            Complete your profile to enhance your Pickle+ experience and earn XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}