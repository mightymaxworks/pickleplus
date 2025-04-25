/**
 * PKL-278651-SAGE-0011-SOCIAL - Content Comment Dialog Component
 * 
 * This component displays a dialog for viewing and adding comments to social content
 * Part of Sprint 5: Social Features & UI Polish
 */

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useContentComments, useAddCommentMutation } from "@/hooks/use-social";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MessageSquare, Send, CornerDownRight } from "lucide-react";
import { ContentComment } from "@/types/social";

interface ContentCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: number;
}

export function ContentCommentDialog({
  open,
  onOpenChange,
  contentId,
}: ContentCommentDialogProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const { data: comments, isLoading } = useContentComments(contentId);
  const addCommentMutation = useAddCommentMutation();
  
  // Format comments into a hierarchy with replies
  const formatComments = (comments: ContentComment[] = []) => {
    const topLevelComments: ContentComment[] = [];
    const commentMap = new Map<number, ContentComment>();
    
    // First pass: create a map of all comments by ID
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: organize into parent-child relationships
    comments.forEach(comment => {
      const formattedComment = commentMap.get(comment.id);
      if (!formattedComment) return;
      
      if (comment.parentCommentId) {
        const parentComment = commentMap.get(comment.parentCommentId);
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(formattedComment);
        } else {
          topLevelComments.push(formattedComment);
        }
      } else {
        topLevelComments.push(formattedComment);
      }
    });
    
    return topLevelComments;
  };
  
  const formattedComments = formatComments(comments);
  
  // Handle comment submission
  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;
    
    addCommentMutation.mutate({
      contentId,
      text: commentText,
      parentCommentId: replyToId || undefined,
    }, {
      onSuccess: () => {
        setCommentText("");
        setReplyToId(null);
      },
    });
  };
  
  // Start a reply to a specific comment
  const handleReply = (commentId: number) => {
    setReplyToId(commentId);
    // Focus the comment input
    const textarea = document.getElementById("comment-textarea");
    if (textarea) {
      textarea.focus();
    }
  };
  
  // Cancel a reply
  const handleCancelReply = () => {
    setReplyToId(null);
  };
  
  // Render a single comment
  const renderComment = (comment: ContentComment) => {
    const isReplyingToThis = replyToId === comment.id;
    const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
    });
    
    return (
      <div key={comment.id} className="mb-4">
        <div className="flex gap-3">
          <Link href={`/profile/${comment.userId}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/api/users/${comment.userId}/avatar`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="font-medium">User {comment.userId}</div>
                <div className="text-xs text-muted-foreground">{formattedDate}</div>
              </div>
              <div className="mt-1">{comment.text}</div>
            </div>
            
            <div className="mt-1 ml-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 text-xs"
                onClick={() => handleReply(comment.id)}
              >
                Reply
              </Button>
              {isReplyingToThis && (
                <span className="text-xs text-primary ml-2">Replying to this comment</span>
              )}
            </div>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 border-l-2 border-muted pl-4">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2 my-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                </div>
              </div>
            ))
          ) : formattedComments.length > 0 ? (
            // Comments list
            formattedComments.map(comment => renderComment(comment))
          ) : (
            // Empty state
            <div className="text-center py-10">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No comments yet</h3>
              <p className="text-muted-foreground">Be the first to add a comment!</p>
            </div>
          )}
        </div>
        
        <div className="border-t pt-3">
          {replyToId !== null && (
            <div className="flex items-center mb-2 p-1 bg-muted/30 rounded text-sm">
              <CornerDownRight className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Replying to comment</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-6 px-2"
                onClick={handleCancelReply}
              >
                Cancel
              </Button>
            </div>
          )}
          
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user ? `/api/users/${user.id}/avatar` : undefined} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex items-end gap-2">
              <Textarea
                id="comment-textarea"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[60px]"
              />
              
              <Button
                size="icon"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                onClick={handleSubmitComment}
                className="mb-[2px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}