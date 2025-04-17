/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Detail Page
 * 
 * This page displays the details of a community with tabs for posts, events, and members.
 */
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { 
  MapPin, 
  Users, 
  Calendar, 
  MessageSquare,
  Info,
  Lock,
  PlusCircle
} from 'lucide-react';
import { Community, JoinCommunityRequest } from '@/lib/api/community';
import { CommunityPostsList } from '@/components/community/CommunityPostsList';
import { CommunityMembersList } from '@/components/community/CommunityMembersList';
import { CommunityEventsList } from '@/components/community/CommunityEventsList';
import { CreatePostForm } from '@/components/community/CreatePostForm';
import { useUser } from '@/lib/hooks/useUser';

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const communityId = Number(id);
  const [location, setLocation] = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  
  // Get community details
  const { 
    data: community, 
    isLoading: isLoadingCommunity 
  } = useQuery({
    queryKey: ['/api/communities/' + communityId],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/' + communityId);
      return response as Community;
    },
    enabled: !!communityId,
  });
  
  // Get community membership status
  const { 
    data: membershipStatus, 
    isLoading: isLoadingMembership 
  } = useQuery({
    queryKey: ['/api/communities/' + communityId + '/membership'],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/' + communityId + '/membership');
      return response as { isMember: boolean; isPending: boolean; };
    },
    enabled: !!communityId && !!currentUser,
  });
  
  // Get community members
  const { 
    data: members = [], 
    isLoading: isLoadingMembers 
  } = useQuery({
    queryKey: ['/api/communities/' + communityId + '/members'],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/' + communityId + '/members');
      return response;
    },
    enabled: !!communityId,
  });
  
  // Get community posts
  const { 
    data: posts = [], 
    isLoading: isLoadingPosts 
  } = useQuery({
    queryKey: ['/api/communities/' + communityId + '/posts'],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/' + communityId + '/posts');
      return response;
    },
    enabled: !!communityId,
  });
  
  // Join community mutation
  const joinCommunity = useMutation({
    mutationFn: async (data: JoinCommunityRequest) => {
      return apiRequest('/api/communities/join', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/' + communityId + '/membership'] });
      
      toast({
        title: 'Joined Community',
        description: community?.requiresApproval 
          ? 'Your request to join has been submitted and is pending approval.' 
          : 'You have successfully joined the community.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to join the community. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Leave community mutation
  const leaveCommunity = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/communities/' + communityId + '/leave', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/' + communityId + '/membership'] });
      
      toast({
        title: 'Left Community',
        description: 'You have successfully left the community.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to leave the community. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const handleJoinCommunity = () => {
    joinCommunity.mutate({ communityId });
  };
  
  const handleLeaveCommunity = () => {
    leaveCommunity.mutate();
  };
  
  if (isLoadingCommunity) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-48 w-full rounded-xl mb-4" />
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!community) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Community Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The community you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" onClick={() => setLocation('/communities')}>
            Back to Communities
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const isMember = membershipStatus?.isMember || false;
  const isPending = membershipStatus?.isPending || false;
  const isPrivate = community.isPrivate;
  const requiresApproval = community.requiresApproval;
  
  // Extract tags from the community
  const tags = community.tags ? community.tags.split(',').map(tag => tag.trim()) : [];
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Banner */}
        <div className={`h-48 rounded-xl mb-6 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden relative`}>
          {community.bannerUrl && (
            <img 
              src={community.bannerUrl} 
              alt={`${community.name} banner`} 
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
        </div>
        
        {/* Community Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={community.avatarUrl || ""} />
              <AvatarFallback className="text-2xl">{community.name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{community.name}</h1>
              {isPrivate && (
                <Badge variant="outline" className="ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-3">{community.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {community.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{community.location}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{community.postCount} {community.postCount === 1 ? 'post' : 'posts'}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{community.eventCount} {community.eventCount === 1 ? 'event' : 'events'}</span>
              </div>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              {!isMember && !isPending && (
                <Button 
                  onClick={handleJoinCommunity}
                  disabled={joinCommunity.isPending}
                >
                  {joinCommunity.isPending ? 'Joining...' : (requiresApproval ? 'Request to Join' : 'Join Community')}
                </Button>
              )}
              
              {isMember && (
                <Button 
                  variant="outline" 
                  onClick={handleLeaveCommunity}
                  disabled={leaveCommunity.isPending}
                >
                  {leaveCommunity.isPending ? 'Leaving...' : 'Leave Community'}
                </Button>
              )}
              
              {isPending && (
                <Button disabled>
                  Membership Pending
                </Button>
              )}
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="space-y-4 py-4">
                    <h3 className="text-lg font-medium">About {community.name}</h3>
                    <p className="text-muted-foreground">{community.description}</p>
                    
                    {community.rules && (
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Community Rules</h4>
                        <div className="text-sm space-y-2">
                          {community.rules.split('\n').map((rule, index) => (
                            <p key={index} className="pb-1">{rule}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {community.guidelines && (
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Community Guidelines</h4>
                        <div className="text-sm space-y-2">
                          {community.guidelines.split('\n').map((guideline, index) => (
                            <p key={index} className="pb-1">{guideline}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Create Post Button (only for members) */}
        {isMember && (
          <div className="mb-4">
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
            
            {isCreatePostOpen && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Create a New Post</CardTitle>
                  <CardDescription>Share something with the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <CreatePostForm 
                    communityId={communityId} 
                    onSuccess={() => setIsCreatePostOpen(false)}
                    onCancel={() => setIsCreatePostOpen(false)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Private Community Notice */}
        {isPrivate && !isMember && !isPending && (
          <Card className="mb-6">
            <CardContent className="flex items-center p-4">
              <Lock className="h-5 w-5 mr-3 text-muted-foreground" />
              <div>
                <p className="font-medium">This is a private community</p>
                <p className="text-sm text-muted-foreground">
                  Join this community to see its posts, events, and members.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Approval Pending Notice */}
        {isPending && (
          <Card className="mb-6 border-yellow-200">
            <CardContent className="flex items-center p-4">
              <Info className="h-5 w-5 mr-3 text-yellow-500" />
              <div>
                <p className="font-medium">Membership approval pending</p>
                <p className="text-sm text-muted-foreground">
                  Your request to join this community is pending approval from admins.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {(!isPrivate || isMember) ? (
              <CommunityPostsList 
                posts={posts} 
                isLoading={isLoadingPosts} 
                isMember={isMember} 
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Lock className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Private Community</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You need to join this community to see its posts.
                  </p>
                  <Button onClick={handleJoinCommunity}>
                    {requiresApproval ? 'Request to Join' : 'Join Community'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            {(!isPrivate || isMember) ? (
              <CommunityEventsList 
                communityId={communityId} 
                isMember={isMember} 
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Lock className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Private Community</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You need to join this community to see its events.
                  </p>
                  <Button onClick={handleJoinCommunity}>
                    {requiresApproval ? 'Request to Join' : 'Join Community'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            {(!isPrivate || isMember) ? (
              <CommunityMembersList 
                members={members} 
                isLoading={isLoadingMembers} 
                communityId={communityId}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Lock className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Private Community</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You need to join this community to see its members.
                  </p>
                  <Button onClick={handleJoinCommunity}>
                    {requiresApproval ? 'Request to Join' : 'Join Community'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}