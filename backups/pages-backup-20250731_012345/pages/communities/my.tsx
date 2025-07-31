/**
 * PKL-278651-COMM-0006-HUB-UI
 * My Communities Page
 * 
 * This page displays communities that the current user is a member of
 * using the same modern design patterns as the main communities page.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { CommunityGrid } from "@/components/community/CommunityGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useCommunities } from "@/lib/hooks/useCommunity";
import { CommunityMenu } from "@/components/community/CommunityMenu";
import { CommunityProvider } from "@/lib/providers/CommunityProvider";
import { 
  CourtLinesBackground, 
  DecorativeElements,
  CommunityHeader
} from "@/components/community/CommunityUIComponents";
import { 
  Search, 
  PlusCircle, 
  ArrowRight, 
  Users, 
  Calendar,
  Star
} from "lucide-react";
import type { Community } from "@/types/community";

export default function MyCommunitiesPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch my communities - temporarily using all communities as placeholder
  // This will be replaced with actual 'my communities' endpoint once available
  const { data: communities, isLoading } = useCommunities({
    enabled: true,
    limit: 6
  });
  
  // Types for community with user role information
  interface EnhancedCommunity extends Community {
    role?: string;  // Role of the current user in this community
  }
  
  // Filter communities based on search query
  const filteredCommunities = communities?.filter((community: Community) => {
    if (!searchQuery) return true;
    
    return (
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (community.location && community.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (community.tags && community.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }) || [];
  
  // Mock user role data for demonstration
  // In production, this would come from the API with actual user roles
  const adminCommunities = communities?.slice(0, 1).map(c => ({...c, role: 'admin'})) || [];
  const memberCommunities = communities?.slice(1, 3).map(c => ({...c, role: 'member'})) || [];
  
  // Filter based on active tab
  const displayedCommunities = activeTab === 'all' 
    ? filteredCommunities 
    : activeTab === 'admin' 
      ? adminCommunities.filter((c) => 
          filteredCommunities.some(fc => fc.id === c.id)
        )
      : memberCommunities.filter((c) => 
          filteredCommunities.some(fc => fc.id === c.id)
        );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleCommunityCreate = () => {
    navigate("/communities/create");
  };
  
  return (
    <CommunityProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#f5f8ff] via-[#f0f9ff] to-[#edfff1] dark:from-[#121826] dark:via-[#111a22] dark:to-[#0f1c11] -z-10"></div>
        <CourtLinesBackground />
        
        {/* Decorative Elements */}
        <DecorativeElements />
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          {/* Community Header Banner */}
          <CommunityHeader 
            title="My Communities"
            subtitle="Explore communities you've joined and manage those you administer"
          />
          
          {/* Community Navigation */}
          <div className="mb-8">
            <CommunityMenu activeTab="my" />
          </div>
        
        {/* Main Content */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <form className="flex-1" onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search my communities..."
                className="pl-9 bg-background/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <Button onClick={handleCommunityCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </div>
        
        {/* Community Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>All</span>
              {communities?.length ? (
                <Badge variant="secondary" className="ml-1">
                  {communities.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span>Admin</span>
              {adminCommunities.length ? (
                <Badge variant="secondary" className="ml-1">
                  {adminCommunities.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="member" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Member</span>
              {memberCommunities.length ? (
                <Badge variant="secondary" className="ml-1">
                  {memberCommunities.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : displayedCommunities && displayedCommunities.length > 0 ? (
              <CommunityGrid communities={displayedCommunities} />
            ) : (
              <div className="text-center py-16 bg-card/70 backdrop-blur-sm rounded-xl border border-muted/40">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">No Communities Found</h3>
                
                {searchQuery ? (
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No communities match your search criteria. Try adjusting your search terms.
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You haven't joined any communities yet. Communities are a great way to connect with other players.
                    </p>
                    
                    <Button onClick={() => navigate("/communities")}>
                      Browse Communities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="admin" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : displayedCommunities && displayedCommunities.length > 0 ? (
              <CommunityGrid communities={displayedCommunities} />
            ) : (
              <div className="text-center py-16 bg-card/70 backdrop-blur-sm rounded-xl border border-muted/40">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">No Admin Communities Found</h3>
                
                {searchQuery ? (
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No communities match your search criteria. Try adjusting your search terms.
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You don't have admin or moderator privileges in any communities yet.
                    </p>
                    
                    <Button onClick={handleCommunityCreate}>
                      Create Community
                      <PlusCircle className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="member" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : displayedCommunities && displayedCommunities.length > 0 ? (
              <CommunityGrid communities={displayedCommunities} />
            ) : (
              <div className="text-center py-16 bg-card/70 backdrop-blur-sm rounded-xl border border-muted/40">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">No Member Communities Found</h3>
                
                {searchQuery ? (
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No communities match your search criteria. Try adjusting your search terms.
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You haven't joined any communities as a regular member yet.
                    </p>
                    
                    <Button onClick={() => navigate("/communities")}>
                      Browse Communities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </CommunityProvider>
  );
}