/**
 * PKL-278651-COMM-0022-DISC
 * Community Discovery Page
 * 
 * This page showcases the enhanced community discovery features,
 * allowing users to find trending, recommended, and featured communities.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React from "react";
import { EnhancedCommunityDiscovery } from "@/components/community/EnhancedCommunityDiscovery";
import { CommunityProvider } from "@/lib/providers/CommunityProvider";
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/ui/page-header";
import { LayoutContainer } from "@/components/layout/LayoutContainer";

export default function CommunityDiscoveryPage() {
  return (
    <CommunityProvider>
      <LayoutContainer>
        <PageHeader className="pb-8">
          <PageHeaderHeading>Community Discovery</PageHeaderHeading>
          <PageHeaderDescription>
            Find communities that match your interests and skill level.
            Join discussions, participate in events, and connect with fellow pickleball enthusiasts.
          </PageHeaderDescription>
        </PageHeader>
        
        <EnhancedCommunityDiscovery />
      </LayoutContainer>
    </CommunityProvider>
  );
}