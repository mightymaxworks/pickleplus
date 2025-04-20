/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management Hook
 * 
 * Custom hook for managing community media uploads, listings, and operations.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/lib/api/community/media-service";
import { communityKeys } from "@/lib/api/community/keys";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MediaType, GalleryPrivacyLevel } from "@shared/schema/media";

export type MediaFilter = {
  mediaType?: MediaType;
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest" | "featured";
};

export const useMedia = (communityId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<MediaFilter>({
    limit: 20,
    offset: 0,
    sort: "newest",
  });

  // Get media with filtering
  const {
    data: media,
    isLoading: isLoadingMedia,
    error: mediaError,
    refetch: refetchMedia,
  } = useQuery({
    queryKey: [...communityKeys.media(communityId), filter],
    queryFn: () => mediaService.getMedia(communityId, filter),
    enabled: !!communityId,
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return mediaService.uploadMedia(communityId, formData);
    },
    onSuccess: () => {
      toast({
        title: "Media uploaded",
        description: "Your media has been uploaded successfully.",
      });
      // Invalidate media cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: communityKeys.media(communityId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: number) => {
      return mediaService.deleteMedia(communityId, mediaId);
    },
    onSuccess: () => {
      toast({
        title: "Media deleted",
        description: "The media has been deleted successfully.",
      });
      // Invalidate media cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: communityKeys.media(communityId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete media. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: (galleryData: { title: string; description?: string; privacyLevel?: GalleryPrivacyLevel; communityId: number; coverMediaId?: number; eventId?: number }) => {
      return mediaService.createGallery(communityId, {
        title: galleryData.title,
        description: galleryData.description,
        privacyLevel: galleryData.privacyLevel,
        coverMediaId: galleryData.coverMediaId,
        eventId: galleryData.eventId
      });
    },
    onSuccess: () => {
      // Invalidate galleries cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: communityKeys.galleries(communityId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gallery creation failed",
        description: error.message || "Failed to create gallery. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update gallery mutation
  const updateGalleryMutation = useMutation({
    mutationFn: (params: { 
      galleryId: number; 
      data: { 
        title: string; 
        description?: string; 
        privacyLevel?: string; 
        communityId: number;
        coverMediaId?: number;
        eventId?: number;
      } 
    }) => {
      return mediaService.updateGallery(
        communityId, 
        params.galleryId, 
        {
          title: params.data.title,
          description: params.data.description,
          privacyLevel: params.data.privacyLevel,
          coverMediaId: params.data.coverMediaId,
          eventId: params.data.eventId
        }
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate specific gallery and galleries list
      queryClient.invalidateQueries({
        queryKey: communityKeys.gallery(communityId, variables.galleryId),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.galleries(communityId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gallery update failed",
        description: error.message || "Failed to update gallery. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete gallery mutation
  const deleteGalleryMutation = useMutation({
    mutationFn: (galleryId: number) => {
      return mediaService.deleteGallery(communityId, galleryId);
    },
    onSuccess: () => {
      // Invalidate galleries cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: communityKeys.galleries(communityId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gallery deletion failed",
        description: error.message || "Failed to delete gallery. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Gallery queries
  const {
    data: galleries,
    isLoading: isLoadingGalleries,
    error: galleriesError,
  } = useQuery({
    queryKey: communityKeys.galleries(communityId),
    queryFn: () => mediaService.getGalleries(communityId),
    enabled: !!communityId,
  });

  // Add media to gallery mutation
  const addToGalleryMutation = useMutation({
    mutationFn: (params: { galleryId: number; mediaId: number; displayOrder?: number; caption?: string }) => {
      return mediaService.addMediaToGallery(
        communityId,
        params.galleryId,
        {
          mediaId: params.mediaId,
          displayOrder: params.displayOrder,
          caption: params.caption,
        }
      );
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Media added to gallery",
        description: "The media has been added to the gallery successfully.",
      });
      // Invalidate specific gallery to refresh its media items
      queryClient.invalidateQueries({
        queryKey: communityKeys.gallery(communityId, variables.galleryId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to gallery",
        description: error.message || "Failed to add media to gallery. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Utility function to handle file upload
  const handleFileUpload = async (files: FileList | null, extraData?: Record<string, string>) => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // Append all files
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    
    // Append extra data if provided
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // Execute the upload mutation
    await uploadMediaMutation.mutateAsync(formData);
  };

  // Remove media from gallery mutation
  const removeFromGalleryMutation = useMutation({
    mutationFn: (params: { galleryId: number; mediaId: number }) => {
      return mediaService.removeMediaFromGallery(
        communityId,
        params.galleryId,
        params.mediaId
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate specific gallery to refresh its media items
      queryClient.invalidateQueries({
        queryKey: communityKeys.gallery(communityId, variables.galleryId),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from gallery",
        description: error.message || "Failed to remove media from gallery. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    // Media data and state
    media,
    isLoadingMedia,
    mediaError,
    refetchMedia,
    filter,
    setFilter,
    
    // Galleries data and state
    galleries,
    isLoadingGalleries,
    galleriesError,
    
    // Mutations
    uploadMediaMutation,
    deleteMediaMutation,
    createGalleryMutation,
    updateGalleryMutation,
    deleteGalleryMutation,
    addToGalleryMutation,
    removeFromGalleryMutation,
    
    // Helper functions
    handleFileUpload,
  };
};