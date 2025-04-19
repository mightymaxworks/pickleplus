/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Page
 * 
 * This page displays the activity feed with real-time updates via WebSocket.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import { 
  Bell, 
  Filter, 
  RefreshCw, 
  UserCircle, 
  Users,
  MessageSquare,
  Trophy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import ActivityFeed from '@/components/community/ActivityFeed';

interface Community {
  id: number;
  name: string;
  memberCount: number;
  description: string;
  themeColor?: string;
  avatarUrl?: string;
}

const ActivityFeedPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  
  // Fetch user's communities
  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['/api/communities/joined'],
    queryFn: async () => {
      const response = await fetch('/api/communities/joined');
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }
      return response.json() as Promise<Community[]>;
    }
  });
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };
  
  // Handle community filter change
  const handleCommunityChange = (value: string) => {
    setSelectedCommunity(value === 'all' ? null : parseInt(value, 10));
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              Activity Feed
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with real-time activities from your communities and connections
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue="all" onValueChange={handleCommunityChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities?.map((community) => (
                  <SelectItem key={community.id} value={community.id.toString()}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => toast({ title: "Filters applied" })}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main activity feed column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>
                  Real-time updates from your communities and connections
                </CardDescription>
                
                <Tabs defaultValue="all" className="mt-3" onValueChange={handleFilterChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="communities">Communities</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                    <TabsTrigger value="mentions">Mentions</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                <ActivityFeed 
                  communityId={selectedCommunity || undefined}
                  limit={20}
                  maxHeight={600}
                  showRefreshButton
                  emptyMessage={
                    selectedFilter === "mentions" 
                      ? "No mentions found. When someone mentions you in a comment or post, it will appear here."
                      : selectedFilter === "connections" 
                        ? "No activities from your connections yet. Connect with more players to see their activities here."
                        : "No activities to display. Join communities or connect with players to see their activities."
                  }
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar column */}
          <div className="space-y-6">
            {/* Quick filters card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleFilterChange("all")}>
                  <Bell className="h-4 w-4 mr-2" />
                  All Activities
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleFilterChange("communities")}>
                  <Users className="h-4 w-4 mr-2" />
                  Community Activities
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleFilterChange("matches")}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Match Updates
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleFilterChange("connections")}>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Connection Updates
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleFilterChange("mentions")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mentions & Replies
                </Button>
              </CardContent>
            </Card>
            
            {/* Notification settings card */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage what activities you receive updates for</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/preferences"}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActivityFeedPage;