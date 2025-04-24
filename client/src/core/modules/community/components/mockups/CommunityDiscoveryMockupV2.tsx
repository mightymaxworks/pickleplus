/**
 * @component CommunityDiscoveryMockupV2
 * @layer UI
 * @module Community
 * @sprint PKL-278651-COMM-0017-SEARCH
 * @version 3.0.0
 * @lastModified 2025-04-18
 * 
 * @description
 * Enhanced community discovery interface with advanced search, filtering,
 * and recommendation features. Implements the new Framework 5.1 components.
 * 
 * @parent CommunitiesPage (Tab Content)
 * @children
 * - AdvancedCommunitySearch
 * - CommunitySearchResults
 * 
 * @visual
 * - Comprehensive search interface with expandable filters
 * - Advanced filtering options (skill level, event types, etc.)
 * - Sorting capabilities
 * - Recommendation engine integration
 * - Responsive grid/list view
 * 
 * @changes
 * - Replaced basic search with comprehensive AdvancedCommunitySearch
 * - Integrated server-side filtering and sorting
 * - Added recommendation engine support
 * - Improved responsive design
 * 
 * @preserves
 * - Card design elements
 * - Community information display
 * - Grid/List view toggle
 */
import React, { useState } from 'react';
import { AdvancedCommunitySearch } from '@/components/community/AdvancedCommunitySearch';
import { CommunitySearchResults } from '@/components/community/CommunitySearchResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useMyCommunityIds } from '@/lib/hooks/useCommunity';
import { MapPin, Users, Search, Filter, Star } from 'lucide-react';

/**
 * Enhanced community discovery component with advanced search functionality
 */
const CommunityDiscoveryMockupV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my-communities' | 'recommended'>('all');
  const { user } = useAuth();
  const { data: myCommunityIds } = useMyCommunityIds();
  
  // Base search params that will be passed to the search results component
  const getSearchParams = () => {
    switch (activeTab) {
      case 'my-communities':
        return { 
          includeIds: myCommunityIds || [] 
        };
      case 'recommended':
        return { 
          recommendForUser: user?.id,
          popular: true
        };
      default:
        return {};
    }
  };
  
  return (
    <div 
      className="space-y-6"
      id="community-discovery-v2-container"
      data-testid="community-discovery-v2"
      data-component="community-discovery-mockup-v2"
    >
      {/* Tab Navigation */}
      <div className="flex justify-center mb-2">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all" className="flex flex-col items-center sm:flex-row sm:gap-2 p-1 sm:p-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">All</span>
              <span className="text-[10px] leading-tight font-normal mt-0.5 sm:hidden">All</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="my-communities" 
              className="flex flex-col items-center sm:flex-row sm:gap-2 p-1 sm:p-2"
              disabled={!user}
            >
              <div className="relative">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {myCommunityIds && myCommunityIds.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-1.5 -right-1.5 h-3 w-3 p-0 flex items-center justify-center text-[8px]">
                    {myCommunityIds.length}
                  </Badge>
                )}
              </div>
              <span className="hidden sm:inline">My Communities</span>
              <span className="text-[10px] leading-tight font-normal mt-0.5 sm:hidden">Mine</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="recommended" 
              className="flex flex-col items-center sm:flex-row sm:gap-2 p-1 sm:p-2"
              disabled={!user}
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Recommended</span>
              <span className="text-[10px] leading-tight font-normal mt-0.5 sm:hidden">For You</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 relative">
            <CommunitySearchResults 
              initialSearch={getSearchParams()}
              showAdvancedSearch={true}
            />
          </TabsContent>
          
          <TabsContent value="my-communities" className="mt-0 relative">
            {user ? (
              <CommunitySearchResults 
                initialSearch={getSearchParams()}
                showAdvancedSearch={true}
              />
            ) : (
              <div className="text-center p-12 border rounded-lg shadow-sm bg-muted/10">
                <h3 className="text-lg font-medium mb-2">Please Sign In</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view your communities.
                </p>
                <Button>Sign In</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-0 relative">
            {user ? (
              <CommunitySearchResults 
                initialSearch={getSearchParams()}
                showAdvancedSearch={true}
              />
            ) : (
              <div className="text-center p-12 border rounded-lg shadow-sm bg-muted/10">
                <h3 className="text-lg font-medium mb-2">Please Sign In</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view recommended communities.
                </p>
                <Button>Sign In</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sub-component for displaying fast filters (skills, location, etc.) */}
      <div className="rounded-lg border bg-card p-4 shadow-sm mt-4">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          Quick Filters
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Popular Skill Levels</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                Beginner
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                Intermediate
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                Advanced
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                All Levels
              </Badge>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Popular Locations</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground flex items-center text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                <span className="truncate">Seattle</span>
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground flex items-center text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                <span className="truncate">New York</span>
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground flex items-center text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                <span className="truncate">Los Angeles</span>
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground flex items-center text-[10px] sm:text-xs py-0 h-5 truncate max-w-[80px] sm:max-w-[120px]">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                <span className="truncate">Chicago</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDiscoveryMockupV2;