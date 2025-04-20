/**
 * PKL-278651-COMM-0022-POST - Post Card Component
 * Implementation timestamp: 2025-04-21 00:30 ET
 * 
 * Component for displaying individual community posts
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ReportButton } from "@/components/moderation/ReportButton";
import { CommentSection } from "./CommentSection";
import { useAuth } from "@/hooks/use-auth";

interface PostCardProps {
  post: {
    id: number;
    communityId: number;
    userId: number;
    content: string;
    mediaUrls?: string[] | null;
    likes?: number;
    comments?: number;
    isLikedByUser?: boolean;
    tags?: string[] | null;
    isPinned?: boolean;
    isAnnouncement?: boolean;
    createdAt: string;
    updatedAt: string;
    isEdited?: boolean;
    user?: {
      id: number;
      username?: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      skillLevel?: string;
    };
  };
  onCommentClick?: () => void;
  showComments?: boolean;
}

export function PostCard({ post, onCommentClick, showComments = false }: PostCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  
  // Extract avatar URL or use fallback
  const avatarUrl = post.user?.avatarUrl;
  
  // Get user display name
  const userName = post.user?.firstName && post.user?.lastName 
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user?.username || "Unknown User";
  
  // Format date for display
  const formattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Format media URLs - handle both string and array formats
  const formattedMediaUrls = (): string[] => {
    if (!post.mediaUrls) return [];
    
    if (typeof post.mediaUrls === 'string') {
      try {
        return JSON.parse(post.mediaUrls);
      } catch {
        return [post.mediaUrls];
      }
    }
    
    return post.mediaUrls;
  };
  
  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/communities/posts/${post.id}/like`, {
        method: post.isLikedByUser ? "DELETE" : "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${post.isLikedByUser ? "unlike" : "like"} post`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities', post.communityId, 'posts']
      });
    },
    onError: (error) => {
      toast({
        title: `Failed to ${post.isLikedByUser ? "unlike" : "like"} post`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/communities/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities', post.communityId, 'posts']
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete post",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handle like button click
  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    likeMutation.mutate();
  };
  
  // Handle comment button click
  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick();
    } else {
      setShowCommentsSection(!showCommentsSection);
    }
  };
  
  // Handle share click
  const handleShare = () => {
    // Copy the URL to clipboard
    const url = `${window.location.origin}/communities/${post.communityId}/posts/${post.id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard!",
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      }
    );
  };
  
  // Handle delete post
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };
  
  // Determine if user can edit/delete post
  const canModifyPost = user && (user.id === post.userId || user.role === "admin" || user.role === "moderator");
  
  // Formatted media URLs
  const mediaUrls = formattedMediaUrls();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="font-medium">{userName}</p>
                  {post.user?.skillLevel && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {post.user.skillLevel}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formattedDate(post.createdAt)}
                  {post.isEdited && (
                    <span className="ml-1">(edited)</span>
                  )}
                </p>
              </div>
              
              {/* Options menu */}
              {canModifyPost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        toast({
                          title: "Edit feature",
                          description: "Post editing is coming in a future update!",
                        });
                      }}
                    >
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete post"
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        {/* Post content */}
        <div className="whitespace-pre-wrap break-words">
          {post.content}
        </div>
        
        {/* Media gallery */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className={`mt-4 grid ${mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Post attachment ${i + 1}`}
                className="rounded-md max-h-80 w-full object-cover"
              />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${post.isLikedByUser ? 'text-primary' : ''}`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCommentClick}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <ReportButton
            contentId={post.id}
            contentType="post"
            communityId={post.communityId}
            size="sm"
            variant="ghost"
          />
        </div>
      </CardFooter>
      
      {/* Comments section */}
      {showCommentsSection && (
        <CommentSection postId={post.id} />
      )}
    </Card>
  );
}

export default PostCard;