/**
 * Decay Protection Status Card Component
 * 
 * Displays tier-specific decay protection status with Professional enhanced weighting
 * 
 * @framework PKL-278651 Mobile-First Design
 * @version 1.0.0 - PROFESSIONAL TIER ENHANCED WEIGHTING
 * @lastModified 2025-08-06
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, Calendar, Activity, Trophy, Users, Zap } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";

interface DecayProtectionStatus {
  isProtected: boolean;
  daysUntilDecay: number;
  currentDecayRate: number;
  activitySummary: string;
  recommendations: string[];
}

interface WeightedActivity {
  weightedMatches: number;
  breakdown: {
    tournament: { count: number; weighted: number };
    league: { count: number; weighted: number };
    casual: { count: number; weighted: number };
  };
  tier: {
    name: 'recreational' | 'competitive' | 'elite' | 'professional';
    pointsMin: number;
    pointsMax: number | null;
    baseDecayRate: number;
    holidayDecayRate: number;
  };
}

interface DecayProtectionCardProps {
  userId?: number;
  className?: string;
}

export function DecayProtectionCard({ userId, className = "" }: DecayProtectionCardProps) {
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: userId ? ['/api/decay-protection/status', userId] : ['/api/decay-protection/my-status'],
    enabled: true,
    retry: false,
  });

  if (statusLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Decay Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status: DecayProtectionStatus = statusData?.data?.protection || statusData?.data;
  const activity: WeightedActivity = statusData?.data?.activity;

  if (!status || !activity) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Decay Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Unable to load decay protection status</p>
        </CardContent>
      </Card>
    );
  }

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'professional': return <Trophy className="h-4 w-4" />;
      case 'elite': return <TrendingUp className="h-4 w-4" />;
      case 'competitive': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'professional': return 'bg-purple-500';
      case 'elite': return 'bg-blue-500';
      case 'competitive': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const protectionPercentage = Math.min(100, (activity.weightedMatches / 4) * 100);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${status.isProtected ? 'text-green-500' : 'text-orange-500'}`} />
            Decay Protection
          </div>
          <Badge variant={status.isProtected ? 'default' : 'secondary'}>
            {status.isProtected ? 'Protected' : 'At Risk'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Tier Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getTierIcon(activity.tier.name)}
            <div>
              <p className="font-medium capitalize">{activity.tier.name} Tier</p>
              <p className="text-xs text-gray-600">
                {activity.tier.pointsMin}+ points • {activity.tier.baseDecayRate}% weekly decay
              </p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${getTierColor(activity.tier.name)}`}></div>
        </div>

        {/* Protection Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Protection Level</span>
            <span className="text-sm text-gray-600">
              {activity.weightedMatches.toFixed(1)}/4.0 weighted matches
            </span>
          </div>
          <Progress value={protectionPercentage} className="w-full" />
          <p className="text-xs text-gray-600">{status.activitySummary}</p>
        </div>

        {/* Match Breakdown with Tier-Specific Weighting */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-purple-50 rounded">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <p className="text-xs font-medium">Tournaments</p>
            <p className="text-sm">{activity.breakdown.tournament.count}</p>
            <p className="text-xs text-gray-600">
              {activity.tier.name === 'professional' ? '3x' : '2x'} weight
            </p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-medium">League</p>
            <p className="text-sm">{activity.breakdown.league.count}</p>
            <p className="text-xs text-gray-600">
              {activity.tier.name === 'professional' ? '2x' : '1.5x'} weight
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <Activity className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-xs font-medium">Casual</p>
            <p className="text-sm">{activity.breakdown.casual.count}</p>
            <p className="text-xs text-gray-600">
              {activity.tier.name === 'professional' ? '0.75x' : '1x'} weight
            </p>
          </div>
        </div>

        {/* Professional Tier Special Notice */}
        {activity.tier.name === 'professional' && (
          <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-800">Professional Tier Benefits</p>
                <p className="text-xs text-purple-700">
                  Enhanced tournament weighting (3x vs 2x) heavily rewards competitive play
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {status.recommendations.length > 0 && !status.isProtected && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations:</p>
            <ul className="space-y-1">
              {status.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-orange-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Decay Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded">
          <Calendar className="h-4 w-4" />
          <span>
            Next decay check: {status.daysUntilDecay} days
            {status.currentDecayRate > 0 && ` (${status.currentDecayRate}% weekly)`}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}

export default DecayProtectionCard;