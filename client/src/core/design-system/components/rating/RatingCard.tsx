/**
 * RatingCard Component
 * 
 * A comprehensive card displaying a player's rating information with history and trends.
 * Part of the CourtIQ™ Design System.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingBadge } from "./RatingBadge";
import { useRatingData, useRatingDetail } from "../../hooks/useRatingData";
import { colors } from "../../tokens/colors";
import { textStyles } from "../../tokens/typography";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Medal, Trophy, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface RatingCardProps {
  userId: number;
  className?: string;
  showDetailed?: boolean;
  initialFormat?: string;
}

/**
 * A detailed card component for displaying a player's rating information.
 * 
 * Features:
 * - Multiple format support (Singles, Doubles, Mixed)
 * - Rating history visualization
 * - Tier progression indicators
 * - Confidence level display
 */
export function RatingCard({
  userId,
  className,
  showDetailed = true,
  initialFormat = "Mixed Doubles",
}: RatingCardProps) {
  // Get all ratings for this user
  const { data: ratings, isLoading: ratingsLoading } = useRatingData(userId);
  
  // State for the currently selected format
  const [selectedFormat, setSelectedFormat] = React.useState(initialFormat);
  
  // Get detailed rating info for the selected format
  const { data: ratingDetail, isLoading: detailLoading } = useRatingDetail(
    userId, 
    selectedFormat
  );
  
  // Find the selected rating from all ratings
  const selectedRating = ratings?.find((r: any) => r.format === selectedFormat);
  
  // Format options for the tabs
  const formatOptions = [
    { value: "Singles", label: "Singles" },
    { value: "Doubles", label: "Doubles" },
    { value: "Mixed Doubles", label: "Mixed" },
  ];

  // Calculate rating trend (up, down, or neutral)
  const calculateTrend = () => {
    if (!ratingDetail?.history || ratingDetail.history.length < 2) return "neutral";
    
    // Sort history by date
    const sortedHistory = [...ratingDetail.history]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
    // Get last two ratings
    const lastTwo = sortedHistory.slice(0, 2);
    if (lastTwo.length < 2) return "neutral";
    
    const diff = lastTwo[0].newRating - lastTwo[1].newRating;
    if (diff > 0) return "up";
    if (diff < 0) return "down";
    return "neutral";
  };
  
  const ratingTrend = calculateTrend();
  
  // Get the trend icon based on the current trend
  const getTrendIcon = () => {
    switch (ratingTrend) {
      case "up":
        return <TrendingUp size={16} className="text-accent-DEFAULT" />;
      case "down":
        return <TrendingDown size={16} className="text-error-DEFAULT" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };
  
  // Calculate progress to next tier
  const calculateNextTierProgress = () => {
    if (!selectedRating || !ratingDetail) return 0;
    
    const currentRating = selectedRating.rating;
    const currentTier = ratingDetail.tier;
    
    // If we're at the max rating tier
    if (!currentTier.maxRating) return 100;
    
    const tierRange = currentTier.maxRating - currentTier.minRating;
    const playerProgress = currentRating - currentTier.minRating;
    
    return Math.min(Math.round((playerProgress / tierRange) * 100), 100);
  };
  
  // Get next tier info
  const getNextTier = () => {
    if (!ratingDetail) return null;
    
    // This would require querying all tiers and finding the next one
    // For now, we'll return a placeholder
    const currentTierOrder = ratingDetail.tier.order;
    const nextTierOrder = currentTierOrder + 1;
    
    // Placeholder until we have the tiers API endpoint
    return {
      name: "Next Tier",
      minRating: ratingDetail.tier.maxRating,
      pointsNeeded: ratingDetail.tier.maxRating - (selectedRating?.rating || 0),
    };
  };
  
  // Format the last match date
  const formatLastMatchDate = () => {
    if (!selectedRating?.lastMatchDate) return "No matches yet";
    return format(new Date(selectedRating.lastMatchDate), "MMM d, yyyy");
  };
  
  // Loading state
  if (ratingsLoading) {
    return (
      <Card className={cn("border-l-4 border-l-secondary-DEFAULT", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }
  
  // No rating data
  if (!ratings || ratings.length === 0) {
    return (
      <Card className={cn("border-l-4 border-l-secondary-DEFAULT", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No rating data available yet.</p>
          <p className="text-sm mt-2">Play matches to earn your first rating!</p>
        </CardContent>
      </Card>
    );
  }
  
  // Simplified version of the card
  if (!showDetailed) {
    return (
      <Card className={cn("border-l-4 border-l-secondary-DEFAULT", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <RatingBadge 
                tier={selectedRating?.tier || "Unrated"} 
                rating={selectedRating?.rating || 0}
                format={selectedFormat}
                size="lg"
                showRating
              />
              <p className="text-sm text-gray-500 mt-1">
                {selectedRating?.matchesPlayed || 0} matches played
              </p>
            </div>
            <div className="flex items-center">
              {getTrendIcon()}
              <ChevronRight size={16} className="ml-1 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Full detailed card
  return (
    <Card className={cn("border-l-4 border-l-secondary-DEFAULT", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>CourtIQ™ Rating</span>
          <Trophy className="h-5 w-5 text-secondary-DEFAULT" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs defaultValue={selectedFormat} onValueChange={setSelectedFormat}>
          <TabsList className="mb-3 w-full grid grid-cols-3">
            {formatOptions.map(format => (
              <TabsTrigger key={format.value} value={format.value}>
                {format.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {formatOptions.map(format => (
            <TabsContent key={format.value} value={format.value}>
              <div className="space-y-4">
                {/* Rating and tier */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold mr-2">
                        {selectedRating?.rating || "---"}
                      </span>
                      {getTrendIcon()}
                    </div>
                    <RatingBadge 
                      tier={selectedRating?.tier || "Unrated"} 
                      rating={selectedRating?.rating || 0}
                      format={selectedFormat}
                      size="md"
                    />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <Medal className="h-4 w-4 mr-1 text-secondary-400" />
                      <span className="text-sm font-medium">
                        Confidence: {selectedRating?.confidenceLevel || 0}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatLastMatchDate()}
                    </p>
                  </div>
                </div>
                
                {/* Tier progress */}
                {!detailLoading && ratingDetail && (
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium">Tier progress</span>
                      <span className="text-gray-500">{calculateNextTierProgress()}%</span>
                    </div>
                    <Progress 
                      value={calculateNextTierProgress()} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between text-xs mt-2">
                      <span>{ratingDetail.tier.minRating}</span>
                      <span className="font-medium text-secondary-DEFAULT">
                        {selectedRating?.rating || 0}
                      </span>
                      <span>{ratingDetail.tier.maxRating || "∞"}</span>
                    </div>
                    
                    {getNextTier() && (
                      <p className="text-xs text-gray-500 mt-2">
                        {getNextTier()?.pointsNeeded} points until <span className="font-medium">{getNextTier()?.name}</span>
                      </p>
                    )}
                  </div>
                )}
                
                {/* Matches played */}
                <div className="bg-gray-50 rounded-md p-3 mt-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold">{selectedRating?.matchesPlayed || 0}</p>
                      <p className="text-xs text-gray-500">Matches</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {ratingDetail?.history?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Rating Changes</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 pt-0">
        <p>Updated automatically after every match</p>
      </CardFooter>
    </Card>
  );
}