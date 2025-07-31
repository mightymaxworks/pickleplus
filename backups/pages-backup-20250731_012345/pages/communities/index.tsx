/**
 * @component CommunitiesPage
 * @layer UI
 * @module Community
 * @sprint PKL-278651-COMM-0006-HUB-UI
 * @version 2.1.0
 * @lastModified 2025-04-17
 * 
 * @description
 * Main container component for the Community Hub feature.
 * Serves as the entry point for all community-related functionality.
 * 
 * @parent App.tsx > RouteHandler
 * @children
 * - CommunityDiscoveryMockup
 * - CommunityProfileMockup
 * - CommunityCreationMockup
 * - CommunityEventsMockup
 * - CommunityAnnouncementsMockup
 * 
 * @dependsOn
 * - DashboardLayout
 * - CommunityProvider
 * - useCommunities hook
 * 
 * @visual
 * - Orange "COMMUNITY" logo at the top (h-16 size)
 * - Tab-based navigation with icon buttons
 * - Confetti animation on tab changes
 * - Content area with tab-specific components
 * 
 * @changes
 * - Replaced text header with COMMUNITY logo
 * - Removed decorative elements for cleaner UI
 * - Enhanced tab navigation with better visual feedback
 * 
 * @preserves
 * - Tab navigation system
 * - Community provider context
 * - Dashboard layout integration
 */

import React from 'react';
import CommunitiesContent from '../../components/communities/CommunitiesContent';

export default function CommunitiesPage() {
  return (
    <div className="w-full">
      <CommunitiesContent />
    </div>
  );
}