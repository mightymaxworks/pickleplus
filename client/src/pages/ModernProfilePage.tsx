/**
 * PKL-278651-PROF-0007-COMP - Modern Profile Page
 * 
 * A modern implementation of the profile page with improved performance,
 * inline editing capabilities, and enhanced visual design.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useDerivedData } from "@/contexts/DerivedDataContext";
import { useLocation, useParams } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAvatarInitials } from "@/lib/stringUtils";
import { calculateLevel } from "@/lib/calculateLevel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { EnhancedUser } from "@/types/enhanced-user";

// Icons
import {
  User,
  Settings,
  BarChart2,
  Clock,
  Camera,
  Plus,
  MessageSquare,
  FileText,
  ChevronRight,
  CalendarDays,
  Users
} from "lucide-react";

// Profile Components
import ProfileDetailsTab from "@/components/profile/modern/ProfileDetailsTab";
import ProfileStatsTab from "@/components/profile/modern/ProfileStatsTab";
import ProfileHistoryTab from "@/components/profile/modern/ProfileHistoryTab";
import ProfileSettingsTab from "@/components/profile/modern/ProfileSettingsTab";
import PlayerComparisonTool from "@/components/profile/modern/PlayerComparisonTool";
import EditableProfileField from "@/components/profile/modern/EditableProfileField";
import CoverImageUploader from "@/components/profile/modern/CoverImageUploader";
import AvatarUploader from "@/components/profile/modern/AvatarUploader";

// Default placeholder background for users without a cover image
const DEFAULT_COVER_BG = "bg-gradient-to-r from-primary/20 via-primary/10 to-background";

export default function ModernProfilePage() {
  // Get user id from URL params or use current user
  const params = useParams();
  const userId = params.userId ? parseInt(params.userId) : undefined;
  
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
  
  // The view is either the current user's profile or another user's profile
  const isCurrentUserProfile = !userId || userId === currentUser?.id;
  
  // Query for user data
  const { 
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: userId ? [`/api/users/${userId}`] : ['/api/me'],
    queryFn: () => 
      apiRequest("GET", userId ? `/api/users/${userId}` : "/api/me")
        .then(res => res.json()),
    enabled: !!currentUser,
  });
  
  // Courts IQ Rating calculation (client-side calculation)
  const courtIQRating = user ? calculationService.calculateOverallRating(user) : 0;
  
  // Mutation for updating profile fields
  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: { field: string, value: any }) => {
      const { field, value } = updateData;
      const response = await apiRequest(
        "PATCH",
        "/api/profile/update",
        { [field]: value }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user data query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Field update handler
  const handleFieldUpdate = (field: string, value: any) => {
    if (!isCurrentUserProfile) return;
    updateProfileMutation.mutate({ field, value });
  };
  
  // Handle cover image upload events
  const handleCoverUploadStart = () => {
    setIsCoverImageLoading(true);
  };
  
  const handleCoverUploadComplete = () => {
    setIsCoverImageLoading(false);
    queryClient.invalidateQueries({ queryKey: ['/api/me'] });
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
  
  // Handle avatar upload events
  const handleAvatarUploadStart = () => {
    setIsAvatarLoading(true);
  };
  
  const handleAvatarUploadComplete = () => {
    setIsAvatarLoading(false);
    queryClient.invalidateQueries({ queryKey: ['/api/me'] });
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
  
  // Calculated values from user data
  const matchWinPercentage = user.totalMatches > 0 
    ? Math.round((user.matchesWon / user.totalMatches) * 100) 
    : 0;
  
  const matchLossCount = user.totalMatches - user.matchesWon;
  
  return (
    <div className="pb-8">
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
          
          {/* Cover image upload button (only for current user) */}
          {isCurrentUserProfile && (
            <div className="absolute bottom-4 right-4">
              <CoverImageUploader
                userId={user.id}
                onUploadStart={handleCoverUploadStart}
                onUploadComplete={handleCoverUploadComplete}
                onUploadError={handleCoverUploadError}
              >
                <Button 
                  variant="outline" 
                  className="bg-background/80 backdrop-blur-sm"
                  disabled={isCoverImageLoading}
                >
                  {isCoverImageLoading ? (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      {user.coverImageUrl ? "Change Cover" : "Add Cover"}
                    </>
                  )}
                </Button>
              </CoverImageUploader>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {isCurrentUserProfile ? (
                <AvatarUploader
                  userId={user.id}
                  onUploadStart={handleAvatarUploadStart}
                  onUploadComplete={handleAvatarUploadComplete}
                  onUploadError={handleAvatarUploadError}
                >
                  <Avatar className="h-32 w-32 border-4 border-background cursor-pointer">
                    {isAvatarLoading ? (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
                        <AvatarFallback className="bg-primary text-3xl">{user.avatarInitials}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </AvatarUploader>
              ) : (
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
                  <AvatarFallback className="bg-primary text-3xl">{user.avatarInitials}</AvatarFallback>
                </Avatar>
              )}
              
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
                    editable={isCurrentUserProfile}
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
                        <span>{value || (isCurrentUserProfile ? "Add display name" : user.username)}</span>
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
                
                {/* Coach Badge */}
                {user.isCoach && (
                  <Badge variant="secondary" className="bg-amber-200 text-amber-900 hover:bg-amber-300">
                    Coach
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
                    <span>{user.location}</span>
                  </>
                )}
              </div>
              
              {/* Bio */}
              <div className="max-w-xl">
                <EditableProfileField
                  value={user.bio || ""}
                  field="bio"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUserProfile}
                  placeholder="Add a bio to tell people about yourself"
                  render={(value, editing, onChange) => (
                    editing ? (
                      <textarea
                        className="w-full min-h-[100px] px-2 py-1 bg-muted rounded border border-input"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Add a bio to tell people about yourself"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {value || (isCurrentUserProfile ? "Add a bio to tell people about yourself" : "")}
                      </p>
                    )
                  )}
                />
              </div>
            </div>
            
            {/* Action Buttons - only shown when viewing someone else's profile */}
            {!isCurrentUserProfile && (
              <div className="flex flex-row md:flex-col gap-2 mt-4 justify-start">
                <Button variant="default" size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Connect
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" /> Message
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* CourtIQ Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">CourtIQ™ Rating</h3>
              <p className="text-2xl font-bold">{courtIQRating.toFixed(1)}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Career Matches</h3>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{user.totalMatches}</p>
                <span className="text-xs bg-primary-foreground px-2 py-1 rounded">
                  {user.matchesWon} W - {matchLossCount} L
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Player Since</h3>
              <p className="text-2xl font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short'
                }) : 'N/A'}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </Card>
        </div>
        
        {/* Tab Navigation */}
        <div className="mt-8">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="details" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              {isCurrentUserProfile && (
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            {/* Tab Content */}
            <TabsContent value="details">
              <ProfileDetailsTab 
                user={user} 
                isCurrentUser={isCurrentUserProfile} 
                onFieldUpdate={handleFieldUpdate} 
              />
            </TabsContent>
            
            <TabsContent value="stats">
              <ProfileStatsTab user={user} />
            </TabsContent>
            
            <TabsContent value="history">
              <ProfileHistoryTab user={user} />
            </TabsContent>
            
            <TabsContent value="compare">
              <PlayerComparisonTool currentUser={user} />
            </TabsContent>
            
            {isCurrentUserProfile && (
              <TabsContent value="settings">
                <ProfileSettingsTab 
                  user={user} 
                  onFieldUpdate={handleFieldUpdate} 
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}