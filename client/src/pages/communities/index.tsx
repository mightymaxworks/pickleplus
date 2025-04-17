/**
 * PKL-278651-COMM-0006-HUB-UI
 * Communities Discovery Page
 * 
 * This page allows users to discover and browse communities.
 * Enhanced with the modern design from the test/community page,
 * featuring improved visual elements and interactions.
 */

import React, { useState, useEffect } from "react";
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
import { 
  Loader2, Search, Plus, Users, Filter, MapPin, Activity, 
  FlaskConical, Beaker, PartyPopper, TestTube, Zap,
  Target, Trophy, Star, Bell
} from "lucide-react";
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

// Court Lines Background Component (from TestCommunityPage)
const CourtLinesBackground = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="courtLines" width="100" height="100" patternUnits="userSpaceOnUse">
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
        <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#courtLines)" />
    </svg>
  </div>
);

// Pickleball SVG Icon (from TestCommunityPage)
const PickleballIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function CommunitiesPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillLevel, setSkillLevel] = useState("all");
  const [location, setLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  
  // Show confetti on initial load
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };
  
  return (
    <CommunityProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#f5f8ff] via-[#f0f9ff] to-[#edfff1] dark:from-[#121826] dark:via-[#111a22] dark:to-[#0f1c11] -z-10"></div>
        <CourtLinesBackground />
        
        {/* Floating Decoration Elements */}
        <div className="hidden lg:block absolute top-40 -left-6 w-12 h-12 rounded-full bg-yellow-300/30 backdrop-blur-xl animate-pulse-slow"></div>
        <div className="hidden lg:block absolute bottom-20 right-10 w-20 h-20 rounded-full bg-green-300/20 backdrop-blur-xl animate-float"></div>
        <div className="hidden lg:block absolute top-1/4 right-16 w-8 h-8 rounded-full bg-blue-300/20 backdrop-blur-md animate-float-delay"></div>
        
        {/* Add the new Community Menu */}
        <CommunityMenu 
          activeTab="discover" 
          onChange={handleMenuChange}
          showConfettiEffect={true}
        />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-primary/5 p-5 mb-8 rounded-2xl border border-primary/20 shadow-sm backdrop-blur-sm">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-primary">PKL-278651-COMM-0006-HUB-UI</h2>
            </div>
            
            <div className="flex items-start gap-2 pl-12">
              <Beaker className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Discover pickleball communities, connect with players, and participate in local events.
              </p>
            </div>
          </div>
          
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <div className="relative mr-5 h-12 w-12 rotate-12 flex items-center justify-center text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400 rounded-xl shadow-md">
                <PickleballIcon />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping-slow opacity-70"></div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-primary">
                    Community Features
                  </h1>
                  <PartyPopper className="h-5 w-5 text-yellow-500 animate-wiggle" />
                </div>
                <p className="text-sm text-muted-foreground">Connect with other players and grow the pickleball community</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center px-3 py-1.5 rounded-full bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 gap-1.5 border border-yellow-400/30 shadow-sm">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Interactive Features</span>
              </div>
              
              <div className="flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary gap-1.5 border border-primary/30 shadow-sm">
                <TestTube className="h-4 w-4" />
                <span className="text-sm font-medium">Modern Design</span>
              </div>
            </div>
          </div>
          
          {/* Main Content Card */}
          <div className="relative bg-card/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-muted/60 mb-8">
            {/* Corner Decorations */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-br-xl rounded-tl-xl transform rotate-45 shadow-sm"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-br-xl rounded-tl-xl transform rotate-45 shadow-sm"></div>
            
            {/* Subtle Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/10 dark:to-white/0 rounded-2xl"></div>
            
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Find Communities</h2>
                <p className="text-sm text-muted-foreground">
                  Search for communities by name, location, skill level, and more.
                </p>
              </div>
              
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
            </div>
            
            {/* Feature Badge Pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium">
                <Target className="h-3 w-3 mr-1" />
                <span>Community Goals</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <Trophy className="h-3 w-3 mr-1" />
                <span>Achievements</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium">
                <Activity className="h-3 w-3 mr-1" />
                <span>Activity Feed</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <Bell className="h-3 w-3 mr-1" />
                <span>Notifications</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <Star className="h-3 w-3 mr-1" />
                <span>Featured Communities</span>
              </div>
            </div>
            
            {/* Community Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4 bg-muted/50">
                <TabsTrigger value="all">All Communities</TabsTrigger>
                <TabsTrigger value="my">My Communities</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="pt-2">
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
              
              <TabsContent value="my" className="pt-2">
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
              
              <TabsContent value="recommended" className="pt-2">
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
          
          {/* Create Community Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20 shadow-md mb-6">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Create Your Own Community</h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Start your own community, invite players, organize events, and grow the pickleball ecosystem.
                </p>
              </div>
              
              <Button onClick={handleCreateCommunity} className="bg-primary hover:bg-primary/90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Button>
            </div>
          </div>
        </div>
        
        {/* Add animation keyframes */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes ping-slow {
              0% {
                transform: scale(1);
                opacity: 0.8;
              }
              50% {
                transform: scale(1.5);
                opacity: 0.4;
              }
              100% {
                transform: scale(1);
                opacity: 0.8;
              }
            }
            
            @keyframes float {
              0% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
              100% {
                transform: translateY(0px);
              }
            }
            
            @keyframes float-delay {
              0% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-8px);
              }
              100% {
                transform: translateY(0px);
              }
            }
            
            @keyframes wiggle {
              0% {
                transform: rotate(0deg);
              }
              25% {
                transform: rotate(10deg);
              }
              50% {
                transform: rotate(-7deg);
              }
              75% {
                transform: rotate(5deg);
              }
              100% {
                transform: rotate(0deg);
              }
            }
          `
        }} />
      </div>
    </CommunityProvider>
  );
}