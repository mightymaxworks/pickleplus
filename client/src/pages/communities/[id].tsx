/**
 * PKL-278651-COMM-0014-UI
 * Community Detail Page
 * 
 * This page displays a specific community's details, leveraging the enhanced
 * UI components and data hooks developed for the Community Hub.
 */

import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useCommunityWithData, 
  useCommunityContext 
} from "@/lib/providers/CommunityProvider";
import { 
  useCommunity, 
  useCommunityMembers, 
  useCommunityEvents,
  useCommunityPosts
} from "@/lib/hooks/useCommunity";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { EventList } from "@/components/community/EventList";
import { MembersList } from "@/components/community/MembersList";
import { CommunityVisualSettings } from "@/components/community/CommunityVisualSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Users,
  Calendar,
  FileText,
  Info,
  Check,
  X,
  Edit,
  Bell,
  Palette
} from "lucide-react";
import { JoinRequestManagement } from "@/components/community/JoinRequestManagement";
import { CommunityAdminFAB } from "@/components/community/CommunityAdminFAB";
import { CommunityMemberRole } from "@/types/community";

export default function CommunityDetailPage() {
  // Get community ID from URL
  const [, params] = useRoute("/communities/:id");
  const communityId = params?.id ? parseInt(params.id) : 0;
  const [location, navigate] = useLocation();
  
  // Parse tab from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  
  // Current active tab - use URL parameter if present
  const [activeTab, setActiveTab] = useState(tabParam || "about");
  
  // Update the URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };
  
  // Fetch community data
  const { 
    community, 
    isLoading, 
    error,
    joinCommunity,
    leaveCommunity
  } = useCommunityWithData(communityId);
  
  // Redirect if community not found
  useEffect(() => {
    if (!isLoading && !community && communityId !== 0) {
      navigate("/communities");
    }
  }, [communityId, community, isLoading, navigate]);
  
  // Fetch members data
  const { 
    data: members = [], 
    isLoading: membersLoading 
  } = useCommunityMembers(communityId, { 
    limit: 12, 
    enabled: activeTab === "members" 
  });
  
  // Determine user role (for demonstration)
  // In a real app, this would come from the community data
  const userRole = community?.isMember ? CommunityMemberRole.MEMBER : null;
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error || !community) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle />
                Community Not Found
              </CardTitle>
              <CardDescription>
                We couldn't find the requested community. It may have been deleted
                or you might not have permission to view it.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="default"
                onClick={() => navigate("/communities")}
              >
                Go Back to Communities
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Determine if user has admin permissions - default to true for testing
  const hasAdminPermissions = true; // We're forcing this to be true for testing
  
  console.log("Community debugging:", {
    role: community.role,
    createdByUserId: community.createdByUserId, 
    currentUserId: (community as any).currentUserId,
    isMember: community.isMember,
    hasAdminPermissions
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        {/* Community Header with basic info and navigation */}
        <CommunityHeader 
          community={community}
          userRole={userRole}
          currentTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        {/* Show FAB only for admins/creators */}
        {hasAdminPermissions && (
          <CommunityAdminFAB communityId={communityId} />
        )}
        
        {/* Tab content */}
        <div className="mt-8">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* About section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      About This Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {community.description ? (
                        <p>{community.description}</p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No description has been provided for this community.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rules section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Community Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {community.rules ? (
                        <div dangerouslySetInnerHTML={{ __html: community.rules }} />
                      ) : (
                        <p className="text-muted-foreground italic">
                          No rules have been specified for this community.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Guidelines section */}
                {community.guidelines && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Community Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: community.guidelines }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent events preview */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Upcoming Events</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTabChange("events")}
                        className="text-xs px-2"
                      >
                        See All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EventList 
                      communityId={communityId} 
                      layout="list" 
                      showFilter={false}
                      compact={true}
                      limit={3}
                      defaultView="upcoming"
                    />
                  </CardContent>
                </Card>
                
                {/* Recent members preview */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Members</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTabChange("members")}
                        className="text-xs px-2"
                      >
                        See All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MembersList 
                      communityId={communityId}
                      layout="list"
                      showFilter={false}
                      compact={true}
                      limit={5}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Events Tab */}
          {activeTab === "events" && (
            <EventList communityId={communityId} />
          )}
          
          {/* Members Tab */}
          {activeTab === "members" && (
            <MembersList 
              communityId={communityId}
              isCurrentUserAdmin={community.role === CommunityMemberRole.ADMIN}
              layout="grid"
              showFilter={true}
            />
          )}
          
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Community Posts
                </CardTitle>
                <CardDescription>
                  Coming soon - Posts and announcements from this community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium mb-2">
                    Posts feature coming soon
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We're working on building a great posts and announcements feature for communities.
                    Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Manage Tab (visible only to admins/moderators) */}
          {activeTab === "manage" && (userRole === CommunityMemberRole.ADMIN || userRole === CommunityMemberRole.MODERATOR) && (
            <div className="space-y-8">
              {/* Management Tabs */}
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex overflow-hidden">
                  <TabsTrigger value="join-requests" className="flex gap-1 items-center justify-center">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Join Requests</span>
                    <span className="sm:hidden">Requests</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex gap-1 items-center justify-center bg-primary/5">
                    <Edit className="h-4 w-4" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Join Requests Management Panel */}
                <TabsContent value="join-requests" className="mt-6">
                  {community.requiresApproval ? (
                    <JoinRequestManagement communityId={communityId} />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Join Request Management</CardTitle>
                        <CardDescription>
                          This community doesn't require approval to join
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-lg font-medium mb-2">
                            Open community
                          </p>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            This community is set to allow anyone to join without approval.
                            To enable join request management, change the community settings
                            to require approval for new members.
                          </p>
                          <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Community Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                {/* Settings Panel */}
                <TabsContent value="settings" className="mt-6">
                  <div className="space-y-6">
                    {/* Visual Settings */}
                    <CommunityVisualSettings 
                      community={community}
                      isAdmin={community.role === CommunityMemberRole.ADMIN || community.createdByUserId === (community as any).currentUserId}
                    />
                    
                    {/* General Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5" />
                          General Settings
                        </CardTitle>
                        <CardDescription>
                          Manage your community settings and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-16">
                          <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-lg font-medium mb-2">
                            General settings management coming soon
                          </p>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            We're working on building powerful settings management for community administrators.
                            Check back soon!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>


      </div>
    </DashboardLayout>
  );
}