/**
 * PKL-278651-COMM-0029-MOD - Client-side Content Moderation Service
 * Implementation timestamp: 2025-04-20 22:45 ET
 * 
 * API client service for content moderation functionality
 * 
 * Framework 5.2 compliant implementation
 */

import { apiRequest } from "@/lib/queryClient";

/**
 * Helper service for content moderation across the community platform
 */
export const moderationService = {
  /**
   * Filter content before posting
   * This allows communities to enforce content policies
   */
  async filterContent(communityId: number, content: string, contentType: 'post' | 'comment' | 'event') {
    const response = await apiRequest(
      'POST',
      `/api/communities/${communityId}/moderation/filter-content`,
      { content, contentType }
    );
    return await response.json();
  },

  /**
   * Report content for moderation
   */
  async reportContent(data: {
    communityId: number,
    contentType: 'post' | 'comment' | 'event',
    contentId: number,
    reason: string,
    details?: string
  }) {
    const response = await apiRequest(
      'POST',
      `/api/communities/${data.communityId}/moderation/reports`,
      data
    );
    return await response.json();
  },

  /**
   * Get moderation reports for a community (requires moderator role)
   */
  async getReports(communityId: number) {
    const response = await apiRequest(
      'GET',
      `/api/communities/${communityId}/moderation/reports`
    );
    return await response.json();
  },

  /**
   * Get moderation actions for a community (requires moderator role)
   */
  async getModerationActions(communityId: number) {
    const response = await apiRequest(
      'GET',
      `/api/communities/${communityId}/moderation/actions`
    );
    return await response.json();
  },

  /**
   * Get content filter settings for a community
   */
  async getContentFilterSettings(communityId: number) {
    const response = await apiRequest(
      'GET',
      `/api/communities/${communityId}/moderation/filter-settings`
    );
    return await response.json();
  },

  /**
   * Update content filter settings for a community (requires moderator role)
   */
  async updateContentFilterSettings(communityId: number, settings: {
    enabledFilters?: any[],
    bannedKeywords?: string,
    sensitiveContentTypes?: string,
    requireApproval?: boolean,
    autoModEnabled?: boolean
  }) {
    const response = await apiRequest(
      'PUT',
      `/api/communities/${communityId}/moderation/filter-settings`,
      settings
    );
    return await response.json();
  },
  
  /**
   * Review a content report (requires moderator role)
   */
  async reviewReport(communityId: number, reportId: number, data: {
    status: string,
    reviewNotes?: string,
    action?: string
  }) {
    const response = await apiRequest(
      'PATCH',
      `/api/communities/${communityId}/moderation/reports/${reportId}`,
      data
    );
    return await response.json();
  },

  /**
   * Get pending content items for a community (requires moderator role)
   */
  async getPendingContentItems(communityId: number) {
    const response = await apiRequest(
      'GET',
      `/api/communities/${communityId}/moderation/approval-queue`
    );
    return await response.json();
  },

  /**
   * Review a queued content item (requires moderator role)
   */
  async reviewContentItem(communityId: number, itemId: number, data: {
    approved: boolean,
    moderationNotes?: string
  }) {
    const response = await apiRequest(
      'PATCH',
      `/api/communities/${communityId}/moderation/approval-queue/${itemId}`,
      data
    );
    return await response.json();
  },

  /**
   * Take a moderation action against a user (requires moderator role)
   */
  async takeAction(communityId: number, data: {
    targetUserId: number,
    actionType: 'warning' | 'mute' | 'ban' | 'unban',
    reason?: string,
    expiresAt?: string,
    durationHours?: number
  }) {
    const response = await apiRequest(
      'POST',
      `/api/communities/${communityId}/moderation/actions`,
      data
    );
    return await response.json();
  }
};

export default moderationService;