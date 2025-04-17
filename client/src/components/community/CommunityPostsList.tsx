/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Posts List Component
 * 
 * This component displays a list of posts for a community with like and comment functionality.
 */
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, Share2, Pin } from "lucide-react";
import { useLikePost, useUnlikePost, usePostComments } from "@/lib/hooks/useCommunity";
import { CommunityPost } from "@/types/community";
import { useUser } from "@/lib/hooks/useUser";
import { PostCommentSection } from "./PostCommentSection";
import { useToast } from "@/hooks/use-toast";

interface CommunityPostsListProps {
  posts: CommunityPost[];
  isLoading: boolean;
  isMember: boolean;
}

export const CommunityPostsList = ({ posts, isLoading, isMember }: CommunityPostsListProps) => {
  const { data: user } = useUser();
  const { toast } = useToast();
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  
  const toggleLike = async (post: CommunityPost) => {
    if (!isMember) {
      toast({
        title: "Join Required",
        description: "Join this community to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user already liked the post
      const isLiked = post.userHasLiked; // Assuming this is returned from API
      
      if (isLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleComments = (postId: number) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };
  
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardHeader className="flex flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    ));
  };
  
  if (isLoading) {
    return <div className="space-y-4">{renderSkeletons()}</div>;
  }
  
  if (posts.length === 0) {
    return (
      <Card className="text-center p-6">
        <div className="py-10">
          <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to create a post in this community!
          </p>
          {isMember && (
            <Button>Create Post</Button>
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className={post.isPinned ? "border-primary/50" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.avatarUrl || ""} />
                  <AvatarFallback>
                    {post.author?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {post.author?.displayName || post.author?.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              {post.isPinned && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Pin size={12} /> Pinned
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="whitespace-pre-wrap">{post.content}</div>
            
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {post.mediaUrls.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Post media ${index + 1}`} 
                    className="rounded-md object-cover max-h-64 w-full" 
                  />
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0 pb-2 px-4">
            <div className="flex justify-between items-center w-full text-sm">
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 px-2" 
                  onClick={() => toggleLike(post)}
                  disabled={likePost.isPending || unlikePost.isPending}
                >
                  <Heart 
                    size={16} 
                    className={post.userHasLiked ? "fill-destructive text-destructive" : ""} 
                  />
                  <span>{post.likes || 0}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8 px-2" 
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageSquare size={16} />
                  <span>{post.comments || 0}</span>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Post by ${post.author?.displayName || post.author?.username}`,
                      text: post.content.substring(0, 100) + "...",
                      url: window.location.href + `?post=${post.id}`,
                    });
                  } else {
                    toast({
                      title: "Link Copied",
                      description: "Post link copied to clipboard!",
                    });
                    navigator.clipboard.writeText(window.location.href + `?post=${post.id}`);
                  }
                }}
              >
                <Share2 size={16} />
              </Button>
            </div>
          </CardFooter>
          
          {/* Comment section */}
          {expandedPost === post.id && (
            <>
              <Separator />
              <PostCommentSection 
                postId={post.id} 
                isMember={isMember} 
              />
            </>
          )}
        </Card>
      ))}
    </div>
  );
};