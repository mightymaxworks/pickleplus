import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchSDK } from '@/lib/sdk/matchSDK';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';

export default function DailyMatchLimits() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/match/daily-limits'],
    queryFn: matchSDK.getDailyMatchLimits
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Daily Match Limits</CardTitle>
          <CardDescription>Loading your match information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Daily Match Limits</CardTitle>
          <CardDescription>Unable to load match limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate total matches played today
  const matchesPlayed = data.dailyMatchCount;
  const maxFullPointMatches = 3;
  const max75PointMatches = 3;
  const max50PointMatches = 4;
  
  // Determine which tier the user is currently in
  let currentTier = 'tier1';
  if (matchesPlayed > 10) {
    currentTier = 'tier4';
  } else if (matchesPlayed > 6) {
    currentTier = 'tier3';
  } else if (matchesPlayed > 3) {
    currentTier = 'tier2';
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">Daily Match Limits</CardTitle>
          <Badge variant={data.currentMultiplier === 100 ? "default" : "outline"}>
            {data.currentMultiplier}% Points
          </Badge>
        </div>
        <CardDescription>You've played {matchesPlayed} matches today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Tier 1: 100% Points</span>
              <span>{Math.min(matchesPlayed, maxFullPointMatches)}/{maxFullPointMatches}</span>
            </div>
            <Progress 
              value={Math.min(100, (Math.min(matchesPlayed, maxFullPointMatches) / maxFullPointMatches) * 100)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Tier 2: 75% Points</span>
              <span>{Math.max(0, Math.min(matchesPlayed - maxFullPointMatches, max75PointMatches))}/{max75PointMatches}</span>
            </div>
            <Progress 
              value={Math.min(100, (Math.max(0, Math.min(matchesPlayed - maxFullPointMatches, max75PointMatches)) / max75PointMatches) * 100)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Tier 3: 50% Points</span>
              <span>{Math.max(0, Math.min(matchesPlayed - (maxFullPointMatches + max75PointMatches), max50PointMatches))}/{max50PointMatches}</span>
            </div>
            <Progress 
              value={Math.min(100, (Math.max(0, Math.min(matchesPlayed - (maxFullPointMatches + max75PointMatches), max50PointMatches)) / max50PointMatches) * 100)} 
              className="h-2"
            />
          </div>
          
          <div className="pt-2 text-sm text-muted-foreground">
            {currentTier === 'tier4' ? (
              <span>You're now earning 25% points for additional matches today</span>
            ) : (
              <span>Play more matches to increase your XP and rating!</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}