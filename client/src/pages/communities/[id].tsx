/**
 * PKL-278651-COMM-0006-HUB-UI
 * Community Detail Page
 * 
 * This page displays detailed information about a specific community.
 * Redesigned to match the modern UI pattern from the test/community page.
 */

import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { CommunityProvider, useCommunityWithData } from "../../lib/providers/CommunityProvider";
import { 
  useCommunityMembers, 
  useCommunityPosts, 
  useCommunityEvents, 
  useCreateCommunityPost 
} from "../../lib/hooks/useCommunity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFormModal } from "@/components/community/EventFormModal";
import RichTextEditor from "@/components/community/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Settings, 
  Lock, 
  Shield, 
  MapPin, 
  Activity, 
  FileText,
  Loader2,
  Mail,
  ExternalLink,
  Star,
  BarChart,
  Trophy,
  Hash,
  Target,
  Sparkles,
  Megaphone
} from "lucide-react";

// Import modern UI components
import CommunityMenu from "@/components/community/CommunityMenu";
import { 
  PickleballIcon, 
  CourtLinesBackground, 
  ConfettiEffect, 
  FeatureBadge,
  DecorativeElements,
  CommunityHeader
} from "@/components/community/CommunityUIComponents";

export default function CommunityDetailPage() {
  // Wrap the component with the provider to ensure context is available
  return (
    <CommunityProvider>
      <CommunityDetail />
    </CommunityProvider>
  );
}

function CommunityDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const communityId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState("posts");
  // State for confetti animation
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Add CSS for rich text content
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .rich-text-content {
        overflow-wrap: break-word;
        word-wrap: break-word;
      }
      .rich-text-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.375rem;
        margin: 0.5rem 0;
      }
      .rich-text-content ul, .rich-text-content ol {
        padding-left: 1.5rem;
        margin: 0.5rem 0;
      }
      .rich-text-content ul {
        list-style-type: disc;
      }
      .rich-text-content ol {
        list-style-type: decimal;
      }
      .rich-text-content a {
        color: var(--primary);
        text-decoration: underline;
      }
      .rich-text-content blockquote {
        border-left: 3px solid var(--muted);
        padding-left: 1rem;
        color: var(--muted-foreground);
        font-style: italic;
        margin: 0.5rem 0;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Get community data and actions from context
  const { 
    community, 
    isLoading, 
    error, 
    joinCommunity, 
    leaveCommunity, 
    isJoining, 
    isLeaving 
  } = useCommunityWithData(communityId);
  
  // Fetch members for this community
  const { 
    data: members,
    isLoading: isLoadingMembers
  } = useCommunityMembers(communityId);
  
  // Check if current user is a member
  // This would typically use the authenticated user ID from a context
  const currentUserId = 1; // Placeholder until we integrate with auth
  const isMember = members?.some(member => member.userId === currentUserId) || false;
  
  // Determine if user is an admin/moderator
  const userRole = members?.find(member => member.userId === currentUserId)?.role || 'none';
  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  
  // Handle back navigation
  const handleBack = () => {
    navigate("/communities");
  };
  
  // Handle joining and leaving
  const handleJoin = () => {
    joinCommunity(communityId);
  };
  
  const handleLeave = () => {
    leaveCommunity(communityId);
  };
  
  // Handle settings navigation
  const handleSettings = () => {
    navigate(`/communities/${communityId}/settings`);
  };
  
  // Trigger confetti when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-7xl">
        <CommunityDetailSkeleton />
      </div>
    );
  }
  
  // Show error state
  if (error || !community) {
    return (
      <div className="container py-8 max-w-7xl">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Communities
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">Community Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The community you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={handleBack}>
              Browse Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Community header with simplified design
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* Back Navigation */}
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Communities
        </Button>
        
        {/* Community Header Banner */}
        <CommunityHeader />
        
        {/* Community Navigation */}
        <div className="mb-8">
          <CommunityMenu activeTab="profile" />
        </div>
        
        {/* Main Content */}
        <div className="bg-card rounded-lg p-6 border border-border mb-8">
          
          {/* Community Profile Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary/40 to-primary rounded-t-lg overflow-hidden">
              {community.bannerUrl && (
                <img
                  src={community.bannerUrl}
                  alt={`${community.name} banner`}
                  className="w-full h-full object-cover rounded-t-lg opacity-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-12 left-8 ring-4 ring-background p-1 rounded-2xl bg-background shadow-lg">
              <Avatar className="h-24 w-24">
                <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Community Info Section */}
          <div className="pt-14 px-4 flex flex-col lg:flex-row justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{community.name}</h1>
                
                {community.isPrivate && (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                
                {community.requiresApproval && (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex items-center text-muted-foreground mt-1">
                {community.location && (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{community.location}</span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <Users className="h-4 w-4 mr-1" />
                <span>{community.memberCount} members</span>
                <span className="mx-2">•</span>
                <Activity className="h-4 w-4 mr-1" />
                <span>{community.postCount} posts</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {community.skillLevel && (
                  <Badge variant="secondary">{community.skillLevel}</Badge>
                )}
                
                {community.tags && 
                  community.tags.split(',').map((tag) => (
                    <Badge key={tag} variant="secondary" className="max-w-[150px] truncate">
                      {tag.trim()}
                    </Badge>
                  ))
                }
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 lg:mt-0">
              {isAdmin && (
                <Button variant="secondary" onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
              
              {isMember ? (
                <Button variant="outline" onClick={handleLeave} disabled={isLeaving}>
                  {isLeaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Leave Community
                </Button>
              ) : (
                <Button onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Join Community
                </Button>
              )}
            </div>
          </div>
          
          {/* Feature Badge Pills */}
          <div className="my-6 px-4 flex flex-wrap gap-2">
            <FeatureBadge icon={<Target className="h-3 w-3" />} label="Community Goals" color="green" />
            <FeatureBadge icon={<Trophy className="h-3 w-3" />} label="Achievements" color="blue" />
            <FeatureBadge icon={<Activity className="h-3 w-3" />} label="Activity Feed" color="purple" />
            <FeatureBadge icon={<Calendar className="h-3 w-3" />} label="Events" color="amber" />
            <FeatureBadge icon={<Users className="h-3 w-3" />} label="Members" color="rose" />
          </div>
        
          {/* Community details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {community.description ? (
                    <p>{community.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No description provided.
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {community.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{community.location}</span>
                      </Badge>
                    )}
                    
                    {community.tags && 
                      community.tags.split(',').map((tag) => (
                        <Badge key={tag} variant="secondary" className="max-w-[150px] truncate">
                          {tag.trim()}
                        </Badge>
                      ))
                    }
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{community.memberCount} members</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      <span>{community.postCount} posts</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{community.eventCount} events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 max-w-xl">
                  <TabsTrigger value="posts" className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Posts</span>
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </TabsTrigger>
                  <TabsTrigger value="about" className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Rules</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="mt-6">
                  <CommunityPosts communityId={communityId} isMember={isMember} />
                </TabsContent>
                
                <TabsContent value="events" className="mt-6">
                  <CommunityEvents communityId={communityId} isMember={isMember} />
                </TabsContent>
                
                <TabsContent value="members" className="mt-6">
                  <CommunityMembers communityId={communityId} />
                </TabsContent>
                
                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rules</CardTitle>
                      <CardDescription>
                        Community rules that all members should follow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {community.rules ? (
                        <div className="whitespace-pre-line">{community.rules}</div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No community rules have been defined.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Guidelines</CardTitle>
                      <CardDescription>
                        Additional guidelines for community participation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {community.guidelines ? (
                        <div className="whitespace-pre-line">{community.guidelines}</div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No community guidelines have been defined.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingMembers ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  ) : members && members.length > 0 ? (
                    <div className="space-y-3">
                      {members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.userId.toString().charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">User #{member.userId}</p>
                            {member.role !== 'member' && (
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {community.memberCount > 5 && (
                        <Button
                          variant="ghost"
                          className="w-full text-xs"
                          onClick={() => handleTabChange("members")}
                        >
                          View all {community.memberCount} members
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No members in this community yet.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    No upcoming events. Check back soon!
                  </p>
                  
                  {isMember && (
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => handleTabChange("events")}
                    >
                      Create Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Community Posts Component with like, comment, and delete functionality
function CommunityPosts({ communityId, isMember }: { communityId: number; isMember: boolean }) {
  const { data: posts, isLoading, refetch } = useCommunityPosts(communityId);
  const createPostMutation = useCreateCommunityPost();
  const [postContent, setPostContent] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();
  
  // Current user ID (would normally come from auth context)
  const currentUserId = 1; // Placeholder until we integrate with auth
  
  // Handle creating a new post
  const handleCreatePost = () => {
    if (!postContent.trim()) {
      return; // Don't submit empty posts
    }
    
    createPostMutation.mutate({
      communityId,
      data: {
        content: postContent,
        mediaUrls: []
      }
    }, {
      onSuccess: () => {
        // Clear the editor after successful post
        setPostContent('');
        // Refresh the posts list
        refetch();
        
        toast({
          title: "Post created!",
          description: "Your post has been published to the community.",
          variant: "default",
        });
      },
      onError: (error) => {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Handle post liking/unliking
  const handleLikePost = async (postId: number, isLiked: boolean) => {
    try {
      // Simulated API call for liking/unliking
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        description: isLiked ? "You have unliked this post" : "You have liked this post",
      });
      
      // Refresh posts to get updated like count
      refetch();
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding a comment to a post
  const handleAddComment = async (postId: number) => {
    if (!commentContent.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      // Simulated API call for adding a comment
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset comment form
      setCommentContent("");
      
      // Show success toast
      toast({
        title: "Comment added!",
        description: "Your comment has been added to the post.",
      });
      
      // Refresh posts to get updated comments
      refetch();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle post deletion
  const handleDeletePost = async (postId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      // Simulated API call for post deletion
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Post deleted",
        description: "Your post has been deleted from the community.",
      });
      
      // Refresh posts list
      refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle viewing all comments for a post
  const handleViewAllComments = (postId: number) => {
    // Implement functionality to view all comments
    // This could be a modal or navigation to a dedicated comments page
    toast({
      title: "View all comments",
      description: "This feature is coming soon.",
    });
  };
  
  if (isLoading) {
    return <div>Loading posts...</div>;
  }
  
  return (
    <div className="space-y-6">
      {isMember && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">Create a Post</h3>
              <RichTextEditor 
                value={postContent}
                onChange={setPostContent}
                placeholder="Share something with the community..."
                minHeight="150px"
                onSubmit={handleCreatePost}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {createPostMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Submitting...
                    </span>
                  ) : null}
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={createPostMutation.isPending || !postContent.trim()}
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {post.userId.toString().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User #{post.userId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {post.isPinned && (
                      <Badge variant="outline">Pinned</Badge>
                    )}
                  </div>
                  
                  <div 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => handleLikePost(post.id, post.isLikedByCurrentUser)}
                    >
                      {post.isLikedByCurrentUser ? (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500 mr-1" />
                      ) : (
                        <Heart className="h-4 w-4 mr-1" />
                      )}
                      <span>{post.isLikedByCurrentUser ? 'Liked' : 'Like'}</span>
                      <span>({post.likes})</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>Comment</span>
                      <span>({post.comments})</span>
                    </Button>
                    
                    {post.userId === currentUserId && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 ml-auto"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                        <span className="text-red-500">Delete</span>
                      </Button>
                    )}
                  </div>
                  
                  {activeCommentPostId === post.id && (
                    <div className="mt-4 space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {currentUserId.toString().charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea
                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Write a comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                          />
                          <div className="flex justify-end mt-2">
                            <Button 
                              size="sm"
                              disabled={!commentContent.trim() || isSubmittingComment}
                              onClick={() => handleAddComment(post.id)}
                            >
                              {isSubmittingComment ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Add Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {post.recentComments && post.recentComments.length > 0 ? (
                        <div className="space-y-3 mt-4">
                          {post.recentComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {comment.userId.toString().charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted/50 rounded-md p-3">
                                  <div className="flex justify-between">
                                    <span className="font-medium">User #{comment.userId}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {post.commentCount > post.recentComments.length && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-muted-foreground"
                              onClick={() => handleViewAllComments(post.id)}
                            >
                              View all {post.commentCount} comments
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground">
              {isMember ? "Use the form above to be the first to post in this community!" : "Join this community to create posts!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * PKL-278651-COMM-0007-ENGAGE
 * Enhanced Community Events Component
 * 
 * This component provides a view of community events with improved filtering
 * and display of event types, skill level requirements, and status.
 * 
 * @version 2.0.0
 * @lastModified 2025-04-17
 */
function CommunityEvents({ communityId, isMember }: { communityId: number; isMember: boolean }) {
  const { data: events, isLoading } = useCommunityEvents(communityId);
  const [openEventModal, setOpenEventModal] = React.useState(false);
  
  if (isLoading) {
    return <div>Loading events...</div>;
  }
  
  // Event type badge color mapping
  const getEventTypeBadgeColor = (eventType: string) => {
    const colors = {
      match_play: "bg-green-100 text-green-800 border-green-300",
      league: "bg-blue-100 text-blue-800 border-blue-300",
      training: "bg-yellow-100 text-yellow-800 border-yellow-300",
      tournament: "bg-purple-100 text-purple-800 border-purple-300",
      social: "bg-pink-100 text-pink-800 border-pink-300",
      other: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[eventType as keyof typeof colors] || colors.other;
  };
  
  // Event type display name
  const getEventTypeLabel = (eventType: string) => {
    const labels = {
      match_play: "Match Play",
      league: "League",
      training: "Training",
      tournament: "Tournament",
      social: "Social",
      other: "Other"
    };
    return labels[eventType as keyof typeof labels] || "Event";
  };
  
  // Status badge color mapping
  const getStatusBadgeColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[status as keyof typeof colors] || colors.active;
  };
  
  return (
    <div className="space-y-6">
      {/* Import EventFormModal at the top of the file */}
      {/* import { EventFormModal } from "@/components/community/EventFormModal"; */}
      <EventFormModal
        open={openEventModal}
        onOpenChange={setOpenEventModal}
        communityId={communityId}
      />
      
      {isMember && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setOpenEventModal(true)}
            className="bg-pickle-green hover:bg-pickle-green/90"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      )}
      
      {events && events.length > 0 ? (
        events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-1">{event.title}</CardTitle>
                  <CardDescription>
                    {new Date(event.eventDate).toLocaleDateString()} at{" "}
                    {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getEventTypeBadgeColor(event.eventType)}>
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  {event.status && event.status !== "active" && (
                    <Badge className={getStatusBadgeColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{event.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {event.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </Badge>
                )}
                
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>
                    {event.currentAttendees}/{event.maxAttendees || '∞'} attendees
                  </span>
                </Badge>
                
                {event.isVirtual && (
                  <Badge>Virtual</Badge>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Events Scheduled</h3>
            <p className="text-muted-foreground">
              There are no upcoming events in this community.
            </p>
            
            {isMember && (
              <Button className="mt-4">Create Event</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CommunityMembers({ communityId }: { communityId: number }) {
  const { data: members, isLoading } = useCommunityMembers(communityId);
  
  if (isLoading) {
    return <div>Loading members...</div>;
  }
  
  const admins = members?.filter(m => m.role === 'admin') || [];
  const moderators = members?.filter(m => m.role === 'moderator') || [];
  const regularMembers = members?.filter(m => m.role === 'member') || [];
  
  return (
    <div className="space-y-6">
      {admins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {admins.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.userId.toString().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User #{member.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {moderators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {moderators.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.userId.toString().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User #{member.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {regularMembers && regularMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {regularMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.userId.toString().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User #{member.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No regular members yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton for community detail
function CommunityDetailSkeleton() {
  return (
    <>
      <Button variant="ghost" className="mb-6" disabled>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Communities
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}