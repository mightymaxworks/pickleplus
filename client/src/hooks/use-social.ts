/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Hooks
 * 
 * React Query hooks for social features
 * Part of Sprint 5: Social Features & UI Polish
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as socialApi from "@/lib/api/social";
import { useToast } from "@/hooks/use-toast";
import { SharedContent, ContentComment, ContentReaction, CoachingRecommendation, UserConnectionRequest, UserConnection } from "@/types/social";

// === Content Feed ===

export function useContentFeed(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["/api/social/feed/content", options],
    queryFn: () => socialApi.getContentFeed(options),
  });
}

export function useContentById(id: number) {
  return useQuery({
    queryKey: ["/api/social/content", id],
    queryFn: () => socialApi.getContentById(id),
    enabled: !!id,
  });
}

export function useUserSharedContent(userId: number, options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["/api/social/content/user", userId, options],
    queryFn: () => socialApi.getUserSharedContent(userId, options),
    enabled: !!userId,
  });
}

export function useShareContentMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.shareContent,
    onSuccess: (data: SharedContent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content/user"] });
      
      toast({
        title: "Content shared",
        description: "Your content has been shared successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContentMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      socialApi.updateContent(id, updates),
    onSuccess: (data: SharedContent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content/user"] });
      
      toast({
        title: "Content updated",
        description: "Your content has been updated successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContentMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.deleteContent,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content/user"] });
      
      toast({
        title: "Content removed",
        description: "Your content has been removed successfully.",
      });
      
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Reactions ===

export function useContentReactions(contentId: number) {
  return useQuery({
    queryKey: ["/api/social/content", contentId, "reactions"],
    queryFn: () => socialApi.getContentReactions(contentId),
    enabled: !!contentId,
  });
}

export function useHasUserReacted(contentId: number, reactionType: string) {
  return useQuery({
    queryKey: ["/api/social/content", contentId, "reactions", reactionType, "check"],
    queryFn: () => socialApi.hasUserReacted(contentId, reactionType),
    enabled: !!contentId && !!reactionType,
  });
}

export function useAddReactionMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, reactionType }: { contentId: number; reactionType: string }) => 
      socialApi.addReaction(contentId, reactionType),
    onSuccess: (_, { contentId, reactionType }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId, "reactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId, "reactions", reactionType, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId] });
      
      return true;
    },
  });
}

export function useRemoveReactionMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, reactionType }: { contentId: number; reactionType: string }) => 
      socialApi.removeReaction(contentId, reactionType),
    onSuccess: (_, { contentId, reactionType }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId, "reactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId, "reactions", reactionType, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", contentId] });
      
      return true;
    },
  });
}

// === Comments ===

export function useContentComments(contentId: number, options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["/api/social/content", contentId, "comments", options],
    queryFn: () => socialApi.getContentComments(contentId, options),
    enabled: !!contentId,
  });
}

export function useCommentReplies(commentId: number) {
  return useQuery({
    queryKey: ["/api/social/comments", commentId, "replies"],
    queryFn: () => socialApi.getCommentReplies(commentId),
    enabled: !!commentId,
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ contentId, text, parentCommentId }: 
      { contentId: number; text: string; parentCommentId?: number }) => 
      socialApi.addComment(contentId, text, parentCommentId),
    onSuccess: (data: ContentComment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", data.contentId, "comments"] });
      if (data.parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/social/comments", data.parentCommentId, "replies"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", data.contentId] });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Recommendations ===

export function useReceivedRecommendations() {
  return useQuery({
    queryKey: ["/api/social/recommendations/received"],
    queryFn: socialApi.getReceivedRecommendations,
  });
}

export function useSentRecommendations() {
  return useQuery({
    queryKey: ["/api/social/recommendations/sent"],
    queryFn: socialApi.getSentRecommendations,
  });
}

export function useCreateRecommendationMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.createRecommendation,
    onSuccess: (data: CoachingRecommendation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/recommendations/sent"] });
      
      toast({
        title: "Recommendation sent",
        description: "Your recommendation has been sent successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRecommendationStatusMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, status, feedbackRating, feedbackComment }: 
      { id: number; status: string; feedbackRating?: number; feedbackComment?: string }) => 
      socialApi.updateRecommendationStatus(id, status, feedbackRating, feedbackComment),
    onSuccess: (data: CoachingRecommendation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/recommendations/received"] });
      
      const statusText = data.status === 'accepted' ? 'accepted' : 
                         data.status === 'declined' ? 'declined' : 
                         data.status === 'completed' ? 'completed' : 'updated';
      
      toast({
        title: `Recommendation ${statusText}`,
        description: `The recommendation has been ${statusText} successfully.`,
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === User Connections ===

export function useUserConnections() {
  return useQuery({
    queryKey: ["/api/social/connections"],
    queryFn: socialApi.getUserConnections,
  });
}

export function usePendingConnectionRequests() {
  return useQuery({
    queryKey: ["/api/social/connections/requests/pending"],
    queryFn: socialApi.getPendingConnectionRequests,
  });
}

export function useRequestConnectionMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ toUserId, connectionType, message }: 
      { toUserId: number; connectionType: string; message?: string }) => 
      socialApi.requestConnection(toUserId, connectionType, message),
    onSuccess: (data: UserConnectionRequest) => {
      toast({
        title: "Connection requested",
        description: "Your connection request has been sent successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAcceptConnectionRequestMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.acceptConnectionRequest,
    onSuccess: (data: UserConnection[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections/requests/pending"] });
      
      toast({
        title: "Connection accepted",
        description: "The connection request has been accepted successfully.",
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeclineConnectionRequestMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.declineConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections/requests/pending"] });
      
      toast({
        title: "Connection declined",
        description: "The connection request has been declined.",
      });
      
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to decline connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRemoveConnectionMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: socialApi.removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections"] });
      
      toast({
        title: "Connection removed",
        description: "The connection has been removed successfully.",
      });
      
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}