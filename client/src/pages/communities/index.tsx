/**
 * PKL-278651-COMM-0006-HUB-UI
 * Communities Discovery Page
 * 
 * This page allows users to discover and browse communities.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCommunities } from "../../lib/hooks/useCommunity";
import { CommunityProvider } from "../../lib/providers/CommunityProvider";
import { CommunityGrid } from "../../components/community/CommunityGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Plus, Users, Filter } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";

// Skill level options for filtering
const SKILL_LEVELS = [
  { value: "all", label: "All Skill Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
];

// Location options for filtering (example)
const LOCATIONS = [
  { value: "all", label: "All Locations" },
  { value: "West", label: "West" },
  { value: "East", label: "East" },
  { value: "Central", label: "Central" },
  { value: "North", label: "North" },
  { value: "South", label: "South" },
];

export default function CommunitiesPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillLevel, setSkillLevel] = useState("all");
  const [location, setLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Debounce search to prevent too many API calls
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  // Fetch communities based on filters
  const { data: communities, isLoading, refetch } = useCommunities({
    query: debouncedQuery,
    skillLevel: skillLevel === "all" ? "" : skillLevel,
    location: location === "all" ? "" : location,
  });
  
  // Handle creating a new community
  const handleCreateCommunity = () => {
    navigate("/communities/create");
  };
  
  // Fetch the user's memberships to highlight communities they've joined
  // This would typically come from a user context or API call
  const userMemberships: number[] = []; // Example: [1, 3, 5];
  
  return (
    <CommunityProvider>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
            <p className="text-muted-foreground mt-1">
              Connect with other pickleball players and join communities.
            </p>
          </div>
          
          <Button onClick={handleCreateCommunity} className="md:self-start">
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Find Communities</CardTitle>
            <CardDescription>
              Search for communities by name, location, skill level, and more.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:w-2/5">
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Communities</TabsTrigger>
            <TabsTrigger value="my">My Communities</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <CommunityGrid 
                communities={communities || []} 
                userMemberships={userMemberships}
              />
            )}
          </TabsContent>
          
          <TabsContent value="my" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <CommunityGrid 
                communities={(communities || []).filter(c => 
                  userMemberships.includes(c.id)
                )} 
                userMemberships={userMemberships}
              />
            )}
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              // For now, recommendations are just the same as all communities
              // In a real implementation, this would be a different API call
              <CommunityGrid 
                communities={communities || []} 
                userMemberships={userMemberships}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CommunityProvider>
  );
}