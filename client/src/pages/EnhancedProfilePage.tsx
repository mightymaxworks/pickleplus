import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCog, ArrowLeft } from "lucide-react";
import { EnhancedProfileTabs } from "@/components/profile/EnhancedProfileTabs";
import { ProfilePrivacySelector } from "@/components/profile/ProfilePrivacySelector";
import { FieldVisibilitySettings } from "@/components/profile/FieldVisibilitySettings";
import { EnhancedUser } from "@/types/enhanced-user";
import { Features, useFeatureFlag } from "@/lib/featureFlags";

export default function EnhancedProfilePage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();
  
  // Check feature flags
  const showEnhancedProfile = useFeatureFlag(Features.ENHANCED_PROFILE);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
    
    // Comment out feature flag check to enable access for debugging
    // if (!showEnhancedProfile) {
    //   setLocation("/profile");
    // }
  }, [isAuthenticated, user, setLocation]);
  
  // Create a safe enhanced user object from the current user
  const enhancedUser: EnhancedUser = {
    // Map base properties
    id: user?.id || 0,
    username: user?.username || '',
    email: user?.email || null,
    password: user?.password || '',
    displayName: user?.displayName || null,
    location: user?.location || null,
    bio: user?.bio || null,
    yearOfBirth: user?.yearOfBirth || null,
    passportId: user?.passportId || null,
    avatarInitials: user?.avatarInitials || '',
    level: user?.level || 1,
    xp: user?.xp || 0,
    totalMatches: user?.totalMatches || 0,
    matchesWon: user?.matchesWon || 0,
    totalTournaments: user?.totalTournaments || 0,
    achievements: [],
    profileCompletionPct: user?.profileCompletionPct || 0,
    rankingPoints: user?.rankingPoints || 0,
    isAdmin: user?.isAdmin || false,
    createdAt: user?.createdAt || undefined,
    
    // Enhanced profile properties
    lastUpdated: user?.lastUpdated || undefined,
    
    // Equipment preferences (reuse existing user data if available)
    paddleBrand: user?.paddleBrand || undefined,
    paddleModel: user?.paddleModel || undefined,
    
    // Default values for enhanced fields
    height: undefined,
    reach: undefined,
    backupPaddleBrand: undefined,
    backupPaddleModel: undefined,
    otherEquipment: undefined,
    preferredPosition: undefined,
    forehandStrength: undefined,
    backhandStrength: undefined,
    servePower: undefined,
    dinkAccuracy: undefined,
    thirdShotConsistency: undefined,
    courtCoverage: undefined,
    preferredSurface: undefined,
    indoorOutdoorPreference: undefined,
    competitiveIntensity: undefined,
    mentorshipInterest: undefined,
    homeCourtLocations: undefined,
    travelRadiusKm: undefined,
    playerGoals: undefined,
    lookingForPartners: undefined,
    privacyProfile: undefined
  };
  
  // Loading state
  if (!user) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold">Your Enhanced Profile</h1>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold">Your Enhanced Profile</h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs" 
          onClick={() => setLocation('/profile/edit')}
        >
          <UserCog className="h-3.5 w-3.5 mr-1" />
          Edit Profile
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Primary profile content */}
        <EnhancedProfileTabs user={enhancedUser} />
      </div>
    </div>
  );
}