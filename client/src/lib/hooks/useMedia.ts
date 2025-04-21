/**
 * PKL-278651-COMM-0036-MEDIA
 * Media Hook
 * 
 * Provides data access and operations for community media items
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export interface Media {
  id: number;
  communityId: number;
  createdByUserId: number;
  title: string;
  description: string | null;
  mediaType: MediaType;
  filePath: string;
  thumbnailPath: string | null;
  fileSizeBytes: number;
  isFeatured: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  filename: string;
  error?: string;
  compressedSize?: number;
  originalSize?: number;
  compressionRatio?: number;
}

export interface MediaQueryOptions {
  mediaType?: MediaType;
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'oldest' | 'featured';
}

export interface StorageQuota {
  bytesUsed: number;
  fileCount: number;
  quotaBytes: number;
  tier: string;
  percentUsed: number;
  lastCalculated: string;
}

export function useMedia(communityId: number, options: MediaQueryOptions = {}) {
  const { mediaType, limit = 20, offset = 0, sort = 'newest' } = options;
  
  // Create the query string
  const queryParams = new URLSearchParams();
  if (mediaType) queryParams.append('mediaType', mediaType);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  queryParams.append('sort', sort);
  
  // Query for media items
  return useQuery<Media[]>({
    queryKey: [`/api/community/${communityId}/media`, mediaType, limit, offset, sort],
    queryFn: async () => {
      const response = await fetch(`/api/community/${communityId}/media?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      return response.json();
    },
    enabled: !!communityId
  });
}

export function useMediaItem(communityId: number, mediaId: number | null) {
  // Query for a specific media item
  return useQuery<Media>({
    queryKey: [`/api/community/${communityId}/media/${mediaId}`],
    enabled: !!communityId && !!mediaId
  });
}

export function useStorageQuota(communityId: number) {
  // Query for storage quota information
  return useQuery<StorageQuota>({
    queryKey: [`/api/community/${communityId}/media/quota`],
    enabled: !!communityId
  });
}

export function useMediaMutations(communityId: number) {
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  
  // Upload media items
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ files, title, description, tags }: { 
      files: File[]; 
      title?: string; 
      description?: string; 
      tags?: string[];
    }) => {
      // Create a FormData object
      const formData = new FormData();
      
      // Set the progress trackers for each file
      const newProgress: MediaUploadProgress[] = files.map(file => ({
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: 'compressing',
        filename: file.name
      }));
      setUploadProgress(newProgress);
      
      // Add additional metadata
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (tags && tags.length > 0) formData.append('tags', tags.join(','));
      
      // Add files to form data
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Create custom fetch with upload progress tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<Media[]>((resolve, reject) => {
        xhr.open('POST', `/api/community/${communityId}/media`);
        
        // Add auth header from current session
        // This assumes your app has a way to get the current auth token
        // If not using a token-based auth, this may not be needed
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        }
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const allFilesProgress = newProgress.map(item => ({
              ...item,
              status: 'uploading' as const,
              loaded: (event.loaded / event.total) * item.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }));
            setUploadProgress(allFilesProgress);
          }
        };
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            const allFilesProgress = newProgress.map(item => ({
              ...item,
              status: 'done' as const,
              loaded: item.total,
              percentage: 100
            }));
            setUploadProgress(allFilesProgress);
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            const allFilesProgress = newProgress.map(item => ({
              ...item,
              status: 'error' as const,
              error: `Upload failed with status ${xhr.status}`
            }));
            setUploadProgress(allFilesProgress);
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          const allFilesProgress = newProgress.map(item => ({
            ...item,
            status: 'error' as const,
            error: 'Network error occurred'
          }));
          setUploadProgress(allFilesProgress);
          reject(new Error('Network error occurred'));
        };
        
        xhr.send(formData);
      });
      
      return uploadPromise;
    },
    onSuccess: () => {
      // Invalidate media list and quota queries
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media/quota`] });
      
      toast({
        title: "Media uploaded",
        description: "Your media has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete a media item
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      await apiRequest('DELETE', `/api/community/${communityId}/media/${mediaId}`);
    },
    onSuccess: () => {
      // Invalidate media list and quota queries
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media/quota`] });
      
      toast({
        title: "Media deleted",
        description: "The media item has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete media",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update a media item
  const updateMediaMutation = useMutation({
    mutationFn: async ({ mediaId, data }: { 
      mediaId: number; 
      data: { title?: string; description?: string; tags?: string[]; isFeatured?: boolean } 
    }) => {
      const res = await apiRequest('PATCH', `/api/community/${communityId}/media/${mediaId}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific media item and potentially the list
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media/${variables.mediaId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media`] });
      
      toast({
        title: "Media updated",
        description: "The media item has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update media",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Recalculate storage quota
  const recalculateQuotaMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/community/${communityId}/media/recalculate-quota`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media/quota`] });
      
      toast({
        title: "Storage quota recalculated",
        description: "The storage quota has been recalculated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to recalculate quota",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add media to a gallery
  const addMediaToGalleryMutation = useMutation({
    mutationFn: async ({ 
      galleryId, 
      mediaId, 
      displayOrder, 
      caption 
    }: { 
      galleryId: number; 
      mediaId: number; 
      displayOrder?: number; 
      caption?: string;
    }) => {
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
        title: "Added to gallery",
        description: "The media item has been added to the gallery",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to gallery",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    uploadProgress,
    setUploadProgress,
    uploadMediaMutation,
    deleteMediaMutation,
    updateMediaMutation,
    recalculateQuotaMutation,
    addMediaToGalleryMutation
  };
}