/**
 * PKL-278651-SAGE-0013-CONCIERGE
 * SAGE Recommendation Card Component
 * 
 * This component displays personalized recommendations from SAGE based
 * on the user's CourtIQ ratings and activity patterns.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Dumbbell, Trophy, BadgeCheck, Users, ArrowRight } from "lucide-react";
import { Recommendation, RecommendationType } from '@shared/types/sage-concierge';

export function SageRecommendationCard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<RecommendationType | 'all'>('all');
  
  // Fetch personalized recommendations from the API
  const { data: recommendations, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ['/api/coach/sage/concierge/recommendations', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/coach/sage/concierge/recommendations?type=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get icon for recommendation type
  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case 'drill':
        return <Dumbbell className="h-5 w-5" />;
      case 'tournament':
        return <Trophy className="h-5 w-5" />;
      case 'training_plan':
        return <BadgeCheck className="h-5 w-5" />;
      case 'match':
        return <Users className="h-5 w-5" />;
      case 'community':
        return <Users className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };
  
  // Get label for recommendation type
  const getTypeLabel = (type: RecommendationType): string => {
    switch (type) {
      case 'drill':
        return 'Drill';
      case 'tournament':
        return 'Tournament';
      case 'training_plan':
        return 'Training Plan';
      case 'match':
        return 'Match';
      case 'community':
        return 'Community';
      default:
        return type;
    }
  };

  // Calculate number of recommendations by type
  const countByType = recommendations?.reduce<Record<RecommendationType, number>>((acc, rec) => {
    acc[rec.type] = (acc[rec.type] || 0) + 1;
    return acc;
  }, {} as Record<RecommendationType, number>) || {};

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-primary" />
          <CardTitle className="text-xl">SAGE Recommends</CardTitle>
        </div>
        <CardDescription>
          Personalized recommendations based on your profile and goals
        </CardDescription>
      </CardHeader>
      
      {/* Filter tabs */}
      <div className="px-4 flex overflow-x-auto pb-1 gap-1">
        <Button 
          variant={activeTab === 'all' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setActiveTab('all')}
          className="text-xs"
        >
          All
        </Button>
        {Object.entries(countByType).map(([type, count]) => (
          <Button 
            key={type}
            variant={activeTab === type ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(type as RecommendationType)}
            className="text-xs whitespace-nowrap"
          >
            {getTypeLabel(type as RecommendationType)} ({count.toString()})
          </Button>
        ))}
      </div>
      
      <CardContent className="pt-2">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Unable to load recommendations at this time
          </div>
        )}
        
        {recommendations && recommendations.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No recommendations available. Try exploring different activities to generate personalized recommendations.
          </div>
        )}
        
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations
              .filter(rec => activeTab === 'all' || rec.type === activeTab)
              .slice(0, 3)
              .map((rec) => (
                <div 
                  key={`${rec.type}_${rec.id}`}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(rec.path)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-md">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {getTypeLabel(rec.type)}
                        </span>
                        {rec.dimension && (
                          <span className="text-xs bg-secondary/10 text-secondary ml-2 px-2 py-0.5 rounded-full">
                            {rec.dimension}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
      
      {recommendations && recommendations.length > 3 && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => navigate('/coach/sage?tab=recommendations')}
          >
            View all recommendations
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}