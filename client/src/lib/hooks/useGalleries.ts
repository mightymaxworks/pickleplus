/**
 * PKL-278651-COMM-0036-MEDIA-GALLERY
 * Galleries Hook
 * 
 * Provides data access and operations for community media galleries
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export interface Gallery {
  id: number;
  name: string;
  description: string | null;
  communityId: number;
  coverImageUrl: string | null;
  isPrivate: boolean;
  sortOrder: number;
  createdAt: string;
  createdByUserId: number;
}

export interface GalleryWithMedia extends Gallery {
  media: Media[];
}

export interface Media {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  thumbnailPath: string | null;
  mediaType: string;
  tags: string[];
  fileSizeBytes: number;
  displayOrder: number;
  caption: string | null;
}

export interface CreateGalleryData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  sortOrder?: number;
}

export interface UpdateGalleryData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  sortOrder?: number;
}

export interface GalleryItemData {
  galleryId: number;
  mediaId: number;
  displayOrder?: number;
  caption?: string;
}

export function useGalleries(communityId: number) {
  // Get all galleries for a community
  return useQuery<Gallery[]>({
    queryKey: [`/api/community/${communityId}/galleries`],
    enabled: !!communityId
  });
}

export function useGallery(communityId: number, galleryId: number | null) {
  // Get a specific gallery with its media items
  return useQuery<GalleryWithMedia>({
    queryKey: [`/api/community/${communityId}/galleries/${galleryId}`],
    enabled: !!communityId && !!galleryId
  });
}

export function useGalleryMutations(communityId: number) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Create a new gallery
  const createGalleryMutation = useMutation({
    mutationFn: async (data: CreateGalleryData) => {
      const res = await apiRequest('POST', `/api/community/${communityId}/galleries`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate galleries list
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries`] });
      
      toast({
        title: "Gallery created",
        description: "Your gallery has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update an existing gallery
  const updateGalleryMutation = useMutation({
    mutationFn: async ({ galleryId, data }: { galleryId: number, data: UpdateGalleryData }) => {
      setIsUpdating(true);
      const res = await apiRequest('PATCH', `/api/community/${communityId}/galleries/${galleryId}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      setIsUpdating(false);
      
      // Invalidate specific gallery and galleries list
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries/${variables.galleryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries`] });
      
      toast({
        title: "Gallery updated",
        description: "The gallery has been updated successfully",
      });
    },
    onError: (error: Error) => {
      setIsUpdating(false);
      
      toast({
        title: "Failed to update gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete a gallery
  const deleteGalleryMutation = useMutation({
    mutationFn: async (galleryId: number) => {
      await apiRequest('DELETE', `/api/community/${communityId}/galleries/${galleryId}`);
    },
    onSuccess: () => {
      // Invalidate galleries list
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries`] });
      
      toast({
        title: "Gallery deleted",
        description: "The gallery has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add media to a gallery
  const addMediaToGalleryMutation = useMutation({
    mutationFn: async ({ galleryId, mediaId, displayOrder, caption }: GalleryItemData) => {
      const res = await apiRequest('POST', `/api/community/${communityId}/galleries/${galleryId}/items`, {
        mediaId, 
        displayOrder,
        caption
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific gallery
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries/${variables.galleryId}`] });
      
      toast({
        title: "Media added to gallery",
        description: "The media item has been added to the gallery",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add media to gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Remove media from a gallery
  const removeMediaFromGalleryMutation = useMutation({
    mutationFn: async ({ galleryId, mediaId }: { galleryId: number, mediaId: number }) => {
      await apiRequest('DELETE', `/api/community/${communityId}/galleries/${galleryId}/items/${mediaId}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific gallery
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries/${variables.galleryId}`] });
      
      toast({
        title: "Media removed from gallery",
        description: "The media item has been removed from the gallery",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove media from gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update gallery item (display order and caption)
  const updateGalleryItemMutation = useMutation({
    mutationFn: async ({ galleryId, mediaId, displayOrder, caption }: GalleryItemData) => {
      const res = await apiRequest(
        'PATCH', 
        `/api/community/${communityId}/galleries/${galleryId}/items/${mediaId}`, 
        { displayOrder, caption }
      );
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific gallery
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries/${variables.galleryId}`] });
      
      toast({
        title: "Gallery item updated",
        description: "The gallery item has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update gallery item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    isUpdating,
    createGalleryMutation,
    updateGalleryMutation,
    deleteGalleryMutation,
    addMediaToGalleryMutation,
    removeMediaFromGalleryMutation,
    updateGalleryItemMutation
  };
}