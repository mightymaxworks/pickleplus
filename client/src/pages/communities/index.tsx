/**
 * PKL-278651-COMM-0006-HUB-UI
 * Communities Discovery Page
 * 
 * This page allows users to discover and browse communities.
 * Enhanced with the new horizontal menu navigation system.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCommunities } from "../../lib/hooks/useCommunity";
import { CommunityProvider } from "../../lib/providers/CommunityProvider";
import { CommunityGrid } from "../../components/community/CommunityGrid";
import { CommunityMenu } from "../../components/community/CommunityMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Users, Filter, MapPin, Activity } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

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

// Court Pattern SVG for backgrounds (inspired by mockup)
const CourtPatternIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export default function CommunitiesPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillLevel, setSkillLevel] = useState("all");
  const [location, setLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
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
  
  // Handle menu tab change
  const handleMenuChange = (tabId: string) => {
    if (tabId === 'discover') {
      // We're already on the discover page
    } else if (tabId === 'create') {
      handleCreateCommunity();
    } else if (tabId === 'events' || tabId === 'news' || tabId === 'profile') {
      toast({
        title: "Coming Soon",
        description: `The ${tabId} feature will be available in an upcoming update.`,
        duration: 3000,
      });
    }
  };
  
  return (
    <CommunityProvider>
      {/* Add the new Community Menu */}
      <CommunityMenu 
        activeTab="discover" 
        onChange={handleMenuChange}
      />
      
      <div className="container py-6 max-w-7xl">
        {/* Visual Hero Section inspired by the mockup */}
        <div className="relative mb-10 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
          {/* Visual elements */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl opacity-70"></div>
          <div className="absolute -left-10 bottom-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl"></div>
          <div className="absolute right-1/4 bottom-0 w-16 h-16 bg-blue-400/10 rounded-full blur-xl"></div>
          
          {/* Pattern elements */}
          <div className="absolute top-10 right-10 opacity-20">
            <div className="w-[150px] h-[150px] rotate-12">
              <CourtPatternIcon />
            </div>
          </div>
          
          {/* Header content */}
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Discover Communities
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Connect with other pickleball players, join communities based on your interests,
                  and participate in local events.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/15 transition-colors text-xs text-primary border-none">
                    <Users className="h-3 w-3 mr-1" />
                    {communities?.length || 0}+ Communities
                  </Badge>
                  <Badge variant="secondary" className="bg-amber-500/10 hover:bg-amber-500/15 transition-colors text-xs text-amber-600 dark:text-amber-400 border-none">
                    <MapPin className="h-3 w-3 mr-1" />
                    {LOCATIONS.length - 1}+ Locations
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors text-xs text-emerald-600 dark:text-emerald-400 border-none">
                    <Activity className="h-3 w-3 mr-1" />
                    All Skill Levels
                  </Badge>
                </div>
              </div>
              
              <Button onClick={handleCreateCommunity} className="md:self-start bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Button>
            </div>
          </div>
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