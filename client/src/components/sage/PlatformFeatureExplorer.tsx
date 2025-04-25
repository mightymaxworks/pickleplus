/**
 * PKL-278651-SAGE-0013-CONCIERGE
 * Platform Feature Explorer Component
 * 
 * This component provides a visual interface for exploring and discovering
 * platform features organized by category.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BarChart4, 
  Trophy, 
  Activity, 
  Users, 
  UserCircle,
  Settings, 
  Compass,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureCategory, PlatformFeature } from '@shared/types/sage-concierge';

export function PlatformFeatureExplorer() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch platform features
  const { data: featureCategories, isLoading } = useQuery({
    queryKey: ['/api/coach/sage/concierge/features'],
    queryFn: async () => {
      const res = await fetch('/api/coach/sage/concierge/features');
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json() as Promise<FeatureCategory[]>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Search features by query
  const { data: searchResults, isLoading: isSearching } = useQuery<PlatformFeature[]>({
    queryKey: ['/api/coach/sage/concierge/search', searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/coach/sage/concierge/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to search features');
      return res.json();
    },
    enabled: searchQuery.length > 2,
    placeholderData: previousData => previousData // Instead of keepPreviousData
  });
  
  // Get icon for category
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'training':
        return <Activity className="h-5 w-5" />;
      case 'competitive':
        return <Trophy className="h-5 w-5" />;
      case 'analysis':
        return <BarChart4 className="h-5 w-5" />;
      case 'community':
        return <Users className="h-5 w-5" />;
      case 'profile':
        return <UserCircle className="h-5 w-5" />;
      case 'admin':
        return <Settings className="h-5 w-5" />;
      default:
        return <Compass className="h-5 w-5" />;
    }
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Navigate to feature
  const navigateToFeature = (feature: PlatformFeature) => {
    // Track feature navigation event - can be implemented later
    // Log click for analytics
    console.log('Feature clicked:', feature.id);
    // Navigate to feature path
    navigate(feature.path);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Compass className="w-5 h-5 mr-2 text-primary" />
          <CardTitle className="text-xl">Platform Explorer</CardTitle>
        </div>
        <CardDescription>
          Discover features and capabilities of the Pickle+ platform
        </CardDescription>
        <div className="flex w-full items-center space-x-2 mt-2">
          <Input
            placeholder="Search platform features..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Show search results if searching */}
        {searchQuery.length > 2 && (
          <div className="p-4">
            <h3 className="font-medium mb-3">Search Results</h3>
            
            {isSearching && (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            
            {!isSearching && searchResults && searchResults.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No features match your search query
              </div>
            )}
            
            {!isSearching && searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((feature) => (
                  <div 
                    key={feature.id}
                    className="p-3 border rounded-md hover:bg-muted/50 transition cursor-pointer"
                    onClick={() => navigateToFeature(feature)}
                  >
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="text-xs text-primary flex items-center mt-1">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Go to {feature.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Show categories if not searching */}
        {searchQuery.length <= 2 && (
          <Tabs defaultValue="training" className="w-full">
            <div className="px-4 pt-1">
              <TabsList className="w-full h-auto flex overflow-x-auto py-1">
                {isLoading ? (
                  <div className="flex space-x-2 px-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ) : (
                  featureCategories?.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex-shrink-0"
                    >
                      <div className="flex items-center">
                        {getCategoryIcon(category.id)}
                        <span className="ml-2">{category.name}</span>
                      </div>
                    </TabsTrigger>
                  ))
                )}
              </TabsList>
            </div>
            
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              featureCategories?.map((category) => (
                <TabsContent key={category.id} value={category.id} className="px-4 py-2 space-y-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                  
                  {category.features.map((feature) => (
                    <div 
                      key={feature.id}
                      className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigateToFeature(feature)}
                    >
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      
                      <div className="flex justify-between items-center mt-2">
                        {feature.relatedDimensions && feature.relatedDimensions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {feature.relatedDimensions.map(dimension => (
                              <span 
                                key={dimension} 
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {dimension}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {feature.primaryAction && (
                          <Button size="sm" variant="outline" className="text-xs">
                            {feature.primaryAction}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}