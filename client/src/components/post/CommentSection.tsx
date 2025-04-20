/**
 * PKL-278651-COMM-0022-POST - Comment Section Component
 * Implementation timestamp: 2025-04-21 00:40 ET
 * 
 * Component for displaying and adding comments to a post
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ThumbsUp, 
  Reply, 
  MoreHorizontal, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ReportButton } from "@/components/moderation/ReportButton";
import { formatDistanceToNow } from "date-fns";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CommentSectionProps {
  postId: number;
}

// Form validation schema using zod
const commentFormSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters"),
  parentCommentId: z.number().optional(),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

export function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  // Initialize form
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Fetch comments for this post
  const { 
    data: comments, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/communities/posts', postId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/communities/posts/${postId}/comments`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      return response.json();
    },
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      const response = await fetch(`/api/communities/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      setReplyingTo(null);
      
      // Show success message
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      
      // Invalidate queries to refresh the comments list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities/posts', postId, 'comments']
      });
      
      // Also invalidate the post query to update comment count
      queryClient.invalidateQueries({
        queryKey: ['/api/communities', 'posts']
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: number, isLiked: boolean }) => {
      const response = await fetch(`/api/communities/comments/${commentId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? "unlike" : "like"} comment`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities/posts', postId, 'comments']
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to like/unlike comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/communities/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Comment has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities/posts', postId, 'comments']
      });
      
      // Also invalidate the post query to update comment count
      queryClient.invalidateQueries({
        queryKey: ['/api/communities', 'posts']
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Format date for display
  const formattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Handle form submission
  const onSubmit = (data: CommentFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }
    
    // Add parentCommentId if replying to a comment
    if (replyingTo) {
      data.parentCommentId = replyingTo;
    }
    
    addCommentMutation.mutate(data);
  };
  
  // Handle like button click
  const handleLike = (commentId: number, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      });
      return;
    }
    
    likeCommentMutation.mutate({ commentId, isLiked });
  };
  
  // Handle delete comment
  const handleDelete = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      deleteCommentMutation.mutate(commentId);
    }
  };
  
  // Render comments in a hierarchical structure
  const renderComments = (parentId: number | null = null) => {
    if (!comments) return null;
    
    const filteredComments = comments.filter((comment: any) => 
      parentId === null 
        ? comment.parentCommentId === null 
        : comment.parentCommentId === parentId
    );
    
    return filteredComments.map((comment: any) => {
      const isLiked = comment.isLikedByUser;
      const canModify = user && (user.id === comment.userId || user.role === "admin" || user.role === "moderator");
      
      return (
        <div key={comment.id} className="mb-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatarUrl} alt={comment.user?.username || "User"} />
              <AvatarFallback>
                {(comment.user?.firstName?.charAt(0) || comment.user?.username?.charAt(0) || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Comment content */}
            <div className="flex-1">
              <div className="bg-muted/40 px-3 py-2 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-sm">
                      {comment.user?.firstName && comment.user?.lastName 
                        ? `${comment.user.firstName} ${comment.user.lastName}`
                        : comment.user?.username || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formattedDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  {/* Comment actions */}
                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          {deleteCommentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete comment"
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
              
              {/* Comment actions */}
              <div className="flex items-center gap-4 mt-1 ml-2">
                <button
                  className={`text-xs flex items-center gap-1 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => handleLike(comment.id, isLiked)}
                  disabled={likeCommentMutation.isPending}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>{comment.likes || 0}</span>
                </button>
                
                <button
                  className="text-xs flex items-center gap-1 text-muted-foreground"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="h-3 w-3" />
                  <span>Reply</span>
                </button>
                
                <ReportButton
                  contentId={comment.id}
                  contentType="comment"
                  communityId={comment.communityId || 0}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-muted-foreground"
                >
                  Report
                </ReportButton>
              </div>
              
              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-2 ml-2">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder={`Reply to ${comment.user?.firstName || comment.user?.username || "user"}...`}
                                className="min-h-[60px] resize-none text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                          disabled={addCommentMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={addCommentMutation.isPending}
                        >
                          {addCommentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Replying...
                            </>
                          ) : (
                            "Reply"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
              
              {/* Nested replies */}
              <div className="ml-4 mt-2">
                {renderComments(comment.id)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="px-4 pb-4">
      <Separator className="mb-4" />
      
      {/* Add new comment form */}
      {user && (
        <div className="flex gap-3 mb-6">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.firstName || user.username || "User"} />
            <AvatarFallback>
              {(user.firstName?.charAt(0) || user.username?.charAt(0) || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write a comment..."
                          className="min-h-[60px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center">
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please fix the errors above</span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addCommentMutation.isPending}
                    className="ml-auto"
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
      
      {/* Not logged in message */}
      {!user && (
        <div className="text-center py-4 border rounded-md bg-muted/20 mb-4">
          <p className="text-muted-foreground">
            Please sign in to add comments.
          </p>
        </div>
      )}
      
      {/* Comments list */}
      <div>
        <h3 className="font-medium mb-4">Comments</h3>
        
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-destructive">
            <AlertCircle className="h-6 w-6 mx-auto" />
            <p className="mt-2">
              Error loading comments: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderComments()}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentSection;