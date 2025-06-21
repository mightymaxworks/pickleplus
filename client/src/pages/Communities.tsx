/**
 * Communities Page - Modern Community Hub
 * Modernized design with active community features and enhanced UX
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Trophy,
  Search,
  Filter,
  Plus,
  Compass,
  MessageCircle,
  Activity,
  Star,
  ChevronRight,
  Globe,
  Crown,
  Zap,
  Megaphone,
  Check
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

export default function Communities() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch communities from API
  const { data: communitiesData, isLoading: communitiesLoading } = useQuery({
    queryKey: ["/api/communities", { search: searchQuery, category: selectedCategory }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory !== 'all') params.append('skillLevel', selectedCategory);
        params.append('limit', '20');
        
        const response = await apiRequest("GET", `/api/communities?${params.toString()}`);
        const data = await response.json();
        console.log('[Communities API] Raw response:', data);
        // Handle both direct array and wrapped response formats
        return data.communities || data;
      } catch (error) {
        console.error("Error fetching communities:", error);
        return [];
      }
    },
  });

  // Fetch community events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/communities/events"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/communities/events?limit=10");
        return await response.json();
      } catch (error) {
        console.error("Error fetching community events:", error);
        return [];
      }
    },
  });

  // Fetch community stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/communities/stats"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/communities/stats");
        return await response.json();
      } catch (error) {
        console.error("Error fetching community stats:", error);
        return {
          totalCommunities: 0,
          totalMembers: 0,
          activeEvents: 0,
          userCommunities: 0
        };
      }
    },
  });

  // Process communities data - handle both array and object responses
  const allCommunities = Array.isArray(communitiesData) ? communitiesData : (communitiesData?.communities || []);
  // Filter out communities with "test" in the name (case insensitive)
  const communities = allCommunities.filter(community => 
    !community.name.toLowerCase().includes('test')
  );
  const events = eventsData || [];
  const stats = statsData || { totalCommunities: 0, totalMembers: 0, activeEvents: 0, userCommunities: 0 };
  
  console.log('[Communities Debug] Processed communities (filtered):', communities);
  console.log('[Communities Debug] Community count:', communities.length);

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('communities.title', 'Community Hub')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('communities.subtitle', 'Connect with fellow players, join tournaments, and grow your pickleball journey together')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Communities</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalCommunities}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Events</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeEvents}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Events This Week</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.activeEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Your Communities</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.userCommunities}</p>
                </div>
                <Crown className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-communities">My Communities</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'beginner', 'intermediate', 'advanced', 'competitive'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Communities Grid */}
            {communitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <Card key={community.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{community.name}</CardTitle>
                            {community.isDefault && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                <Megaphone className="h-3 w-3 mr-1" />
                                Official
                              </Badge>
                            )}
                            {community.isFeatured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {community.isPrivate && (
                              <Badge variant="outline">Private</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {community.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{community.location}</span>
                          </div>
                          <Badge variant="outline">{community.skillLevel || 'Open'}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            {community.isDefault ? (
                              <div className="flex items-center gap-1">
                                <Megaphone className="h-4 w-4 text-orange-500" />
                                <span className="text-orange-600">Announcement Group</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{community.memberCount || 0}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-green-500" />
                              <span>Active</span>
                            </div>
                          </div>
                        </div>
                        
                        {community.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(typeof community.tags === 'string' ? community.tags.split(',') : community.tags)
                              .map((tag) => (
                                <Badge key={tag.trim()} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {community.isDefault ? (
                            <Button className="flex-1" size="sm" disabled>
                              <Check className="h-4 w-4 mr-2" />
                              Member
                            </Button>
                          ) : (
                            <Button className="flex-1" size="sm">
                              Join Community
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/communities/${community.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Compass className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Communities Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? `No communities match "${searchQuery}"` : "No communities available yet"}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Community
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-communities" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Your Communities</h3>
                <p className="text-muted-foreground mb-6">
                  Join communities to see them here and stay connected with fellow players.
                </p>
                <Button>
                  <Compass className="h-4 w-4 mr-2" />
                  Discover Communities
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {eventsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title || event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.communityName || 'Community Event'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date || event.startDate).toLocaleDateString()} at {event.time || new Date(event.startDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="font-medium">{event.attendeeCount || 0}</span>
                            <span className="text-muted-foreground">/{event.maxAttendees || 'unlimited'} participants</span>
                          </div>
                          <Button size="sm">Join Event</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Events Scheduled</h3>
                  <p className="text-muted-foreground mb-6">
                    Check back later for upcoming community events and tournaments.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Plus className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Your Community</h3>
                <p className="text-muted-foreground mb-6">
                  Start a new community to connect with players who share your interests and skill level.
                </p>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Community
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}