/**
 * TierBenefitsCard component
 * Displays the benefits unlocked at a specific tier
 * 
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMasteryTierStatus } from '@/hooks/use-mastery-tier-status';
import { useTierByName } from '@/hooks/use-mastery-tiers';
import { 
  CheckCircle2, 
  XCircle,
  Video,
  Activity,
  BookOpen,
  Users,
  BarChart,
  Clock,
  Medal,
  FileText,
  Calendar,
  Award
} from 'lucide-react';

// Feature to icon mapping
const featureIcons = {
  match_recording: BookOpen,
  basic_statistics: Activity,
  advanced_statistics: BarChart,
  performance_analysis: Activity,
  match_history_insights: Clock,
  community_features: Users,
  basic_coaching_tools: BookOpen,
  advanced_coaching_tools: BookOpen,
  tournament_tools: Medal,
  video_analysis: Video,
  exclusive_events: Calendar,
  skill_development_tips: Award,
};

// Get human-readable feature name
const getFeatureName = (featureId: string): string => {
  const nameMap: Record<string, string> = {
    match_recording: "Match Recording",
    basic_statistics: "Basic Statistics",
    advanced_statistics: "Advanced Statistics",
    performance_analysis: "Performance Analysis",
    match_history_insights: "Match History Insights",
    community_features: "Community Features",
    basic_coaching_tools: "Basic Coaching Tools",
    advanced_coaching_tools: "Advanced Coaching Tools",
    tournament_tools: "Tournament Tools",
    video_analysis: "Video Analysis",
    exclusive_events: "Exclusive Events",
    skill_development_tips: "Skill Development Tips",
  };
  
  return nameMap[featureId] || featureId;
};

// Get feature description
const getFeatureDescription = (featureId: string): string => {
  const descriptionMap: Record<string, string> = {
    match_recording: "Record and track your match results",
    basic_statistics: "View fundamental performance metrics",
    advanced_statistics: "Access detailed performance breakdowns",
    performance_analysis: "Get insights on your play patterns",
    match_history_insights: "Analyze trends across your match history",
    community_features: "Connect with other players",
    basic_coaching_tools: "Access fundamental training resources",
    advanced_coaching_tools: "Personalized coaching recommendations",
    tournament_tools: "Manage and enter tournaments",
    video_analysis: "Analyze your technique through video",
    exclusive_events: "Access to special events and challenges",
    skill_development_tips: "Receive tips to improve your game",
  };
  
  return descriptionMap[featureId] || "Feature description not available";
};

interface TierBenefitsCardProps {
  tierName?: string; // If not provided, use current player's tier
}

const TierBenefitsCard: React.FC<TierBenefitsCardProps> = ({ tierName }) => {
  const { data: tierStatus, isLoading: isStatusLoading } = useMasteryTierStatus();
  const { data: tierDetails, isLoading: isTierLoading } = useTierByName(tierName || tierStatus?.currentTier);
  
  // Determine what features to show based on tier
  const isLoading = isStatusLoading || isTierLoading;
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-6 w-[180px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[240px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error or no data state
  if (!tierStatus || !tierDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier Benefits</CardTitle>
          <CardDescription>Features unlocked at your tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            <p>Unable to load tier benefits information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get all possible features
  const allPossibleFeatures = [
    "match_recording",
    "basic_statistics",
    "advanced_statistics",
    "performance_analysis",
    "match_history_insights",
    "community_features",
    "basic_coaching_tools",
    "advanced_coaching_tools",
    "tournament_tools",
    "video_analysis",
    "exclusive_events",
    "skill_development_tips",
  ];
  
  // Current tier's unlocked features
  const unlockedFeatures = tierStatus.features || [];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tierDetails.displayName} Benefits</CardTitle>
          <Badge 
            variant="outline" 
            className={`text-${tierDetails.colorCode?.replace('#', '') || 'blue-500'}`}
          >
            {tierDetails.path} Path
          </Badge>
        </div>
        <CardDescription>
          Features unlocked at the {tierDetails.displayName} tier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allPossibleFeatures.map((featureId) => {
            const isUnlocked = unlockedFeatures.includes(featureId);
            const FeatureIcon = featureIcons[featureId as keyof typeof featureIcons] || Award;
            
            return (
              <div key={featureId} className="flex items-start gap-3">
                {isUnlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300 shrink-0" />
                )}
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    <FeatureIcon className="h-4 w-4 text-muted-foreground" />
                    <span className={isUnlocked ? "" : "text-muted-foreground"}>{getFeatureName(featureId)}</span>
                  </div>
                  <p className={`text-xs ${isUnlocked ? "text-muted-foreground" : "text-gray-400"}`}>
                    {getFeatureDescription(featureId)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TierBenefitsCard;