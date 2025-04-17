/**
 * @component CommunityDiscoveryMockup
 * @layer UI
 * @module Community
 * @sprint PKL-278651-COMM-0001-UIMOCK
 * @version 2.1.0
 * @lastModified 2025-04-17
 * 
 * @description
 * Displays a mockup of the community discovery interface with grid and list views.
 * Rendered as content inside the "discover" tab of the Community Hub.
 * 
 * @parent CommunitiesPage (Tab Content)
 * @children
 * - SearchAndFilter (inline component)
 * - FilterPills (inline component)
 * - CommunityGrid/List (inline component)
 * - CommunityCard (inline component)
 * 
 * @visual
 * - Search bar with filters at the top
 * - Filter pills below search bar
 * - Grid/List view toggle
 * - Community cards with:
 *   - Gradient header with community name and location
 *   - Feature badges for special communities
 *   - Statistics (members, events, founding date)
 *   - Tags and quick actions
 * 
 * @changes
 * - Removed decorative header section
 * - Simplified component structure
 * - Added semantic identifiers for testing
 * 
 * @preserves
 * - Card design and layout
 * - Search and filter functionality
 * - Grid/List view toggle
 */
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunities, useJoinCommunity } from '@/lib/hooks/useCommunity';
import { 
  Search, MapPin, Users, Calendar, Trophy, Grid3X3, 
  List, Map, SlidersHorizontal, Filter, Award,
  Star, Clock, Zap, Activity, Target, Dumbbell
} from 'lucide-react';

// Pickleball SVG Icon for community cards
const PickleballIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Court Pattern SVG for backgrounds
const CourtPatternIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

// Example community data for the mockup
const EXAMPLE_COMMUNITIES = [
  {
    id: 1,
    name: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200", // We'll use a gradient instead
    memberCount: 342,
    location: "Seattle, WA",
    events: 5,
    rating: 4.8,
    skill: "All Levels", 
    founded: "2020",
    tags: ["Competitive", "All Levels", "Weekly Matches"],
    featuredTag: "Featured",
    description: "The largest pickleball community in Seattle with regular events and training sessions for all skill levels."
  },
  {
    id: 2,
    name: "Portland Pickle Smashers",
    image: "https://via.placeholder.com/300x200",
    memberCount: 187,
    location: "Portland, OR",
    events: 3,
    rating: 4.5,
    skill: "Beginner-Friendly",
    founded: "2021",
    tags: ["Casual", "Beginners Welcome", "Social"],
    description: "A fun and social group for pickleball enthusiasts in the Portland area. Everyone is welcome!"
  },
  {
    id: 3,
    name: "NorCal Tournament Players",
    image: "https://via.placeholder.com/300x200",
    memberCount: 156,
    location: "San Francisco, CA",
    events: 8,
    rating: 4.9,
    skill: "Advanced",
    founded: "2019",
    tags: ["Tournaments", "Advanced", "Training"],
    featuredTag: "Elite",
    description: "Focused on tournament preparation, advanced drills, and competitive play for serious players."
  },
  {
    id: 4,
    name: "Denver Pickleball Network",
    image: "https://via.placeholder.com/300x200",
    memberCount: 224,
    location: "Denver, CO",
    events: 4,
    rating: 4.6,
    skill: "All Levels",
    founded: "2022",
    tags: ["All Levels", "Coaching", "Weekend Games"],
    description: "Connect with pickleball players around Denver for games, coaching, and social events."
  },
  {
    id: 5,
    name: "Austin Dink Warriors",
    image: "https://via.placeholder.com/300x200",
    memberCount: 118,
    location: "Austin, TX",
    events: 2,
    rating: 4.3,
    skill: "Intermediate",
    founded: "2022",
    tags: ["Intermediate", "Drills", "Tournaments"],
    description: "Dedicated to improving intermediate players through drills, match play, and local tournaments."
  },
  {
    id: 6,
    name: "Chicago Pickleball United",
    image: "https://via.placeholder.com/300x200",
    memberCount: 276,
    location: "Chicago, IL",
    events: 6,
    rating: 4.7,
    skill: "All Levels",
    founded: "2021",
    tags: ["Indoor", "Year-round", "All Levels"],
    featuredTag: "Popular",
    description: "Year-round indoor pickleball in the Chicago area with regular play for all skill levels."
  }
];

