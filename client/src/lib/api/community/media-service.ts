/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management API Service
 * 
 * Client-side service for managing community media:
 * - Upload media files
 * - Manage galleries
 * - View and organize media
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { apiRequest } from "@/lib/queryClient";
import { Media, Gallery, GalleryItem, GalleryWithRelations } from "@shared/schema/media";

// Base URL for community media endpoints
const BASE_URL = "/api/community";

// Media API service
export const mediaService = {
  /**
   * Upload media files to a community
   */
  uploadMedia: async (communityId: number, formData: FormData): Promise<Media[]> => {
    // Use fetch directly for FormData upload instead of apiRequest
    const token = localStorage.getItem('csrfToken');
    const response = await fetch(`${BASE_URL}/${communityId}/media`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: token ? {
        'X-CSRF-Token': token
      } : {}
    });
    return await response.json();
  },

  /**
   * Get all media for a community with optional filtering
   */
  getMedia: async (communityId: number, params?: {
    mediaType?: string;
    limit?: number;
    offset?: number;
    sort?: "newest" | "oldest" | "featured";
  }): Promise<Media[]> => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.mediaType) queryParams.append("mediaType", params.mediaType);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.offset) queryParams.append("offset", params.offset.toString());
      if (params.sort) queryParams.append("sort", params.sort);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await apiRequest(
      "GET",
      `${BASE_URL}/${communityId}/media${queryString}`
    );
    return await response.json();
  },

  /**
   * Get a specific media item
   */
  getMediaItem: async (communityId: number, mediaId: number): Promise<Media> => {
    const response = await apiRequest(
      "GET",
      `${BASE_URL}/${communityId}/media/${mediaId}`
    );
    return await response.json();
  },

  /**
   * Delete a media item
   */
  deleteMedia: async (communityId: number, mediaId: number): Promise<void> => {
    await apiRequest(
      "DELETE",
      `${BASE_URL}/${communityId}/media/${mediaId}`
    );
  },

  /**
   * Create a gallery
   */
  createGallery: async (communityId: number, data: Partial<Gallery>): Promise<Gallery> => {
    const response = await apiRequest(
      "POST",
      `${BASE_URL}/${communityId}/galleries`,
      data
    );
    return await response.json();
  },

  /**
   * Get all galleries for a community
   */
  getGalleries: async (communityId: number): Promise<Gallery[]> => {
    const response = await apiRequest(
      "GET",
      `${BASE_URL}/${communityId}/galleries`
    );
    return await response.json();
  },

  /**
   * Get a gallery with its media items
   */
  getGallery: async (communityId: number, galleryId: number): Promise<GalleryWithRelations> => {
    const response = await apiRequest(
      "GET",
      `${BASE_URL}/${communityId}/galleries/${galleryId}`
    );
    return await response.json();
  },

  /**
   * Update a gallery
   */
  updateGallery: async (communityId: number, galleryId: number, data: Partial<Gallery>): Promise<Gallery> => {
    const response = await apiRequest(
      "PATCH",
      `${BASE_URL}/${communityId}/galleries/${galleryId}`,
      data
    );
    return await response.json();
  },

  /**
   * Delete a gallery
   */
  deleteGallery: async (communityId: number, galleryId: number): Promise<void> => {
    await apiRequest(
      "DELETE",
      `${BASE_URL}/${communityId}/galleries/${galleryId}`
    );
  },

  /**
   * Add media to a gallery
   */
  addMediaToGallery: async (
    communityId: number,
    galleryId: number,
    data: {
      mediaId: number;
      displayOrder?: number;
      caption?: string;
    }
  ): Promise<GalleryItem> => {
    const response = await apiRequest(
      "POST",
      `${BASE_URL}/${communityId}/galleries/${galleryId}/items`,
      data
    );
    return await response.json();
  },

  /**
   * Remove media from a gallery
   */
  removeMediaFromGallery: async (
    communityId: number,
    galleryId: number,
    mediaId: number
  ): Promise<void> => {
    await apiRequest(
      "DELETE",
      `${BASE_URL}/${communityId}/galleries/${galleryId}/items/${mediaId}`
    );
  },

  /**
   * Update gallery item (display order and caption)
   */
  updateGalleryItem: async (
    communityId: number,
    galleryId: number,
    mediaId: number,
    data: {
      displayOrder?: number;
      caption?: string;
    }
  ): Promise<GalleryItem> => {
    const response = await apiRequest(
      "PATCH",
      `${BASE_URL}/${communityId}/galleries/${galleryId}/items/${mediaId}`,
      data
    );
    return await response.json();
  }
};