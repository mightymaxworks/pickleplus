/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Posts List Component
 * 
 * This component displays a list of posts for a community with like and comment functionality.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PostCommentSection } from './PostCommentSection';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  ThumbsUp,
  Image as ImageIcon,
  Pin
} from 'lucide-react';
import { CommunityPost } from '@/lib/api/community';

interface CommunityPostsListProps {
  posts: CommunityPost[];
  isLoading: boolean;
  isMember: boolean;
}

export const CommunityPostsList = ({ posts, isLoading, isMember }: CommunityPostsListProps) => {
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Like post mutation
  const likePost = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('/api/communities/posts/' + postId + '/like', {
        method: 'POST',
      });
    },
    onSuccess: (_, postId) => {
      // Find the post in the community
      const communityId = posts.find(post => post.id === postId)?.communityId;
      
      // Invalidate queries
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: ['/api/communities/' + communityId + '/posts'] });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to like the post. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle like post
  const handleLikePost = (post: CommunityPost) => {
    if (!isMember) {
      toast({
        title: 'Member-only Action',
        description: 'Please join the community to like posts.',
        variant: 'default',
      });
      return;
    }
    
    likePost.mutate(post.id);
  };
  
  // Toggle comments
  const toggleComments = (postId: number) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-40 w-full mt-4" />
            </CardContent>
            <CardFooter>
              <div className="flex gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            There are no posts in this community yet. Be the first to share something!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className={post.isPinned ? "border-primary/50" : ""}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.avatarUrl || ""} />
                <AvatarFallback>{post.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                    <CardDescription>
                      Posted by {post.user?.username || "Unknown"} • {formatDistanceToNow(new Date(post.createdAt))} ago
                    </CardDescription>
                  </div>
                  {post.isPinned && (
                    <div className="flex items-center text-muted-foreground">
                      <Pin className="h-4 w-4 mr-1" />
                      <span className="text-xs">Pinned</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{post.content}</p>
            </div>
            
            {post.imageUrl && (
              <div className="mt-4 rounded-md overflow-hidden max-h-80">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                  }}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleLikePost(post)}
                  disabled={likePost.isPending}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-primary' : ''}`} />
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
              </div>
              
              {post.imageUrl && (
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Has Image</span>
                </Button>
              )}
            </div>
            
            {expandedPostId === post.id && (
              <div className="w-full border-t pt-4">
                <PostCommentSection 
                  postId={post.id} 
                  isMember={isMember} 
                />
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};