const CommunityDiscoveryMockup: React.FC = () => {
  const [viewType, setViewType] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();
  
  // Use the join community mutation with optimistic UI update
  const joinCommunityMutation = useJoinCommunity();
  
  // Handle join community action
  const handleJoinCommunity = (communityId: number) => {
    // Find the community to update
    const communityIndex = communities.findIndex(c => c.id === communityId);
    
    if (communityIndex !== -1) {
      // Create a copy of communities
      const updatedCommunities = [...communities];
      // Set isMember to true in the community at that index
      updatedCommunities[communityIndex] = {
        ...updatedCommunities[communityIndex],
        isMember: true
      };
    }
    
    // Call the mutation
    joinCommunityMutation.mutate({ communityId });
  };
  
  // Use the real API data instead of mock data
  const { data: communities = [], isLoading } = useCommunities({
    enabled: true,
  });
  
  // Filter communities based on search term
  const filteredCommunities = communities.filter(community => {
    if (!searchTerm) return true;
    
    return (
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (community.location && community.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (community.tags && typeof community.tags === 'string' && community.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (community.description && community.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div 
      className="space-y-6"
      id="community-discovery-container"
      data-testid="community-discovery"
      data-component="community-discovery-mockup"
    >
      {/* Search and filter bar */}
      <div 
        className="flex flex-col sm:flex-row gap-4 mb-6"
        id="community-search-filter"
        data-testid="community-search-filter"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="community-search-input"
            data-testid="community-search-input"
            aria-label="Search communities"
          />
        </div>
        <Button 
          variant="outline" 
          className="sm:w-auto w-full"
          id="community-filter-button"
          data-testid="community-filter-button"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div 
          className="flex border rounded-md"
          id="community-view-toggle"
          data-testid="community-view-toggle"
        >
          <Button 
            variant={viewType === 'grid' ? "secondary" : "ghost"} 
            className="rounded-r-none" 
            onClick={() => setViewType('grid')}
            data-testid="community-grid-button"
          >
            <Grid3X3 className="h-4 w-4 mr-1.5" />
            Grid
          </Button>
          <Button 
            variant={viewType === 'list' ? "secondary" : "ghost"} 
            className="rounded-l-none border-l"
            onClick={() => setViewType('list')}
            data-testid="community-list-button"
          >
            <List className="h-4 w-4 mr-1.5" />
            List
          </Button>
        </div>
      </div>

      {/* Filter pills */}
      <div 
        className="flex flex-wrap gap-2 mb-6"
        id="community-filter-pills"
        data-testid="community-filter-pills"
      >
        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
          Near Me
        </Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
          Beginners Welcome
        </Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
          Competitive
        </Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
          Weekly Events
        </Badge>
        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
          Training Focus
        </Badge>
      </div>

      {/* View types */}
      <Tabs 
        value={viewType} 
        onValueChange={setViewType} 
        className="w-full"
        id="community-view-tabs"
        data-testid="community-view-tabs"
      >
        <TabsContent 
          value="grid" 
          className="mt-0"
          id="community-grid-view"
          data-testid="community-grid"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(community => {
              // Generate different gradients based on community id
              const bgGradients = [
                "bg-gradient-to-br from-blue-500 to-green-400",
                "bg-gradient-to-br from-purple-500 to-pink-400",
                "bg-gradient-to-br from-amber-500 to-orange-400",
                "bg-gradient-to-br from-teal-500 to-emerald-400",
                "bg-gradient-to-br from-indigo-500 to-sky-400",
                "bg-gradient-to-br from-rose-500 to-red-400"
              ];
              
              const gradientClass = bgGradients[community.id % bgGradients.length];
              const isFeatured = community.featuredTag;
              
              return (
                <Card 
                  key={community.id} 
                  className="group overflow-hidden rounded-xl border-muted/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  id={`community-card-${community.id}`}
                  data-testid={`community-card-${community.id}`}
                  data-component="community-card"
                >
                  {/* Card Header with Gradient Background */}
                  <div className={`relative h-52 ${gradientClass}`}>
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-[300px] h-[300px] rotate-[20deg]">
                          <CourtPatternIcon />
                        </div>
                      </div>
                    </div>
                    
                    {/* Featured tag */}
                    {isFeatured && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge 
                          className={`
                            px-3 py-1.5 rounded-full font-medium shadow-md 
                            ${community.featuredTag === 'Featured' ? 'bg-yellow-400 text-yellow-950' : 
                             community.featuredTag === 'Elite' ? 'bg-purple-400 text-purple-950' : 
                             'bg-blue-400 text-blue-950'}
                          `}
                        >
                          {community.featuredTag === 'Featured' ? (
                            <><Trophy className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                          ) : community.featuredTag === 'Elite' ? (
                            <><Award className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                          ) : (
                            <><Zap className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                          )}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Logo and Name Container */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                      <div className="mb-1">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-2">
                          <PickleballIcon />
                          <span className="ml-1.5 font-medium">{community.skill}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white group-hover:text-white/90 mb-1.5 drop-shadow-md">
                        {community.name}
                      </h3>
                      
                      <div className="flex items-center text-white/90 text-sm drop-shadow-md">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        {community.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <CardContent className="pt-5 relative">
                    {/* Rating badge */}
                    <div className="absolute -top-4 right-4 bg-card rounded-full border border-border shadow-md px-2.5 py-1 flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm">{community.rating}</span>
                    </div>
                    
                    {/* Stats row */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{community.memberCount}</div>
                          <div className="text-xs text-muted-foreground">Members</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{community.events}</div>
                          <div className="text-xs text-muted-foreground">Events</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Since</div>
                          <div className="text-xs text-muted-foreground">{community.founded}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm line-clamp-2 mb-3">{community.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      {community.tags && typeof community.tags === 'string' && 
                        community.tags.split(',').map(tag => (
                          <Badge 
                            key={tag.trim()} 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer"
                          >
                            {tag.trim()}
                          </Badge>
                        ))
                      }
                    </div>
                  </CardContent>
                  
                  {/* Card Footer */}
                  <CardFooter className="flex justify-between pt-0 pb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full gap-1.5"
                      onClick={() => navigate(`/communities/${community.id}`)}
                    >
                      <Search className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                    {community.isMember ? (
                      <Button size="sm" variant="ghost" className="rounded-full gap-1.5 font-medium bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                        <span className="mr-1">✓</span> Joined
                      </Button>
                    ) : (
                      <Button size="sm" className="rounded-full gap-1.5 font-medium shadow-md" onClick={() => handleJoinCommunity(community.id)}>
                        <Users className="h-3.5 w-3.5" />
                        Join
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-5">
            {filteredCommunities.map(community => {
              // Generate different gradients based on community id
              const bgGradients = [
                "bg-gradient-to-r from-blue-500 to-green-400",
                "bg-gradient-to-r from-purple-500 to-pink-400",
                "bg-gradient-to-r from-amber-500 to-orange-400",
                "bg-gradient-to-r from-teal-500 to-emerald-400",
                "bg-gradient-to-r from-indigo-500 to-sky-400",
                "bg-gradient-to-r from-rose-500 to-red-400"
              ];
              
              const gradientClass = bgGradients[community.id % bgGradients.length];
              const isFeatured = community.featuredTag;

              return (
                <Card 
                  key={community.id} 
                  className="group overflow-hidden rounded-xl border-muted/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  id={`community-list-card-${community.id}`}
                  data-testid={`community-list-card-${community.id}`}
                  data-component="community-list-card"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left column with gradient background */}
                    <div className={`h-36 md:h-auto md:w-1/4 ${gradientClass} relative overflow-hidden`}>
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] rotate-[20deg]">
                          <CourtPatternIcon />
                        </div>
                      </div>
                      
                      {/* Pickleball Icon and Skill Level Badge */}
                      <div className="hidden md:flex absolute top-0 left-0 right-0 p-3 justify-center">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
                          <PickleballIcon />
                          <span className="ml-1.5 font-medium text-sm">{community.skill}</span>
                        </div>
                      </div>
                      
                      {/* Rating Badge - Desktop */}
                      <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5 flex items-center">
                          <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-sm">{community.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main content */}
                    <div className="flex-1 p-5 md:p-6 relative">
                      {/* Mobile Skill Level Badge */}
                      <div className="flex md:hidden items-center mb-2">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
                          <PickleballIcon />
                          <span className="ml-1.5 font-medium">{community.skill}</span>
                        </div>
                        
                        {/* Mobile Rating */}
                        <div className="ml-auto bg-muted rounded-full px-2.5 py-1 flex items-center">
                          <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{community.rating}</span>
                        </div>
                      </div>
                      
                      {/* Featured Tag */}
                      {isFeatured && (
                        <div className="absolute top-5 right-5 z-10">
                          <Badge 
                            className={`
                              px-3 py-1.5 rounded-full font-medium shadow-md transition-all duration-300
                              ${community.featuredTag === 'Featured' ? 'bg-yellow-400 text-yellow-950' : 
                               community.featuredTag === 'Elite' ? 'bg-purple-400 text-purple-950' : 
                               'bg-blue-400 text-blue-950'}
                            `}
                          >
                            {community.featuredTag === 'Featured' ? (
                              <><Trophy className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                            ) : community.featuredTag === 'Elite' ? (
                              <><Award className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                            ) : (
                              <><Zap className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
                            )}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Title and Location */}
                      <div className="flex flex-col mb-3">
                        <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-200">
                          {community.name}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {community.location}
                        </div>
                      </div>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 md:flex md:items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{community.memberCount}</div>
                            <div className="text-xs text-muted-foreground">Members</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{community.events}</div>
                            <div className="text-xs text-muted-foreground">Events</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Since</div>
                            <div className="text-xs text-muted-foreground">{community.founded}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm mb-4 line-clamp-2">{community.description}</p>
                      
                      {/* Tags and Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {community.tags && typeof community.tags === 'string' && 
                            community.tags.split(',').map(tag => (
                              <Badge 
                                key={tag.trim()} 
                                variant="outline" 
                                className="text-xs px-2 py-0.5 bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer"
                              >
                                {tag.trim()}
                              </Badge>
                            ))
                          }
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full gap-1.5"
                            onClick={() => navigate(`/communities/${community.id}`)}
                          >
                            <Search className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                          {community.isMember ? (
                            <Button size="sm" variant="ghost" className="rounded-full gap-1.5 font-medium bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                              <span className="mr-1">✓</span> Joined
                            </Button>
                          ) : (
                            <Button size="sm" className="rounded-full gap-1.5 font-medium shadow-md" onClick={() => handleJoinCommunity(community.id)}>
                              <Users className="h-3.5 w-3.5" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default CommunityDiscoveryMockup;