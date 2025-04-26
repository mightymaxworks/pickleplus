/**
 * PKL-278651-PROF-0004-PAGE - Optimized Profile Page
 * 
 * This page implements the optimized profile with tab-based data loading,
 * virtualized rendering, and frontend-first calculations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EnhancedUser } from "@/types/enhanced-user";
import { OptimizedProfileTabs, ProfileTabId } from "@/components/profile/OptimizedProfileTabs";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import XPProgressCard from "@/components/dashboard/XPProgressCard";
import { DerivedDataProvider } from "@/contexts/DerivedDataContext";

export default function OptimizedProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("details");
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Flag for enabling optimized profile features
  const OPTIMIZED_PROFILE_ENABLED = FEATURE_FLAGS.FRONTEND_FIRST === "enableLocalStorageFirst";
  
  // Get user data
  const { 
    data: profileUser, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/users', id],
    // Use long stale time for profile data since it doesn't change frequently
    staleTime: 300000, // 5 minutes 
  });
  
  // Determine if this is the current user's profile
  const isCurrentUser = useMemo(() => {
    if (!currentUser || !profileUser) return false;
    return currentUser.id === profileUser.id;
  }, [currentUser, profileUser]);
  
  // Handle tab change
  const handleTabChange = (tab: ProfileTabId) => {
    setActiveTab(tab);
    // Update URL with tab parameter
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };
  
  // Get tab from URL on initial load
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get("tab") as ProfileTabId | null;
    if (tabParam && ["details", "statistics", "equipment", "achievements", "history", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }
  
  // Show error state
  if (error || !profileUser) {
    return (
      <div className="container py-8">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <p className="text-muted-foreground mb-6">
            The user profile you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="/discover">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </a>
          </Button>
        </div>
      </div>
    );
  }
  
  // Add avatar initials fallback if not present
  if (!profileUser.avatarInitials && profileUser.displayName) {
    profileUser.avatarInitials = profileUser.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
  
  // Create allowed tabs based on permissions
  const allowedTabs: ProfileTabId[] = [
    "details", 
    "statistics", 
    "equipment", 
    "achievements", 
    "history"
  ];
  
  // Only show settings tab for current user
  if (isCurrentUser) {
    allowedTabs.push("settings");
  }
  
  // EMERGENCY FIX: Bypassing DerivedDataProvider temporarily due to infinite render loop
  // Will restore once the loop issue is resolved
  console.log("EMERGENCY: Bypassing DerivedDataProvider to prevent infinite loops");
  return (
    <div className="container py-8">
        <div className="flex flex-col space-y-6">
          {/* Profile Header */}
          <div className="pb-6 border-b flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileUser.avatarUrl || undefined} alt={profileUser.displayName || profileUser.username} />
                <AvatarFallback className="text-xl">
                  {profileUser.avatarInitials || profileUser.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <div className="text-muted-foreground">
                  {profileUser.location && (
                    <span className="text-sm">{profileUser.location}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                    Level {profileUser.level}
                  </div>
                  {profileUser.isVerified && (
                    <div className="text-xs bg-emerald-100 text-emerald-700 py-1 px-2 rounded-full">
                      Verified
                    </div>
                  )}
                  {profileUser.preferredPosition && (
                    <div className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded-full">
                      {profileUser.preferredPosition}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* XP Progress Card - Desktop Only */}
            {!isMobile && (
              <div className="md:w-1/3">
                <XPProgressCard />
              </div>
            )}
          </div>
          
          {/* XP Progress Card - Mobile Only */}
          {isMobile && (
            <XPProgressCard />
          )}
          
          {/* Profile Tabs */}
          <OptimizedProfileTabs 
            user={profileUser as EnhancedUser} 
            initialTab={activeTab}
            allowedTabs={allowedTabs}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
  );
}