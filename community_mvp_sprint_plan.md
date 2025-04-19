# Community MVP Sprint Plan
**Created: April 19, 2025 - 1:00 PM ET**

This document outlines the comprehensive sprint plan to complete all remaining Community MVP features following Framework 5.2 principles. Each feature has a dedicated sprint section with precise timestamps, scope, and verification points.

## Community MVP Feature Roadmap

| Sprint ID | Feature | Priority | Complexity | Duration | Status |
|-----------|---------|----------|------------|----------|--------|
| PKL-278651-COMM-0022-POST | Community Posts | Critical | Medium | 5 days | Planned |
| PKL-278651-COMM-0023-EVENT | Community Events | Critical | Medium | 5 days | Planned |
| PKL-278651-COMM-0024-MOD | Community Moderation | High | Medium | 4 days | Planned |
| PKL-278651-COMM-0025-DISC | Community Discovery | High | Low | 3 days | Planned |
| PKL-278651-COMM-0026-NOTIF | Community Notifications | Medium | Medium | 4 days | Planned |

## Sprint 1: Community Posts System
**Sprint ID: PKL-278651-COMM-0022-POST**
**Start Date/Time: April 21, 2025 - 9:00 AM ET**
**End Date/Time: April 25, 2025 - 5:00 PM ET**

### Pre-Implementation Analysis
**Timestamp: April 19, 2025 - 1:10 PM ET**

#### Related Files
| File Path | Purpose | Integration Points |
|-----------|---------|-------------------|
| shared/schema.ts | Database schema | Community posts tables & relationships |
| server/modules/community/post-service.ts | Post backend service | Community, User, and XP services |
| server/routes/community-routes.ts | API endpoints | Post service, Auth middleware |
| client/src/components/community/CommunityPosts.tsx | Posts UI component | Post API, Community context |
| client/src/components/post/PostCard.tsx | Post display | User info, Interaction features |
| client/src/components/post/CreatePostForm.tsx | Post creation form | Post API, Form validation |

#### Current Implementation Status
- Community posts table exists but may be missing interaction fields
- Post tab UI shell exists but functionality may be incomplete
- Post creation and interaction APIs may need implementation

### Implementation Plan

#### Day 1: Schema & Backend Foundation
**Timestamp: April 21, 2025 - 9:00 AM ET**

**Schema Updates**
```typescript
/**
 * [PKL-278651-COMM-0022-POST] Community Posts Schema
 * Implementation timestamp: 2025-04-21 09:15 ET
 * 
 * Ensures schema properly supports all post features.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing schema
 * - Maintains backward compatibility
 */
// In shared/schema.ts

// Ensure the posts table has all necessary fields
export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  title: varchar('title', { length: 255 }),
  mediaUrl: varchar('media_url', { length: 512 }),
  mediaType: varchar('media_type', { length: 50 }),
  isAnnouncement: boolean('is_announcement').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by').references(() => users.id),
});

// Post reactions (likes, etc)
export const postReactions = pgTable('post_reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => communityPosts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  reactionType: varchar('reaction_type', { length: 20 }).notNull(), // 'like', 'love', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Post comments
export const postComments = pgTable('post_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => communityPosts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  parentCommentId: integer('parent_comment_id').references(() => postComments.id),
});

// Create type definitions
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;
```

