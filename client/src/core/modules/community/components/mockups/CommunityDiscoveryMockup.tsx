/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Discovery Mockup
 * 
 * This component displays a mockup of the community discovery interface.
 */
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, MapPin, Users, Calendar, Trophy, Grid3X3, 
  List, Map, SlidersHorizontal, Filter 
} from 'lucide-react';

// Example community data for the mockup
const EXAMPLE_COMMUNITIES = [
  {
    id: 1,
    name: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200",
    memberCount: 342,
    location: "Seattle, WA",
    events: 5,
    tags: ["Competitive", "All Levels", "Weekly Matches"],
    description: "The largest pickleball community in Seattle with regular events and training sessions for all skill levels."
  },
  {
    id: 2,
    name: "Portland Pickle Smashers",
    image: "https://via.placeholder.com/300x200",
    memberCount: 187,
    location: "Portland, OR",
    events: 3,
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
    tags: ["Tournaments", "Advanced", "Training"],
    description: "Focused on tournament preparation, advanced drills, and competitive play for serious players."
  },
  {
    id: 4,
    name: "Denver Pickleball Network",
    image: "https://via.placeholder.com/300x200",
    memberCount: 224,
    location: "Denver, CO",
    events: 4,
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
    tags: ["Indoor", "Year-round", "All Levels"],
    description: "Year-round indoor pickleball in the Chicago area with regular play for all skill levels."
  }
];

const CommunityDiscoveryMockup: React.FC = () => {
  const [viewType, setViewType] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCommunities = EXAMPLE_COMMUNITIES.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Discover Communities</h2>
        <p className="text-muted-foreground">
          Find and join pickleball communities based on your location, interests, and skill level.
        </p>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto w-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="flex border rounded-md">
          <Button 
            variant={viewType === 'grid' ? "secondary" : "ghost"} 
            className="rounded-r-none" 
            onClick={() => setViewType('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewType === 'list' ? "secondary" : "ghost"} 
            className="rounded-none border-x"
            onClick={() => setViewType('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewType === 'map' ? "secondary" : "ghost"} 
            className="rounded-l-none"
            onClick={() => setViewType('map')}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
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
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(community => (
              <Card key={community.id} className="overflow-hidden">
                <div className="h-48 bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">{community.name}</h3>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {community.location}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{community.memberCount} members</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{community.events} events</span>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{community.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {community.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/20 pt-3">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Join</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {filteredCommunities.map(community => (
              <Card key={community.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="h-48 md:h-auto md:w-1/3 lg:w-1/4 bg-muted"></div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{community.name}</h3>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {community.location}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{community.memberCount} members</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{community.events} events</span>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{community.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {community.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Map View</h3>
              <p className="text-muted-foreground max-w-md">
                This would display a map with community locations pinned.
                Users could browse based on proximity and explore their local area.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityDiscoveryMockup;