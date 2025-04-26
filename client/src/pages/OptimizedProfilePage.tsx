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
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Home, User, Settings, Award, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EnhancedUser } from "@/types/enhanced-user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

// EMERGENCY FALLBACK IMPLEMENTATION
// Due to rendering issues with the original ProfilePage components,
// this is a simplified version that doesn't use the problematic components
// Define simple tab IDs to avoid reference to OptimizedProfileTabs
type SimpleTabId = "details" | "stats" | "history" | "settings";

export default function OptimizedProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SimpleTabId>("details");
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Get user data - set defaults to prevent errors with undefined data
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery<EnhancedUser>({
    queryKey: ['/api/users', id],
    // Use long stale time for profile data since it doesn't change frequently
    staleTime: 300000, // 5 minutes
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }
  
  // Show error state
  if (error || !user) {
    return (
      <div className="container py-8">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">User Profile Unavailable</h2>
          <p className="text-muted-foreground mb-6">
            We're experiencing technical difficulties. Please try again later.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Simple function to return initials
  const getInitials = (name: string) => {
    return name.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Determine if this is the current user's profile
  const isCurrentUser = currentUser?.id === user.id;
  
  console.log("EMERGENCY: Using simplified profile page without problematic components");
  
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="pb-6 border-b flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
              <AvatarFallback className="text-xl">
                {user.avatarInitials || getInitials(user.displayName || user.username)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {user.displayName || user.username}
              </h1>
              <div className="text-muted-foreground">
                {user.location && (
                  <span className="text-sm">{user.location}</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <div className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                  Level {user.level}
                </div>
                {user.isVerified && (
                  <div className="text-xs bg-emerald-100 text-emerald-700 py-1 px-2 rounded-full">
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Card - Desktop Only */}
          {!isMobile && (
            <div className="md:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Level {user.level}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.xp || 0} XP
                      </p>
                    </div>
                  </div>
                  
                  {/* Win rate info */}
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{user.totalMatches || 0}</div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{user.matchesWon || 0}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {user.totalMatches && user.matchesWon ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Simple Tabs Implementation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SimpleTabId)}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">
              <User className="h-4 w-4 mr-2" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Award className="h-4 w-4 mr-2" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
            </TabsTrigger>
            {isCurrentUser && (
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Username</div>
                    <div className="col-span-2">{user.username}</div>
                  </div>
                  {user.email && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Email</div>
                      <div className="col-span-2">{user.email}</div>
                    </div>
                  )}
                  {user.location && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Location</div>
                      <div className="col-span-2">{user.location}</div>
                    </div>
                  )}
                  {user.bio && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Bio</div>
                      <div className="col-span-2">{user.bio}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {user.preferredPosition && (
              <Card>
                <CardHeader>
                  <CardTitle>Playing Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Position</div>
                      <div className="col-span-2">{user.preferredPosition}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded p-4 text-center">
                    <div className="text-2xl font-bold">{user.totalMatches || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Matches</div>
                  </div>
                  <div className="bg-muted rounded p-4 text-center">
                    <div className="text-2xl font-bold">{user.matchesWon || 0}</div>
                    <div className="text-sm text-muted-foreground">Matches Won</div>
                  </div>
                  <div className="bg-muted rounded p-4 text-center">
                    <div className="text-2xl font-bold">{user.totalTournaments || 0}</div>
                    <div className="text-sm text-muted-foreground">Tournaments</div>
                  </div>
                  <div className="bg-muted rounded p-4 text-center">
                    <div className="text-2xl font-bold">{user.rankingPoints || 0}</div>
                    <div className="text-sm text-muted-foreground">Ranking Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
              </CardHeader>
              <CardContent>
                {user.totalMatches > 0 ? (
                  <p>Match history data unavailable in emergency mode.</p>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No match history available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {isCurrentUser && (
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center py-4">Account settings unavailable in emergency mode.</p>
                    <Button asChild className="w-full">
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Go to Settings Page
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}