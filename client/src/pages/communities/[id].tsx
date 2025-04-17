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
  Edit
} from "lucide-react";
import { CommunityMemberRole } from "@/types/community";

export default function CommunityDetailPage() {
  // Get community ID from URL
  const [, params] = useRoute("/communities/:id");
  const communityId = params?.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  
  // Current active tab
  const [activeTab, setActiveTab] = useState("about");
  
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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        {/* Community Header with basic info and navigation */}
        <CommunityHeader 
          community={community}
          userRole={userRole}
          currentTab={activeTab}
          onTabChange={setActiveTab}
        />
        
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
                        onClick={() => setActiveTab("events")}
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
                        onClick={() => setActiveTab("members")}
                        className="text-xs px-2"
                      >
                        See All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {membersLoading ? (
                      <div className="space-y-3">
                        {Array(3).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No members yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.slice(0, 5).map(member => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.user?.avatarUrl || undefined} />
                                <AvatarFallback>
                                  {(member.user?.displayName || 'User').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user?.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.role === CommunityMemberRole.ADMIN 
                                    ? 'Admin' 
                                    : member.role === CommunityMemberRole.MODERATOR 
                                      ? 'Moderator' 
                                      : 'Member'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Members
                </CardTitle>
                <CardDescription>
                  {community.memberCount} members in this community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(8).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No members found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {members.map(member => (
                      <Card key={member.id} className="bg-muted/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.user?.avatarUrl || undefined} />
                                <AvatarFallback>
                                  {(member.user?.displayName || 'User').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user?.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.role === CommunityMemberRole.ADMIN 
                                    ? 'Admin' 
                                    : member.role === CommunityMemberRole.MODERATOR 
                                      ? 'Moderator' 
                                      : 'Member'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Load More Members
                </Button>
              </CardFooter>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Manage Community
                </CardTitle>
                <CardDescription>
                  Administrative controls for this community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium mb-2">
                    Management tools coming soon
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We're working on building powerful administration tools for community managers.
                    Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}