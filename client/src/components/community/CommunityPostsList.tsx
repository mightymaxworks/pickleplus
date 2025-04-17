/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Posts List Component
 * 
 * This component displays a list of posts for a community with like and comment functionality.
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, FileText, PinIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/lib/api/community";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PostCommentSection } from "./PostCommentSection";

interface CommunityPostsListProps {
  posts: CommunityPost[];
  isLoading: boolean;
  isMember: boolean;
}

export const CommunityPostsList = ({ posts, isLoading, isMember }: CommunityPostsListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  
  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('/api/communities/posts/' + postId + '/like', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like the post. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleLikePost = async (post: CommunityPost) => {
    if (!isMember) {
      toast({
        title: "Membership required",
        description: "You need to be a member to like posts.",
        variant: "default"
      });
      return;
    }
    
    if (post.userHasLiked) {
      // Unlike post logic would go here, but we'll keep it simple for now
      return;
    }
    
    try {
      await likePostMutation.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };
  
  const toggleComments = (postId: number) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <div className="px-6 pb-4 flex justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
        <p className="text-muted-foreground mb-6">
          Be the first to share something with the community!
        </p>
      </Card>
    );
  }
  
  const renderPostContent = (content: string, imageUrls?: string[]) => {
    return (
      <div>
        <div className="mb-3 whitespace-pre-wrap">{content}</div>
        
        {imageUrls && imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {imageUrls.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Post image ${index + 1}`} 
                className="rounded-md object-cover h-40 w-full"
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className={post.isPinned ? "border-primary" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.avatarUrl || ""} />
                  <AvatarFallback>{post.author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.author?.username || "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </div>
                </div>
              </div>
              
              {post.isPinned && (
                <Badge variant="outline" className="ml-auto flex items-center gap-1">
                  <PinIcon className="h-3 w-3" />
                  <span>Pinned</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {renderPostContent(post.content, post.imageUrls)}
          </CardContent>
          <CardFooter className="pt-2 pb-4 flex justify-between text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleLikePost(post)}
              disabled={likePostMutation.isPending}
            >
              <Heart 
                className={`h-4 w-4 ${post.userHasLiked ? "fill-red-500 text-red-500" : ""}`} 
              />
              <span>{post.likeCount || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => toggleComments(post.id)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount || 0}</span>
            </Button>
          </CardFooter>
          
          {/* Comments section - expanded when clicked */}
          {expandedPostId === post.id && (
            <div className="px-6 pb-4">
              <PostCommentSection postId={post.id} isMember={isMember} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};