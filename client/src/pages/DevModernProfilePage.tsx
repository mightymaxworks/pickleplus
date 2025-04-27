/**
 * PKL-278651-PROF-0008-DEV - Development Modern Profile Page
 * 
 * A development version of the modern profile page that uses
 * development endpoints to bypass authentication issues.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDerivedData } from "@/contexts/DerivedDataContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useDevProfile } from "@/hooks/useDevProfile";

// Icons
import {
  User,
  Settings,
  BarChart2,
  Clock,
  Camera,
  ChevronRight,
} from "lucide-react";

// Profile Components
import ProfileDetailsTab from "@/components/profile/modern/ProfileDetailsTab";
import ProfileStatsTab from "@/components/profile/modern/ProfileStatsTab";
import ProfileHistoryTab from "@/components/profile/modern/ProfileHistoryTab";
import ProfileSettingsTab from "@/components/profile/modern/ProfileSettingsTab";
import EditableProfileField from "@/components/profile/modern/EditableProfileField";

// Default placeholder background for users without a cover image
const DEFAULT_COVER_BG = "bg-gradient-to-r from-primary/20 via-primary/10 to-background";

export default function DevModernProfilePage() {
  // Auth context for current user
  const { user: currentUser } = useAuth();
  
  // Get derived data context and calculation service
  const { calculationService } = useDerivedData();
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Local state
  const [activeTab, setActiveTab] = useState("details");
  const [isCoverImageLoading, setIsCoverImageLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  
  // Use our development profile hook
  const {
    profile: user,
    isLoadingProfile: isLoading,
    profileError: error,
    updateProfile
  } = useDevProfile();
  
  // Always treat as current user's profile in dev mode
  const isCurrentUserProfile = true;
  
  // Courts IQ Rating calculation (client-side calculation)
  const courtIQRating = user ? calculationService.calculateOverallRating(user) : 0;
  
  // Field update handler
  const handleFieldUpdate = (field: string, value: any) => {
    if (!isCurrentUserProfile) return;
    // Call our development update endpoint
    updateProfile({ [field]: value });
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  // Handle cover image upload events - simplified for development
  const handleCoverUploadStart = () => {
    setIsCoverImageLoading(true);
  };
  
  const handleCoverUploadComplete = () => {
    setIsCoverImageLoading(false);
    toast({
      title: "Cover image updated",
      description: "Your cover image has been successfully updated.",
    });
  };
  
  const handleCoverUploadError = (error: any) => {
    setIsCoverImageLoading(false);
    toast({
      title: "Upload failed",
      description: error || "Failed to upload cover image. Please try again.",
      variant: "destructive",
    });
  };
  
  // Handle avatar upload events - simplified for development
  const handleAvatarUploadStart = () => {
    setIsAvatarLoading(true);
  };
  
  const handleAvatarUploadComplete = () => {
    setIsAvatarLoading(false);
    toast({
      title: "Avatar updated",
      description: "Your avatar has been successfully updated.",
    });
  };
  
  const handleAvatarUploadError = (error: any) => {
    setIsAvatarLoading(false);
    toast({
      title: "Upload failed",
      description: error || "Failed to upload avatar. Please try again.",
      variant: "destructive",
    });
  };
  
  // Parallax scrolling effect for cover image
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 200], [0, 50]);
  
  // If loading or error, show appropriate state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Skeleton className="h-12 w-48 mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <div className="w-full md:w-64">
              <Skeleton className="h-52 w-full rounded-lg mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-destructive/10 rounded-lg p-8 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-destructive mb-4">Failed to load profile</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading the profile information. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-muted rounded-lg p-8 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">No profile data</h1>
          <p className="text-muted-foreground mb-6">
            No development profile data available.
          </p>
        </div>
      </div>
    );
  }
  
  // Calculated values from user data
  const matchWinPercentage = user.totalMatches > 0 
    ? Math.round((user.matchesWon / user.totalMatches) * 100) 
    : 0;
  
  const matchLossCount = user.totalMatches - user.matchesWon;
  
  return (
    <div className="pb-8">
      {/* DEV MODE Banner */}
      <div className="bg-yellow-400 text-yellow-900 p-2 text-center font-bold">
        DEVELOPMENT MODE - Using test profile data
      </div>
      
      {/* Cover Image with Parallax Effect */}
      <div className="relative h-64 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: user.coverImageUrl ? `url(${user.coverImageUrl})` : undefined,
            y: coverY 
          }}
        >
          {/* If no cover image, show a gradient background */}
          {!user.coverImageUrl && <div className={`absolute inset-0 ${DEFAULT_COVER_BG}`} />}
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Cover image upload button (disabled in dev mode) */}
          <div className="absolute bottom-4 right-4">
            <Button 
              variant="outline" 
              className="bg-background/80 backdrop-blur-sm"
              disabled={true}
            >
              <Camera className="mr-2 h-4 w-4" />
              {user.coverImageUrl ? "Change Cover" : "Add Cover"}
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
                <AvatarFallback className="bg-primary text-3xl">{user.avatarInitials}</AvatarFallback>
              </Avatar>
              
              {/* Level Badge */}
              <div className="absolute -right-2 -bottom-2 bg-primary text-primary-foreground text-sm font-bold h-8 w-8 rounded-full flex items-center justify-center border-2 border-background">
                {user.level}
              </div>
            </div>
          </div>
          
          {/* Name and Basic Info */}
          <div className="flex flex-col md:flex-row flex-1 justify-between">
            <div className="space-y-1 mt-4 md:mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">
                  <EditableProfileField
                    value={user.displayName || user.username}
                    field="displayName"
                    onUpdate={handleFieldUpdate}
                    editable={true}
                    placeholder="Add display name"
                    render={(value, editing, onChange) => (
                      editing ? (
                        <input
                          className="text-3xl font-bold bg-muted p-1 rounded border border-input"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder="Add display name"
                          autoFocus
                        />
                      ) : (
                        <span>{value || "Add display name"}</span>
                      )
                    )}
                  />
                </h1>
                
                {/* Verification Badge */}
                {user.isVerified && (
                  <Badge variant="secondary" className="ml-1">
                    Verified
                  </Badge>
                )}
                
                {/* Admin Badge */}
                {user.isAdmin && (
                  <Badge variant="secondary" className="bg-red-200 text-red-900 hover:bg-red-300">
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="text-muted-foreground flex flex-wrap items-center gap-2">
                <span>@{user.username}</span>
                {user.location && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <EditableProfileField
                      value={user.location}
                      field="location"
                      onUpdate={handleFieldUpdate}
                      editable={true}
                      placeholder="Add location"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <input
                            className="bg-muted p-1 rounded border border-input"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Add location"
                            autoFocus
                          />
                        ) : (
                          <span>{value}</span>
                        )
                      )}
                    />
                  </>
                )}
              </div>
              
              {/* Bio */}
              <div className="max-w-xl">
                <EditableProfileField
                  value={user.bio || ""}
                  field="bio"
                  onUpdate={handleFieldUpdate}
                  editable={true}
                  placeholder="Add a bio to tell people about yourself"
                  render={(value, editing, onChange) => (
                    editing ? (
                      <textarea
                        className="w-full min-h-[100px] p-2 bg-muted rounded border border-input"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Add a bio to tell people about yourself"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {value || (
                          <span className="italic cursor-pointer">
                            Add a bio to tell people about yourself
                          </span>
                        )}
                      </p>
                    )
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
            <TabsTrigger value="details" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <ProfileDetailsTab user={user} onUpdateField={handleFieldUpdate} />
              </div>
              <div className="space-y-6">
                {/* Stats Overview Card */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{user.totalMatches}</div>
                        <div className="text-xs text-muted-foreground">Total Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{user.tournamentsPlayed}</div>
                        <div className="text-xs text-muted-foreground">Tournaments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{matchWinPercentage}%</div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{courtIQRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Court IQ</div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Recent Matches */}
                <Card>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Recent Matches</h3>
                      <Button variant="link" size="sm" className="text-xs">
                        View All <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    
                    {user.totalMatches > 0 ? (
                      <div className="space-y-3">
                        {/* Sample matches for development */}
                        <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium">vs. John D.</div>
                            <div className="text-xs text-muted-foreground">2 days ago</div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            11-9, 11-7
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium">vs. Sarah M.</div>
                            <div className="text-xs text-muted-foreground">5 days ago</div>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            8-11, 10-12
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No matches recorded yet
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats">
            <ProfileStatsTab user={user} courtIQRating={courtIQRating} />
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <ProfileHistoryTab user={user} />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <ProfileSettingsTab user={user} onUpdateField={handleFieldUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}