**Post Service Implementation**
```typescript
/**
 * [PKL-278651-COMM-0022-POST] Community Post Service
 * Implementation timestamp: 2025-04-21 11:00 ET
 * 
 * Core service for managing community posts.
 * 
 * Framework 5.2 compliance verified:
 * - Follows service pattern
 * - Clear interface and responsibilities
 */
// Create/update server/modules/community/post-service.ts

import { db } from '../../db';
import { communityPosts, postReactions, postComments, InsertCommunityPost } from '@shared/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';

export class PostService {
  /**
   * Create a new community post
   */
  async createPost(postData: InsertCommunityPost): Promise<number> {
    try {
      const [result] = await db.insert(communityPosts)
        .values(postData)
        .returning({ id: communityPosts.id });
      
      // Award XP for creating a post (if XP service is available)
      try {
        const xpService = await import('../xp/xp-service');
        await xpService.default.awardXp({
          userId: postData.userId,
          amount: 1,
          source: `community:${postData.communityId}:post`,
          details: `Created post in community ${postData.communityId}`,
          communityId: postData.communityId,
        });
      } catch (error) {
        console.error('[Community] Error awarding XP for post creation:', error);
        // Non-critical, continue without failing
      }
      
      return result.id;
    } catch (error) {
      console.error('[Community] Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }
  
  /**
   * Get posts for a community with pagination
   */
  async getCommunityPosts(communityId: number, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const posts = await db.select({
        id: communityPosts.id,
        communityId: communityPosts.communityId,
        userId: communityPosts.userId,
        content: communityPosts.content,
        title: communityPosts.title,
        mediaUrl: communityPosts.mediaUrl,
        mediaType: communityPosts.mediaType,
        isAnnouncement: communityPosts.isAnnouncement,
        isPinned: communityPosts.isPinned,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
      })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      )
      .orderBy(
        // Pinned posts first, then by creation date
        desc(communityPosts.isPinned),
        desc(communityPosts.createdAt)
      )
      .limit(limit)
      .offset(offset);
      
      // Get reaction counts for each post
      const postIds = posts.map(post => post.id);
      
      const reactionCounts = await db.select({
        postId: postReactions.postId,
        reactionType: postReactions.reactionType,
        count: sql`COUNT(*)`.as('count'),
      })
      .from(postReactions)
      .where(sql`${postReactions.postId} IN ${postIds}`)
      .groupBy(postReactions.postId, postReactions.reactionType);
      
      // Get comment counts for each post
      const commentCounts = await db.select({
        postId: postComments.postId,
        count: sql`COUNT(*)`.as('count'),
      })
      .from(postComments)
      .where(
        and(
          sql`${postComments.postId} IN ${postIds}`,
          eq(postComments.isDeleted, false)
        )
      )
      .groupBy(postComments.postId);
      
      // Calculate total posts for pagination
      const [{ count: totalPosts }] = await db.select({
        count: sql`COUNT(*)`.as('count'),
      })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      );
      
      // Combine the data
      const enrichedPosts = posts.map(post => {
        const reactions = reactionCounts
          .filter(r => r.postId === post.id)
          .reduce((acc, { reactionType, count }) => {
            acc[reactionType] = Number(count);
            return acc;
          }, {} as Record<string, number>);
        
        const commentCount = commentCounts.find(c => c.postId === post.id)?.count || 0;
        
        return {
          ...post,
          reactions,
          commentCount: Number(commentCount),
        };
      });
      
      return {
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          totalPosts: Number(totalPosts),
          totalPages: Math.ceil(Number(totalPosts) / limit),
        },
      };
    } catch (error) {
      console.error('[Community] Error getting community posts:', error);
      throw new Error('Failed to get community posts');
    }
  }
  
  // Additional methods to be implemented:
  // - updatePost
  // - deletePost
  // - addReaction
  // - removeReaction
  // - getPostComments
  // - addComment
  // - etc.
}

// Export singleton instance
export const postService = new PostService();
export default postService;
```

#### Day 2: API Endpoints & Backend Completion
**Timestamp: April 22, 2025 - 9:00 AM ET**

**API Endpoint Implementation**
```typescript
/**
 * [PKL-278651-COMM-0022-POST] Community Post API Routes
 * Implementation timestamp: 2025-04-22 09:15 ET
 * 
 * API endpoints for community post functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Follows API route patterns
 * - Clear error handling
 * - Proper authentication
 */
// Update server/routes/community-routes.ts

import { postService } from '../modules/community/post-service';
import { insertCommunityPostSchema } from '@shared/schema/validators';

// Add these routes to the existing community routes

/**
 * POST /api/communities/:communityId/posts
 * Create a new post in a community
 */
app.post('/api/communities/:communityId/posts', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;
    
    // Validate request body
    const postData = insertCommunityPostSchema.parse({
      ...req.body,
      communityId: parseInt(communityId, 10),
      userId,
    });
    
    // Create the post
    const postId = await postService.createPost(postData);
    
    // Log activity for community engagement
    try {
      await communityService.logMemberActivity({
        communityId: parseInt(communityId, 10),
        userId,
        activityType: 'post_create',
        entityId: postId,
      });
    } catch (error) {
      console.error('[API] Error logging member activity:', error);
      // Non-critical, continue without failing
    }
    
    res.status(201).json({ id: postId });
  } catch (error) {
    console.error('[API] Error creating community post:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid post data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * GET /api/communities/:communityId/posts
 * Get posts for a community
 */
app.get('/api/communities/:communityId/posts', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const result = await postService.getCommunityPosts(
      parseInt(communityId, 10),
      pageNum,
      limitNum
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[API] Error getting community posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

/**
 * POST /api/communities/posts/:postId/reactions
 * Add a reaction to a post
 */
app.post('/api/communities/posts/:postId/reactions', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user!.id;
    
    if (!reactionType || typeof reactionType !== 'string') {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    await postService.addReaction({
      postId: parseInt(postId, 10),
      userId,
      reactionType,
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Additional routes to be implemented:
// - DELETE /api/communities/posts/:postId/reactions
// - GET /api/communities/posts/:postId/comments
// - POST /api/communities/posts/:postId/comments
// - etc.
```

