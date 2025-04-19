/**
 * PKL-278651-COMM-0022-DISC
 * Enhanced Community Discovery Component
 * 
 * This component provides an enhanced discovery experience for communities,
 * showing trending, recommended, and featured communities in separate sections.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { CommunityCard } from "./CommunityCard";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Compass, 
  Trophy, 
  Calendar, 
  Search, 
  Filter,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

export function EnhancedCommunityDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // Fetch communities from the discover endpoint
  const { data: discoverData, isLoading, error } = useQuery<{
    trending: Community[];
    recommended: Community[];
    featured: Community[];
    new: Community[];
  }>({
    queryKey: ['/api/communities/discover'],
    refetchOnWindowFocus: false,
  });
  
  // Search query function
  const searchCommunities = async (query: string) => {
    try {
      const response = await apiRequest("GET", `/api/communities?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching communities:", error);
      return [];
    }
  };
  
  // Search results query
  const { 
    data: searchResults, 
    isLoading: isSearching,
    refetch: refetchSearch 
  } = useQuery<Community[]>({
    queryKey: ['/api/communities', searchQuery],
    queryFn: () => searchCommunities(searchQuery),
    enabled: searchQuery.length > 0,
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      refetchSearch();
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };
  
  // If there's an error loading the data
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load communities. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Discover Communities</h2>
        </div>
        
        <Tabs defaultValue="trending">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" /> Trending
            </TabsTrigger>
            <TabsTrigger value="recommended">
              <Compass className="h-4 w-4 mr-2" /> For You
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Trophy className="h-4 w-4 mr-2" /> Featured
            </TabsTrigger>
            <TabsTrigger value="new">
              <Calendar className="h-4 w-4 mr-2" /> New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl border border-muted/50 overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between pt-3">
                      <Skeleton className="h-9 w-16" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discover Communities</h2>
        <div className="flex space-x-3">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3" />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 h-7 w-7"
                    onClick={clearSearch}
                  >
                    <span className="sr-only">Clear search</span>
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowSearch(true)}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </>
          )}
        </div>
      </div>
      
      {showSearch && searchQuery && searchResults ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {searchResults.length > 0
              ? `Found ${searchResults.length} communities for "${searchQuery}"`
              : `No communities found for "${searchQuery}"`}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {searchResults.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
          
          {searchResults.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={clearSearch}>
                Back to Discover
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="trending">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" /> Trending
            </TabsTrigger>
            <TabsTrigger value="recommended">
              <Compass className="h-4 w-4 mr-2" /> For You
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Trophy className="h-4 w-4 mr-2" /> Featured
            </TabsTrigger>
            <TabsTrigger value="new">
              <Calendar className="h-4 w-4 mr-2" /> New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="mt-6">
            {discoverData?.trending && discoverData.trending.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {discoverData.trending.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full p-4 inline-block mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No trending communities</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Check back later to see which communities are gaining popularity in the Pickle+ community.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-6">
            {discoverData?.recommended && discoverData.recommended.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {discoverData.recommended.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full p-4 inline-block mb-4">
                  <Compass className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Personalized recommendations coming soon</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Join more communities and participate in events to get personalized recommendations tailored to your interests.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="featured" className="mt-6">
            {discoverData?.featured && discoverData.featured.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {discoverData.featured.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full p-4 inline-block mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No featured communities</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Featured communities are curated by the Pickle+ team and include official partners and sponsored groups.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            {discoverData?.new && discoverData.new.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {discoverData.new.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full p-4 inline-block mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No new communities</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Be the first to create a new community and invite others to join!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}