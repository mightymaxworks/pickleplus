/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Mockup Component
 * 
 * This component displays the activity feed for communities.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivityFeed from '@/components/community/ActivityFeed';
import { Bell, Users, Calendar, Trophy } from 'lucide-react';

export default function ActivityFeedMockup() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Feed</h2>
          <p className="text-muted-foreground">
            Stay up-to-date with what's happening in your communities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Activity Feed Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary" />
                Latest Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Activity Feed Tabs */}
              <Tabs defaultValue="all" className="mb-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="all" className="px-2 sm:px-4">All</TabsTrigger>
                  <TabsTrigger value="community" className="px-2 sm:px-4">
                    <Users className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Communities</span>
                    <span className="sm:hidden">Groups</span>
                  </TabsTrigger>
                  <TabsTrigger value="events" className="px-2 sm:px-4">
                    <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                    <span>Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="px-2 sm:px-4">
                    <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Achievements</span>
                    <span className="sm:hidden">Rewards</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* All Activities */}
                <TabsContent value="all" className="mt-4">
                  <ActivityFeed 
                    limit={20}
                    maxHeight={600}
                    showRefreshButton={true}
                    emptyMessage="No activities to display yet. Join more communities to see their updates here!"
                  />
                </TabsContent>
                
                {/* Community-specific Activities */}
                <TabsContent value="community" className="mt-4">
                  <ActivityFeed 
                    limit={20}
                    maxHeight={600}
                    showRefreshButton={true}
                    emptyMessage="No community activities to display. Join some communities to see their updates!"
                  />
                </TabsContent>
                
                {/* Event Activities */}
                <TabsContent value="events" className="mt-4">
                  <ActivityFeed 
                    limit={20}
                    maxHeight={600}
                    showRefreshButton={true}
                    emptyMessage="No event activities to display. Join events or create your own to see updates here!"
                  />
                </TabsContent>
                
                {/* Achievement Activities */}
                <TabsContent value="achievements" className="mt-4">
                  <ActivityFeed 
                    limit={20}
                    maxHeight={600}
                    showRefreshButton={true}
                    emptyMessage="Complete achievements and see them displayed here!"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mobile-friendly stats row (visible only on small screens) */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-medium">Activity Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Communities</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Events</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-medium">Updates</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Achievements</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Notifications</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Desktop stats card (hidden on mobile) */}
          <div className="hidden md:block">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Communities joined</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Recent events</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">New achievements</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Unread notifications</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trending Communities - same for all screen sizes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Trending Communities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">PC</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Pickleball Champions</p>
                  <p className="text-xs text-muted-foreground">125 members · 7 new posts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-medium">DB</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Dinking Buddies</p>
                  <p className="text-xs text-muted-foreground">78 members · 4 new posts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-medium">SP</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Smash Pros</p>
                  <p className="text-xs text-muted-foreground">56 members · 3 new posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}