/**
 * PKL-278651-COMM-0022-POST - Post List Component
 * Implementation timestamp: 2025-04-21 00:50 ET
 * 
 * Component for displaying list of community posts
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./PostCard";
import { CreatePostForm } from "./CreatePostForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface PostListProps {
  communityId: number;
}

type SortOption = "newest" | "popular" | "trending";
type FilterOption = "all" | "announcements" | "pinned" | "media";

export function PostList({ communityId }: PostListProps) {
  const { user } = useAuth();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [activePost, setActivePost] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  
  // Fetch posts for this community
  const { 
    data: posts, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/communities', communityId, 'posts', { sort: sortBy, filter: filterBy }],
    queryFn: async () => {
      // Construct the URL with query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('sort', sortBy);
      queryParams.append('filter', filterBy);
      
      const response = await fetch(`/api/communities/${communityId}/posts?${queryParams.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      return response.json();
    },
  });
  
  // Handle create post submission success
  const handlePostCreated = () => {
    setIsCreatingPost(false);
    // Refetch posts to show the new one
    queryClient.invalidateQueries({ 
      queryKey: ['/api/communities', communityId, 'posts']
    });
  };
  
  // Handle post comment click
  const handlePostCommentClick = (postId: number) => {
    setActivePost(activePost === postId ? null : postId);
  };
  
  // Check if user is a member and can post
  const canCreatePost = user && user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Community Posts</h2>
        
        {/* Post actions button */}
        {canCreatePost && !isCreatingPost && (
          <Button 
            onClick={() => setIsCreatingPost(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        )}
      </div>
      
      {/* Create post form */}
      {isCreatingPost && (
        <div className="mb-6">
          <CreatePostForm
            communityId={communityId}
            onSuccess={handlePostCreated}
            onCancel={() => setIsCreatingPost(false)}
          />
        </div>
      )}
      
      {/* Post filtering and sorting */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          defaultValue="all" 
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as FilterOption)}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Posts list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading posts...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto" />
            <p className="mt-4">
              Error loading posts: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-lg mb-2">No posts found</p>
            <p className="text-muted-foreground">
              {filterBy !== "all" 
                ? "Try changing the filter or be the first to create a post!"
                : "Be the first to create a post in this community!"}
            </p>
            {canCreatePost && !isCreatingPost && (
              <Button 
                className="mt-4 gap-2"
                onClick={() => setIsCreatingPost(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Create Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onCommentClick={() => handlePostCommentClick(post.id)}
                showComments={activePost === post.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostList;