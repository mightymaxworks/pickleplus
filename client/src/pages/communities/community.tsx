/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Detail Page
 * 
 * This page displays a single community with membership controls, posts, and other community features.
 */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useCommunity, 
  useCommunityMembers, 
  useJoinCommunity, 
  useLeaveCommunity,
  useCommunityPosts
} from "@/lib/hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, MapPin, Calendar, MessageSquare, Heart, Share2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CommunityPostsList } from "@/components/community/CommunityPostsList";
import { CommunityMembersList } from "@/components/community/CommunityMembersList";
import { CommunityEventsList } from "@/components/community/CommunityEventsList";
import { CreatePostForm } from "@/components/community/CreatePostForm";
import { useUser } from "@/lib/hooks/useUser";
import { formatDistanceToNow } from "date-fns";
import confetti from "canvas-confetti";

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const [showPostForm, setShowPostForm] = useState(false);
  
  const communityId = parseInt(id);
  
  // Fetch community data
  const { 
    data: community,
    isLoading: isLoadingCommunity,
    error: communityError,
  } = useCommunity(communityId);
  
  // Check if user is a member
  const { 
    data: members = [],
    isLoading: isLoadingMembers,
  } = useCommunityMembers(communityId);
  
  const isUserMember = user && members.some(
    member => member.userId === user.id
  );
  
  // Fetch posts
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
  } = useCommunityPosts(communityId);
  
  // Join community mutation
  const joinCommunity = useJoinCommunity();
  
  // Leave community mutation
  const leaveCommunity = useLeaveCommunity();
  
  const handleJoinCommunity = async () => {
    try {
      await joinCommunity.mutateAsync(communityId);
      // Trigger confetti when successfully joining
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error("Failed to join community", error);
    }
  };
  
  const handleLeaveCommunity = async () => {
    try {
      await leaveCommunity.mutateAsync(communityId);
      toast({
        title: "Left community",
        description: "You have successfully left the community.",
      });
    } catch (error) {
      console.error("Failed to leave community", error);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Subtle confetti effect on tab change
    if (value !== activeTab) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#5755d9', '#7367f0', '#4facfe'],
        gravity: 0.3,
      });
    }
  };
  
  // Handle successful post creation
  const handlePostCreated = () => {
    setShowPostForm(false);
    toast({
      title: "Post created",
      description: "Your post has been successfully created.",
    });
  };
  
  // If there's an error fetching the community
  if (communityError) {
    return (
      <DashboardLayout>
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading this community. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/communities")}>
              Back to Communities
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        {/* Community Header */}
        <Card className="mb-6 overflow-hidden">
          {community?.bannerUrl ? (
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url(${community.bannerUrl})` }}
            />
          ) : (
            <div className={`h-48 bg-gradient-to-r from-primary/20 to-primary/40 ${community?.bannerPattern || ''}`} />
          )}
          
          <CardHeader className="flex flex-row items-start gap-4">
            {isLoadingCommunity ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <Avatar className="h-20 w-20 border-4 border-background -mt-10">
                <AvatarImage src={community?.avatarUrl || ""} />
                <AvatarFallback className="text-xl">
                  {community?.name?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1">
              {isLoadingCommunity ? (
                <>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {community?.name}
                    {community?.isPrivate && (
                      <Badge variant="outline" className="ml-2">
                        Private
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {community?.description}
                  </CardDescription>
                </>
              )}
              
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                {isLoadingCommunity ? (
                  <>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{community?.memberCount || 0} members</span>
                    </div>
                    {community?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{community.location}</span>
                      </div>
                    )}
                    {community?.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Created {formatDistanceToNow(new Date(community.createdAt))} ago</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {community?.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {community.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              {isLoadingMembers ? (
                <Skeleton className="h-10 w-24" />
              ) : isUserMember ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Leave Community</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to leave this community. You will no longer have access to community content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeaveCommunity} className="bg-destructive">
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button onClick={handleJoinCommunity} disabled={joinCommunity.isPending}>
                  {joinCommunity.isPending ? "Joining..." : "Join Community"}
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>
        
        {/* Community Content */}
        <Tabs 
          defaultValue="posts" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="posts" className="flex items-center gap-1">
                <MessageSquare size={16} />
                <span>Posts</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-1">
                <Users size={16} />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Events</span>
              </TabsTrigger>
            </TabsList>
            
            {isUserMember && activeTab === "posts" && (
              <Button onClick={() => setShowPostForm(!showPostForm)}>
                {showPostForm ? "Cancel" : "Create Post"}
              </Button>
            )}
          </div>
          
          {/* Create post form */}
          {showPostForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Create a New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <CreatePostForm 
                  communityId={communityId} 
                  onSuccess={handlePostCreated}
                  onCancel={() => setShowPostForm(false)}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-0">
            {!isUserMember && (
              <Card className="mb-4 border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Join to Participate</CardTitle>
                  <CardDescription>
                    Join this community to create posts and participate in discussions.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleJoinCommunity} disabled={joinCommunity.isPending}>
                    {joinCommunity.isPending ? "Joining..." : "Join Community"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            <CommunityPostsList 
              posts={posts} 
              isLoading={isLoadingPosts}
              isMember={!!isUserMember}
            />
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members" className="mt-0">
            <CommunityMembersList 
              members={members} 
              isLoading={isLoadingMembers}
              communityId={communityId}
            />
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="mt-0">
            <CommunityEventsList communityId={communityId} isMember={!!isUserMember} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}