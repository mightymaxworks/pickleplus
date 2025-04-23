/**
 * PKL-278651-COMMUNITY-0052-FIX
 * 
 * Fix for community page responsiveness on mobile devices
 * This file provides a solution for the community page layout breaking on small screens.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive community container component
 * Replace the existing container in the community detail page
 */
export function ResponsiveCommunityContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "responsive-community-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Responsive community details layout
 * Replace the existing community details layout
 */
export function ResponsiveCommunityDetails({ community }: { community: any }) {
  return (
    <div className="community-details-wrapper">
      {/* Community Header - Full width on all screens */}
      <div className="community-header w-full bg-card p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="community-avatar h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {community.logo ? (
                <img src={community.logo} alt={community.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold">{community.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{community.name}</h1>
              <p className="text-muted-foreground text-sm">{community.location}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
              Join Community
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md">
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Community Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <p className="text-sm text-muted-foreground">{community.description}</p>
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
            <div className="space-y-2">
              {community.activities?.map((activity: any, i: number) => (
                <div key={i} className="p-2 rounded-md bg-muted/50">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
            </div>
          </div>
        </div>

        {/* Right Column - Details & Stats */}
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Community Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Members:</span>
                <span className="font-medium">{community.memberCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Founded:</span>
                <span className="font-medium">{community.foundedDate || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courts:</span>
                <span className="font-medium">{community.courtCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Upcoming Events</h2>
            <div className="space-y-2">
              {community.events?.map((event: any, i: number) => (
                <div key={i} className="p-2 rounded-md bg-muted/50">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              )) || <p className="text-sm text-muted-foreground">No upcoming events</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CSS fixes to add to your global styles or component styles
 * These ensure proper mobile display for the community pages
 */
export const communityCssFixStyles = `
/* Community page mobile responsiveness fixes */
@media (max-width: 375px) {
  .community-header h1 {
    font-size: 1.25rem;
  }
  
  .community-avatar {
    height: 48px;
    width: 48px;
  }
  
  .community-stats {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .community-details-wrapper {
    padding: 0.5rem;
  }
}

/* Ensure proper touch target sizes on mobile */
@media (max-width: 640px) {
  .community-details-wrapper button {
    min-height: 44px;
  }
}
`;