/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Post Comment Section Component
 * 
 * This component displays and manages comments for a community post.
 */
import { useState } from "react";
import { usePostComments, useCreateComment } from "@/lib/hooks/useCommunity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PostCommentSectionProps {
  postId: number;
  isMember: boolean;
}

export const PostCommentSection = ({ postId, isMember }: PostCommentSectionProps) => {
  const [comment, setComment] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { 
    data: comments = [], 
    isLoading: isLoadingComments 
  } = usePostComments(postId);
  
  const createComment = useCreateComment();
  
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        content: comment,
        parentCommentId: replyToId || undefined
      });
      
      setComment("");
      setIsReplying(false);
      setReplyToId(null);
      
      // Success toast is handled in the mutation
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };
  
  const startReply = (commentId: number, authorName: string) => {
    setIsReplying(true);
    setReplyToId(commentId);
    setComment(`@${authorName} `);
  };
  
  const cancelReply = () => {
    setIsReplying(false);
    setReplyToId(null);
    setComment("");
  };
  
  // Group comments by parent
  const parentComments = comments.filter(c => !c.parentCommentId);
  const childComments = comments.filter(c => c.parentCommentId);
  
  // Create a map of parent ID to child comments
  const commentReplies = new Map();
  childComments.forEach(comment => {
    const parentId = comment.parentCommentId!;
    if (!commentReplies.has(parentId)) {
      commentReplies.set(parentId, []);
    }
    commentReplies.get(parentId).push(comment);
  });
  
  const renderComment = (comment, isReply = false) => {
    const replies = commentReplies.get(comment.id) || [];
    const authorName = comment.author?.displayName || comment.author?.username;
    
    return (
      <div key={comment.id} className={`${isReply ? 'ml-10 border-l-2 border-muted pl-4' : 'mb-4'}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author?.avatarUrl || ""} />
            <AvatarFallback>
              {comment.author?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {authorName}
              <span className="font-normal text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm mt-1">{comment.content}</div>
            
            {isMember && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => startReply(comment.id, authorName)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>
        
        {replies.length > 0 && (
          <div className="mt-2 space-y-3">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="p-4">
      <h4 className="text-sm font-medium mb-4">Comments</h4>
      
      {isMember && (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            {isReplying && (
              <div className="text-xs bg-muted text-muted-foreground py-1 px-2 rounded-md flex items-center gap-1">
                Replying
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 ml-1" 
                  onClick={cancelReply}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[60px]"
            />
          </div>
          
          <div className="flex justify-end mt-2">
            {isReplying && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2" 
                onClick={cancelReply}
              >
                Cancel
              </Button>
            )}
            
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={!comment.trim() || createComment.isPending}
            >
              {createComment.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      )}
      
      {!isMember && (
        <div className="bg-muted/50 rounded-md p-3 mb-4 text-sm text-center">
          Join this community to participate in discussions.
        </div>
      )}
      
      {isLoadingComments ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No comments yet. Be the first to join the conversation!
        </div>
      ) : (
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4">
            {parentComments.map(comment => renderComment(comment))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};