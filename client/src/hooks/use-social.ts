/**
 * PKL-278651-SAGE-0011-SOCIAL - Social React Query Hooks
 * 
 * This file provides React Query hooks for social content features
 * Part of Sprint 5: Social Features & UI Polish
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as socialApi from "@/lib/api/social";
import { queryClient } from "@/lib/queryClient";
import { 
  SharedContent, ContentComment, ContentReaction, 
  ShareContentRequest, AddReactionRequest, AddCommentRequest, ReportContentRequest,
  ContentFeedParams
} from "@/types/social";

// Content Feed Query
export function useContentFeed(params?: ContentFeedParams) {
  return useQuery<SharedContent[], Error>({
    queryKey: ["social", "feed", params],
    queryFn: () => socialApi.getContentFeed(params),
  });
}

// Content Detail Query
export function useContentDetail(contentId: number) {
  return useQuery<SharedContent, Error>({
    queryKey: ["social", "content", contentId],
    queryFn: () => socialApi.getContentById(contentId),
    enabled: !!contentId,
  });
}

// Content Comments Query
export function useContentComments(contentId: number) {
  return useQuery<ContentComment[], Error>({
    queryKey: ["social", "comments", contentId],
    queryFn: () => socialApi.getContentComments(contentId),
    enabled: !!contentId,
  });
}

// Content Reactions Query
export function useContentReactions(contentId: number) {
  return useQuery<ContentReaction[], Error>({
    queryKey: ["social", "reactions", contentId],
    queryFn: () => socialApi.getContentReactions(contentId),
    enabled: !!contentId,
  });
}

// Share Content Mutation
export function useShareContentMutation() {
  return useMutation({
    mutationFn: (data: ShareContentRequest) => socialApi.shareContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Update Content Mutation
export function useUpdateContentMutation() {
  return useMutation({
    mutationFn: ({ contentId, data }: { contentId: number; data: Partial<ShareContentRequest> }) => 
      socialApi.updateContent(contentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["social", "content", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Delete Content Mutation
export function useDeleteContentMutation() {
  return useMutation({
    mutationFn: (contentId: number) => socialApi.deleteContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Add Reaction Mutation
export function useAddReactionMutation() {
  return useMutation({
    mutationFn: (data: AddReactionRequest) => socialApi.addReaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["social", "reactions", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "content", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Remove Reaction Mutation
export function useRemoveReactionMutation() {
  return useMutation({
    mutationFn: (data: AddReactionRequest) => socialApi.removeReaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["social", "reactions", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "content", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Add Comment Mutation
export function useAddCommentMutation() {
  return useMutation({
    mutationFn: (data: AddCommentRequest) => socialApi.addComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["social", "comments", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "content", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

// Report Content Mutation
export function useReportContentMutation() {
  return useMutation({
    mutationFn: (data: ReportContentRequest) => socialApi.reportContent(data),
  });
}