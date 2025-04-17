/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Post Comment Section Component
 * 
 * This component displays and manages comments for a community post.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { ReplyIcon, ThumbsUp } from 'lucide-react';

interface PostCommentSectionProps {
  postId: number;
  isMember: boolean;
}

interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  likeCount: number;
  replies?: Comment[];
}

export const PostCommentSection = ({ postId, isMember }: PostCommentSectionProps) => {
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/communities/posts/' + postId + '/comments'],
    queryFn: async () => {
      const response = await apiRequest('/api/communities/posts/' + postId + '/comments');
      return response as Comment[];
    },
    enabled: !!postId,
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/communities/posts/' + postId + '/comments', {
        method: 'POST',
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/posts/' + postId + '/comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      setCommentText('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Add reply mutation
  const addReply = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      return apiRequest('/api/communities/posts/' + postId + '/comments/' + commentId + '/replies', {
        method: 'POST',
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/posts/' + postId + '/comments'] });
      setReplyToId(null);
      setReplyText('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add reply. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(commentText);
  };

  const handleAddReply = (commentId: number) => {
    if (!replyText.trim()) return;
    addReply.mutate({ commentId, content: replyText });
  };

  // Render each comment
  const renderComment = (comment: Comment) => {
    return (
      <div key={comment.id} className="mb-4 last:mb-0">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user?.avatarUrl || ""} />
            <AvatarFallback>{comment.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted p-3 rounded-lg">
              <div className="font-medium text-sm">{comment.user?.username}</div>
              <div className="text-sm mt-1">{comment.content}</div>
            </div>
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
              >
                <ReplyIcon className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {comment.likeCount || 0}
              </Button>
            </div>

            {/* Reply form */}
            {replyToId === comment.id && isMember && (
              <div className="mt-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-0 h-20 text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setReplyToId(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={addReply.isPending || !replyText.trim()}
                  >
                    {addReply.isPending ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-6 mt-2 space-y-3">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.user?.avatarUrl || ""} />
                      <AvatarFallback>{reply.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-2 rounded-lg">
                        <div className="font-medium text-xs">{reply.user?.username}</div>
                        <div className="text-xs mt-0.5">{reply.content}</div>
                      </div>
                      <div className="flex gap-4 mt-0.5 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="flex gap-2 mt-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment input */}
      {isMember && (
        <div className="mb-4">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-0 h-24"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleAddComment}
              disabled={addComment.isPending || !commentText.trim()}
            >
              {addComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(renderComment)}
        </div>
      )}
    </div>
  );
};