/**
 * PKL-278651-COMM-0002-MOBILE
 * Responsive Community Page Components
 * 
 * This file provides responsive components for the community details page that:
 * 1. Work properly on small mobile screens (down to 320px width)
 * 2. Use flexible layouts that adapt to different screen sizes
 * 3. Maintain proper touch targets for mobile users
 * 4. Use a mobile-first approach to ensure optimal experience
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserIcon, MapPinIcon, CalendarIcon, UsersIcon, ClockIcon } from 'lucide-react';

/**
 * Types for community data
 */
interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
}

interface CommunityActivity {
  id: string;
  description: string;
  date: string;
  userId?: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location?: string;
  memberCount: number;
  foundedDate?: string;
  courtCount?: number;
  events?: CommunityEvent[];
  activities?: CommunityActivity[];
  members?: CommunityMember[];
  isPrivate?: boolean;
}

/**
 * Responsive Community Hero
 * 
 * Mobile-friendly hero component for community page
 */
export function CommunityHero({ community }: { community: Community }) {
  if (!community) return null;
  
  return (
    <div className="responsive-community-hero w-full mb-6">
      <div className="flex flex-col rounded-lg overflow-hidden">
        {/* Community Banner - optional background image */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/40 relative">
          {/* Optional banner image could be added here */}
          <div className="absolute -bottom-16 left-4 sm:left-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src={community.logo} alt={community.name} />
              <AvatarFallback className="text-2xl sm:text-4xl">
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Community Info */}
        <div className="pt-20 sm:pt-24 px-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{community.name}</h1>
                {community.isPrivate && <Badge>Private</Badge>}
              </div>
              
              {community.location && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{community.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col xs:flex-row gap-2 mt-2 sm:mt-0">
              <Button size="sm" className="h-9">Join Community</Button>
              <Button size="sm" variant="outline" className="h-9">Contact</Button>
            </div>
          </div>
          
          {/* Community Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm font-medium">{community.memberCount}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
            
            {community.foundedDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">{community.foundedDate}</p>
                  <p className="text-xs text-muted-foreground">Founded</p>
                </div>
              </div>
            )}
            
            {community.courtCount !== undefined && (
              <div className="flex items-center">
                <svg 
                  className="h-5 w-5 text-muted-foreground mr-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="6" width="20" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div>
                  <p className="text-sm font-medium">{community.courtCount}</p>
                  <p className="text-xs text-muted-foreground">Courts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive Community Details Layout
 * 
 * Main layout component for community details page
 */
export function CommunityDetailsLayout({ community, children }: { community: Community, children?: React.ReactNode }) {
  if (!community) return null;
  
  return (
    <div className="community-page-container">
      {/* Hero Section */}
      <CommunityHero community={community} />
      
      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-8">
        {/* Left Column - About & Activities */}
        <div className="md:col-span-2 space-y-4">
          {/* About Card */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {community.description}
              </p>
            </CardContent>
          </Card>
          
          {/* Activity Feed Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {community.activities && community.activities.length > 0 ? (
                community.activities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
          
          {/* Additional content can go here */}
          {children}
        </div>

        {/* Right Column - Events & Members */}
        <div className="space-y-4">
          {/* Events Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {community.events && community.events.length > 0 ? (
                community.events.map(event => (
                  <div key={event.id} className="p-3 rounded-md bg-muted/50 hover:bg-muted cursor-pointer">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <div className="flex items-center mt-1">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center mt-1">
                        <MapPinIcon className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">{event.location}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">View All Events</Button>
            </CardFooter>
          </Card>
          
          {/* Members Card */}
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Community participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {community.members && community.members.slice(0, 6).map(member => (
                  <Avatar key={member.id} className="h-10 w-10 border border-border">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {community.memberCount > 6 && (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">
                    +{community.memberCount - 6}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">View All Members</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Additional CSS for Mobile Responsiveness
 * 
 * Add these styles to your global.css file or tailwind.config.js
 */
export const mobileResponsiveCSS = `
/* Extra small screen breakpoint */
@media (max-width: 475px) {
  .xs\\:flex-row {
    flex-direction: row;
  }
}

/* Small mobile devices (iPhone SE, etc.) */
@media (max-width: 375px) {
  .community-page-container {
    padding: 0;
  }
  
  .responsive-community-hero h1 {
    font-size: 1.25rem;
  }
  
  /* Increase touch target sizes */
  .community-page-container button {
    min-height: 44px;
  }
}

/* Ensure touch targets are accessible */
@media (max-width: 640px) {
  .community-page-container a, 
  .community-page-container button,
  .community-page-container [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
`;

/**
 * Implementation Notes:
 * 
 * To use these components, replace your existing community page with:
 * 
 * import { CommunityDetailsLayout } from '@/components/community/ResponsiveCommunityPage';
 * 
 * function CommunityDetailPage() {
 *   const { id } = useParams();
 *   const { data: community, isLoading } = useQuery({
 *     queryKey: ['/api/community', id],
 *   });
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!community) return <NotFound />;
 *   
 *   return <CommunityDetailsLayout community={community} />;
 * }
 */