#### Day 3: Frontend Components (Part 1)
**Timestamp: April 23, 2025 - 9:00 AM ET**

**Post Creation Form**
```tsx
/**
 * [PKL-278651-COMM-0022-POST] Create Post Form
 * Implementation timestamp: 2025-04-23 09:15 ET
 * 
 * Component for creating new community posts.
 * 
 * Framework 5.2 compliance verified:
 * - Follows component patterns
 * - Uses React Hook Form with Zod validation
 * - Clear error handling and loading states
 */
// Create/update client/src/components/post/CreatePostForm.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertCommunityPostSchema } from '@/lib/validators/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { LoaderCircle } from 'lucide-react';

interface CreatePostFormProps {
  communityId: number;
  onSuccess?: () => void;
}

export function CreatePostForm({ communityId, onSuccess }: CreatePostFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  
  const form = useForm({
    resolver: zodResolver(insertCommunityPostSchema),
    defaultValues: {
      communityId,
      title: '',
      content: '',
    },
  });
  
  const createPost = useMutation({
    mutationFn: async (data: any) => {
      // Handle file upload if there's a media file
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        
        const uploadRes = await apiRequest('POST', '/api/upload', formData);
        if (!uploadRes.ok) {
          throw new Error('Failed to upload media');
        }
        
        const { url, fileType } = await uploadRes.json();
        data.mediaUrl = url;
        data.mediaType = fileType;
      }
      
      const res = await apiRequest('POST', `/api/communities/${communityId}/posts`, data);
      if (!res.ok) {
        throw new Error('Failed to create post');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      setMediaFile(null);
      
      // Show success toast
      toast({
        title: 'Post created',
        description: 'Your post has been successfully created.',
      });
      
      // Invalidate queries to refresh the posts list
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/posts`] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast({
        title: 'Failed to create post',
        description: 'There was an error creating your post. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = form.handleSubmit((data) => {
    createPost.mutate(data);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What's on your mind?"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Media (Optional)</FormLabel>
          <ImageUpload
            value={mediaFile ? URL.createObjectURL(mediaFile) : undefined}
            onChange={(file) => setMediaFile(file)}
            onRemove={() => setMediaFile(null)}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### Day 4: Frontend Components (Part 2)
**Timestamp: April 24, 2025 - 9:00 AM ET**

**Post List and Post Card**
```tsx
/**
 * [PKL-278651-COMM-0022-POST] Post Card Component
 * Implementation timestamp: 2025-04-24 09:15 ET
 * 
 * Component for displaying individual community posts.
 * 
 * Framework 5.2 compliance verified:
 * - Follows component patterns
 * - Self-contained with proper props
 */
// Create/update client/src/components/post/PostCard.tsx

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, ThumbsUp, Award } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: {
    id: number;
    title?: string;
    content: string;
    userId: number;
    communityId: number;
    mediaUrl?: string;
    mediaType?: string;
    createdAt: string;
    isAnnouncement?: boolean;
    isPinned?: boolean;
    user?: {
      username?: string;
      displayName?: string;
      profileImage?: string;
    };
    reactions: Record<string, number>;
    commentCount: number;
  };
  onCommentClick?: () => void;
}

export function PostCard({ post, onCommentClick }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const addReaction = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: number; reactionType: string }) => {
      const res = await apiRequest('POST', `/api/communities/posts/${postId}/reactions`, { reactionType });
      if (!res.ok) throw new Error('Failed to add reaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${post.communityId}/posts`] });
    },
  });
  
  const handleReaction = (reactionType: string) => {
    if (!user) return; // Require authentication
    addReaction.mutate({ postId: post.id, reactionType });
  };
  
  // Format created date
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(post.createdAt), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  }, [post.createdAt]);
  
  // Determine total reactions
  const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);
  
  // Handle media content
  const renderMedia = () => {
    if (!post.mediaUrl) return null;
    
    if (post.mediaType?.startsWith('image/')) {
      return (
        <div className="mt-4 relative rounded-md overflow-hidden">
          <img 
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full h-auto max-h-[400px] object-contain bg-muted"
          />
        </div>
      );
    }
    
    if (post.mediaType?.startsWith('video/')) {
      return (
        <div className="mt-4 rounded-md overflow-hidden">
          <video 
            src={post.mediaUrl}
            controls
            className="w-full h-auto max-h-[400px]"
          />
        </div>
      );
    }
    
    return (
      <div className="mt-4 p-4 border rounded-md bg-muted flex items-center gap-2">
        <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          View attachment
        </a>
      </div>
    );
  };
  
  return (
    <Card className={`mb-4 overflow-hidden ${post.isPinned ? 'border-primary/50' : ''}`}>
      {post.isPinned && (
        <div className="bg-primary/10 px-4 py-1 text-xs text-primary flex items-center">
          <Award className="w-3 h-3 mr-1" />
          Pinned post
        </div>
      )}
      
      <CardHeader className="p-4 pb-0 flex flex-row items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user?.profileImage} />
          <AvatarFallback>
            {post.user?.displayName?.[0] || post.user?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {post.user?.displayName || post.user?.username || `User #${post.userId}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <div className="p-2 text-sm">
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                    Report post
                  </button>
                  {user?.id === post.userId && (
                    <>
                      <button className="w-full text-left px-2 py-1.5 rounded hover:bg-accent">
                        Edit post
                      </button>
                      <button className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-destructive">
                        Delete post
                      </button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {post.isAnnouncement && (
            <Badge variant="secondary" className="mt-1">
              Announcement
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        {post.title && (
          <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        )}
        <p className="whitespace-pre-wrap">{post.content}</p>
        {renderMedia()}
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex flex-col">
        {/* Reaction count */}
        {totalReactions > 0 && (
          <div className="w-full px-2 py-1 text-xs text-muted-foreground flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            <span>{totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}</span>
            <span className="mx-2">•</span>
            <MessageCircle className="h-3 w-3 mr-1" />
            <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
          </div>
        )}
        
        <Separator className="my-1" />
        
        {/* Reaction buttons */}
        <div className="flex w-full">
          <Button 
            variant="ghost" 
            className="flex-1 flex items-center justify-center"
            onClick={() => handleReaction('like')}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Like
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex-1 flex items-center justify-center"
            onClick={onCommentClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

**Community Posts Component Update**
```tsx
/**
 * [PKL-278651-COMM-0022-POST] Community Posts Component
 * Implementation timestamp: 2025-04-24 11:00 ET
 * 
 * Component for displaying and managing community posts.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing component
 * - Handles loading and error states
 */
// Update client/src/components/community/CommunityPosts.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CreatePostForm } from '@/components/post/CreatePostForm';
import { PostCard } from '@/components/post/PostCard';
import { ChevronDown, Loader2 } from 'lucide-react';

interface CommunityPostsProps {
  communityId: number;
}

export function CommunityPosts({ communityId }: CommunityPostsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Fetch posts for this community
  const { 
    data, 
    isLoading, 
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useQuery({
    queryKey: [`/api/communities/${communityId}/posts`],
    queryFn: async () => {
      const url = `/api/communities/${communityId}/posts?page=${page}&limit=10`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
  });
  
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchNextPage();
  };
  
  if (isError) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">Failed to load posts. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Create post section */}
      {user ? (
        <Card className="p-4">
          {showCreateForm ? (
            <CreatePostForm 
              communityId={communityId}
              onSuccess={() => setShowCreateForm(false)}
            />
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 border rounded-md px-4 py-2 bg-muted/50 cursor-pointer" onClick={() => setShowCreateForm(true)}>
                <span className="text-muted-foreground">
                  Share something with the community...
                </span>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Post
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">
            Sign in to create posts and interact with the community.
          </p>
        </Card>
      )}
      
      {/* Posts list */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))
        ) : data?.posts?.length > 0 ? (
          <>
            {data.posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                onCommentClick={() => {
                  // TODO: Implement comment view/creation
                  toast({
                    title: 'Comments',
                    description: 'Comment functionality coming soon!',
                  });
                }}
              />
            ))}
            
            {/* Load more button */}
            {hasNextPage && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No posts yet. Be the first to post in this community!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
```

#### Day 5: Testing & Integration
**Timestamp: April 25, 2025 - 9:00 AM ET**

**Integration Testing Tasks:**
1. Test post creation with and without media
2. Test fetching posts with pagination
3. Test reactions (likes) functionality
4. Verify UI display for various post types
5. Test error states and loading states

**Final Schema & API Checks:**
- Verify all database relations
- Ensure proper error handling in API endpoints
- Check for authentication requirements
- Ensure XP integration is working

## Sprint 2: Community Events System
**Sprint ID: PKL-278651-COMM-0023-EVENT**
**Start Date/Time: April 28, 2025 - 9:00 AM ET**
**End Date/Time: May 2, 2025 - 5:00 PM ET**

### Pre-Implementation Analysis
**Timestamp: April 19, 2025 - 1:40 PM ET**

#### Related Files
| File Path | Purpose | Integration Points |
|-----------|---------|-------------------|
| shared/schema.ts | Database schema | Community events tables & relationships |
| server/modules/community/event-service.ts | Event backend service | Community, User services |
| server/routes/community-routes.ts | API endpoints | Event service, Auth middleware |
| client/src/components/community/CommunityEvents.tsx | Events UI component | Event API, Community context |
| client/src/components/event/EventCard.tsx | Event display | User info, RSVP features |
| client/src/components/event/CreateEventForm.tsx | Event creation form | Events API, Form validation |

### Implementation Plan

#### Day 1: Schema & Backend Foundation
**Timestamp: April 28, 2025 - 9:00 AM ET**

**Schema Updates**
```typescript
/**
 * [PKL-278651-COMM-0023-EVENT] Community Events Schema
 * Implementation timestamp: 2025-04-28 09:15 ET
 * 
 * Ensures schema properly supports all event features.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing schema
 * - Maintains backward compatibility
 */
// In shared/schema.ts

// Community events
export const communityEvents = pgTable('community_events', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: varchar('location', { length: 255 }),
  virtualMeetingUrl: varchar('virtual_meeting_url', { length: 512 }),
  isVirtual: boolean('is_virtual').default(false).notNull(),
  maxAttendees: integer('max_attendees'),
  coverImageUrl: varchar('cover_image_url', { length: 512 }),
  eventType: varchar('event_type', { length: 50 }).default('social').notNull(), // social, tournament, practice, etc.
  skillLevel: varchar('skill_level', { length: 50 }), // beginner, intermediate, advanced, all
  status: varchar('status', { length: 20 }).default('upcoming').notNull(), // upcoming, ongoing, completed, canceled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

// Event RSVPs
export const eventRsvps = pgTable('event_rsvps', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => communityEvents.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).notNull(), // attending, maybe, declined
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  checkedIn: boolean('checked_in').default(false).notNull(),
  checkedInAt: timestamp('checked_in_at'),
});

// Create type definitions
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = typeof communityEvents.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;
```

**Events Service Implementation**
```typescript
/**
 * [PKL-278651-COMM-0023-EVENT] Community Event Service
 * Implementation timestamp: 2025-04-28 11:00 ET
 * 
 * Core service for managing community events.
 * 
 * Framework 5.2 compliance verified:
 * - Follows service pattern
 * - Clear interface and responsibilities
 */
// Create/update server/modules/community/event-service.ts

import { db } from '../../db';
import { communityEvents, eventRsvps, InsertCommunityEvent, InsertEventRsvp } from '@shared/schema';
import { eq, and, gte, lt, desc, sql, isNull } from 'drizzle-orm';

export class EventService {
  /**
   * Create a new community event
   */
  async createEvent(eventData: InsertCommunityEvent): Promise<number> {
    try {
      const [result] = await db.insert(communityEvents)
        .values(eventData)
        .returning({ id: communityEvents.id });
      
      // Award XP for creating an event (if XP service is available)
      try {
        const xpService = await import('../xp/xp-service');
        await xpService.default.awardXp({
          userId: eventData.creatorId,
          amount: 3,
          source: `community:${eventData.communityId}:event:create`,
          details: `Created event "${eventData.title}" in community ${eventData.communityId}`,
          communityId: eventData.communityId,
        });
      } catch (error) {
        console.error('[Community] Error awarding XP for event creation:', error);
        // Non-critical, continue without failing
      }
      
      return result.id;
    } catch (error) {
      console.error('[Community] Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }
  
  /**
   * Get events for a community with filtering and pagination
   */
  async getCommunityEvents(
    communityId: number, 
    filters: {
      status?: string; // upcoming, ongoing, completed, canceled
      eventType?: string;
      skillLevel?: string;
      timeframe?: 'past' | 'future' | 'all';
    } = {},
    page = 1, 
    limit = 10
  ) {
    try {
      const offset = (page - 1) * limit;
      const now = new Date();
      
      // Build the where clause
      let whereConditions = [
        eq(communityEvents.communityId, communityId),
        eq(communityEvents.isDeleted, false)
      ];
      
      // Add filters
      if (filters.status) {
        whereConditions.push(eq(communityEvents.status, filters.status));
      }
      
      if (filters.eventType) {
        whereConditions.push(eq(communityEvents.eventType, filters.eventType));
      }
      
      if (filters.skillLevel) {
        whereConditions.push(eq(communityEvents.skillLevel, filters.skillLevel));
      }
      
      if (filters.timeframe === 'past') {
        whereConditions.push(lt(communityEvents.startDate, now));
      } else if (filters.timeframe === 'future') {
        whereConditions.push(gte(communityEvents.startDate, now));
      }
      
      // Execute the query
      const events = await db.select()
        .from(communityEvents)
        .where(and(...whereConditions))
        .orderBy(
          // Upcoming events first, then by start date
          desc(sql`CASE WHEN ${communityEvents.startDate} >= NOW() THEN 1 ELSE 0 END`),
          communityEvents.startDate
        )
        .limit(limit)
        .offset(offset);
      
      // Get RSVP counts for each event
      const eventIds = events.map(event => event.id);
      
      const rsvpCounts = await db.select({
        eventId: eventRsvps.eventId,
        status: eventRsvps.status,
        count: sql`COUNT(*)`.as('count'),
      })
      .from(eventRsvps)
      .where(sql`${eventRsvps.eventId} IN ${eventIds}`)
      .groupBy(eventRsvps.eventId, eventRsvps.status);
      
      // Calculate total events for pagination
      const [{ count: totalEvents }] = await db.select({
        count: sql`COUNT(*)`.as('count'),
      })
      .from(communityEvents)
      .where(and(...whereConditions));
      
      // Combine the data
      const enrichedEvents = events.map(event => {
        const rsvps = rsvpCounts
          .filter(r => r.eventId === event.id)
          .reduce((acc, { status, count }) => {
            acc[status] = Number(count);
            return acc;
          }, {} as Record<string, number>);
        
        const attendeeCount = rsvps['attending'] || 0;
        const maybeCount = rsvps['maybe'] || 0;
        const declinedCount = rsvps['declined'] || 0;
        
        return {
          ...event,
          rsvpCounts: {
            attending: attendeeCount,
            maybe: maybeCount,
            declined: declinedCount,
            total: attendeeCount + maybeCount + declinedCount,
          },
          isFull: event.maxAttendees ? attendeeCount >= event.maxAttendees : false,
        };
      });
      
      return {
        events: enrichedEvents,
        pagination: {
          page,
          limit,
          totalEvents: Number(totalEvents),
          totalPages: Math.ceil(Number(totalEvents) / limit),
        },
      };
    } catch (error) {
      console.error('[Community] Error getting community events:', error);
      throw new Error('Failed to get community events');
    }
  }
  
  /**
   * Respond to an event (RSVP)
   */
  async respondToEvent(rsvpData: InsertEventRsvp): Promise<boolean> {
    try {
      // Check if user already has an RSVP
      const existingRsvp = await db.select()
        .from(eventRsvps)
        .where(
          and(
            eq(eventRsvps.eventId, rsvpData.eventId),
            eq(eventRsvps.userId, rsvpData.userId)
          )
        )
        .limit(1);
      
      if (existingRsvp.length > 0) {
        // Update existing RSVP
        await db.update(eventRsvps)
          .set({
            status: rsvpData.status,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(eventRsvps.eventId, rsvpData.eventId),
              eq(eventRsvps.userId, rsvpData.userId)
            )
          );
      } else {
        // Create new RSVP
        await db.insert(eventRsvps)
          .values(rsvpData);
        
        // Award XP for RSVPing (if XP service is available and only if attending)
        if (rsvpData.status === 'attending') {
          try {
            // Get event data for XP award
            const [event] = await db.select({
              communityId: communityEvents.communityId,
              title: communityEvents.title,
            })
            .from(communityEvents)
            .where(eq(communityEvents.id, rsvpData.eventId))
            .limit(1);
            
            if (event) {
              const xpService = await import('../xp/xp-service');
              await xpService.default.awardXp({
                userId: rsvpData.userId,
                amount: 1,
                source: `community:${event.communityId}:event:rsvp`,
                details: `RSVP'd to event "${event.title}" in community ${event.communityId}`,
                communityId: event.communityId,
              });
            }
          } catch (error) {
            console.error('[Community] Error awarding XP for event RSVP:', error);
            // Non-critical, continue without failing
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('[Community] Error responding to event:', error);
      throw new Error('Failed to respond to event');
    }
  }
  
  // Additional methods to be implemented:
  // - getUserEventRsvp
  // - updateEvent
  // - cancelEvent
  // - checkInUser
  // - getEventAttendees
  // - etc.
}

// Export singleton instance
export const eventService = new EventService();
export default eventService;
```

#### Days 2-5: API and Frontend Implementation

The implementation will continue with:

1. **API Endpoints for Events**
   - POST /api/communities/:communityId/events (Create event)
   - GET /api/communities/:communityId/events (List events)
   - POST /api/events/:eventId/rsvp (RSVP to event)
   - GET /api/events/:eventId (Get event details)

2. **Frontend Components**
   - CreateEventForm (Form for creating new events)
   - EventCard (Display individual events)
   - EventDetails (Detailed view of an event)
   - CommunityEvents (Main component for event listing)

## Sprint 3: Community Moderation Tools
**Sprint ID: PKL-278651-COMM-0024-MOD**
**Start Date/Time: May 5, 2025 - 9:00 AM ET**
**End Date/Time: May 8, 2025 - 5:00 PM ET**

### Key Features to Implement

1. **Content Moderation**
   - Post/comment reporting system
   - Moderation queue for community admins
   - Content removal capabilities
   - User muting/banning within communities

2. **Role Management**
   - Community admin/moderator roles
   - Role assignment and permissions
   - Moderation activity logging

## Sprint 4: Community Discovery
**Sprint ID: PKL-278651-COMM-0025-DISC**
**Start Date/Time: May 9, 2025 - 9:00 AM ET**
**End Date/Time: May 13, 2025 - 5:00 PM ET**

### Key Features to Implement

1. **Community Search & Browse**
   - Search functionality with filtering
   - Category-based browsing
   - Trending communities section

2. **Community Recommendations**
   - Personalized recommendations based on user interests
   - Similar communities suggestions
   - Onboarding community discovery flow

## Sprint 5: Community Notifications
**Sprint ID: PKL-278651-COMM-0026-NOTIF**
**Start Date/Time: May 14, 2025 - 9:00 AM ET**
**End Date/Time: May 17, 2025 - 5:00 PM ET**

### Key Features to Implement

1. **In-App Notifications**
   - New post notifications 
   - Event reminders
   - @mention notifications
   - Activity digest

2. **Email Notifications**
   - Email templates for community activities
   - Notification preferences management
   - Weekly digests

## Integration Testing & Validation
**Start Date/Time: May 19, 2025 - 9:00 AM ET**
**End Date/Time: May 21, 2025 - 5:00 PM ET**

**Key Validation Steps:**
1. End-to-end community feature testing
2. Performance testing with simulated load
3. User experience flows validation
4. Edge case handling

## Community MVP Success Criteria

A successful Community MVP implementation will be measured by:

1. **Core Functionality Completeness**
   - Post creation, viewing, and interaction
   - Event creation, RSVPs, and management
   - Community discovery and joining
   - Basic moderation capabilities

2. **User Experience Quality**
   - Smooth, intuitive community interactions
   - Clear navigation and discovery
   - Responsive interface across devices
   - Fast, reliable performance

3. **Integration with Platform**
   - XP system integration for community activities
   - Proper user profile integration
   - Consistent design language with the platform

4. **Technical Quality**
   - Framework 5.2 compliance
   - Clear, maintainable code structure
   - Robust error handling
   - Scalable architecture