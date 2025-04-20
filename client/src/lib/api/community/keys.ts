/**
 * PKL-278651-COMM-0036-MEDIA
 * Community API Query Keys
 * 
 * This file contains query keys for community-related API endpoints
 * to be used with TanStack Query.
 * 
 * @version 1.1.0
 * @lastModified 2025-04-20
 * @updated Added media and gallery keys for media management
 */

// Base keys for community endpoints
export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...communityKeys.lists(), { filters }] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: number) => [...communityKeys.details(), id] as const,
  
  // Community membership
  members: (communityId: number) => 
    [...communityKeys.detail(communityId), 'members'] as const,
  member: (communityId: number, userId: number) => 
    [...communityKeys.members(communityId), userId] as const,
    
  // Community events
  events: (communityId: number) => 
    [...communityKeys.detail(communityId), 'events'] as const,
  event: (communityId: number, eventId: number | string) => 
    [...communityKeys.events(communityId), eventId] as const,
    
  // Event templates
  eventTemplates: (communityId: number) => 
    [...communityKeys.detail(communityId), 'eventTemplates'] as const,
  eventTemplate: (communityId: number, templateId: number | string) => 
    [...communityKeys.eventTemplates(communityId), templateId] as const,
    
  // Community metrics
  metrics: (communityId: number) => 
    [...communityKeys.detail(communityId), 'metrics'] as const,
  
  // Community roles and permissions
  roles: (communityId: number) => 
    [...communityKeys.detail(communityId), 'roles'] as const,
  role: (communityId: number, roleId: number | string) => 
    [...communityKeys.roles(communityId), roleId] as const,
    
  // Community media management
  media: (communityId: number) => 
    [...communityKeys.detail(communityId), 'media'] as const,
  mediaItem: (communityId: number, mediaId: number) => 
    [...communityKeys.media(communityId), mediaId] as const,
    
  // Community galleries management
  galleries: (communityId: number) => 
    [...communityKeys.detail(communityId), 'galleries'] as const,
  gallery: (communityId: number, galleryId: number) => 
    [...communityKeys.galleries(communityId), galleryId] as const,
  galleryItems: (communityId: number, galleryId: number) => 
    [...communityKeys.gallery(communityId, galleryId), 'items'] as const,
};