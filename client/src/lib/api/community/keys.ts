/**
 * PKL-278651-COMM-0035-EVENT
 * Community API Query Keys
 * 
 * This file contains query keys for community-related API endpoints
 * to be used with TanStack Query.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
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
};