/**
 * PKL-278651-COMM-0035-EVENT
 * Event Templates Hooks
 * 
 * This file contains the hooks for interacting with event templates.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
import { communityKeys } from '@/lib/api/community/keys';

// Template types
export interface EventTemplate {
  id: number;
  communityId: number;
  createdByUserId: number;
  name: string;
  description?: string;
  eventType: string;
  durationMinutes: number;
  location?: string;
  isVirtual: boolean;
  virtualMeetingUrl?: string;
  maxAttendees?: number;
  minSkillLevel?: string;
  maxSkillLevel?: string;
  recurringPattern?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch event templates for a community
 */
export function useEventTemplates(communityId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.eventTemplates(communityId),
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/communities/${communityId}/event-templates`);
      return response.json();
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch a specific event template
 */
export function useEventTemplate(communityId: number, templateId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.eventTemplate(communityId, templateId),
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/communities/${communityId}/event-templates/${templateId}`);
      return response.json();
    },
    enabled: options?.enabled !== false && !!templateId,
  });
}

/**
 * Hook to create a new event template
 */
export function useCreateEventTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ communityId, data }: { communityId: number; data: any }) => {
      const response = await apiRequest("POST", `/api/communities/${communityId}/event-templates`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(variables.communityId) });
    },
  });
}

/**
 * Hook to update an event template
 */
export function useUpdateEventTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ communityId, templateId, data }: { communityId: number; templateId: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/communities/${communityId}/event-templates/${templateId}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplate(variables.communityId, variables.templateId) });
    },
  });
}

/**
 * Hook to delete an event template
 */
export function useDeleteEventTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ communityId, templateId }: { communityId: number; templateId: string }) => {
      const response = await apiRequest("DELETE", `/api/communities/${communityId}/event-templates/${templateId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(variables.communityId) });
    },
  });
}