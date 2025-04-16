/**
 * PKL-278651-ADMIN-0015-USER
 * User Activity Stats Component
 * 
 * Displays statistics about user activity and engagement
 */

import { User } from '@/types';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, UserCheck, CalendarDays, Award, TrendingUp, BarChart } from 'lucide-react';

interface UserActivityStatsProps {
  user: User;
}

export const UserActivityStats = ({ user }: UserActivityStatsProps) => {
  // Calculate win rate
  const winRate = user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0;
  
  // Format last match date
  const lastMatchText = user.lastMatchDate 
    ? formatDistance(new Date(user.lastMatchDate), new Date(), { addSuffix: true })
    : 'No matches played';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Overview</CardTitle>
        <CardDescription>Player statistics and engagement metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Matches Played */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <UserCheck className="h-8 w-8 mb-2 text-primary/80" />
            <span className="text-2xl font-bold">{user.totalMatches}</span>
            <span className="text-sm text-muted-foreground text-center">
              Matches Played
            </span>
          </div>
          
          {/* Win Rate */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <Trophy className="h-8 w-8 mb-2 text-primary/80" />
            <span className="text-2xl font-bold">{winRate}%</span>
            <span className="text-sm text-muted-foreground text-center">
              Win Rate
            </span>
          </div>
          
          {/* Total Tournaments */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <Award className="h-8 w-8 mb-2 text-primary/80" />
            <span className="text-2xl font-bold">{user.totalTournaments}</span>
            <span className="text-sm text-muted-foreground text-center">
              Tournaments
            </span>
          </div>
          
          {/* Last Match */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <CalendarDays className="h-8 w-8 mb-2 text-primary/80" />
            <span className="text-sm font-bold">Last Match</span>
            <span className="text-xs text-muted-foreground text-center">
              {lastMatchText}
            </span>
          </div>
          
          {/* Ranking Points */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <TrendingUp className="h-8 w-8 mb-2 text-primary/80" />
            <span className="text-2xl font-bold">{user.rankingPoints}</span>
            <span className="text-sm text-muted-foreground text-center">
              Ranking Points
            </span>
          </div>
          
          {/* Profile Completion */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/5">
            <BarChart className="h-8 w-8 mb-2 text-primary/80" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{user.profileCompletionPct || 0}</span>
              <span className="text-sm">%</span>
            </div>
            <span className="text-sm text-muted-foreground text-center">
              Profile Completion
            </span>
          </div>
        </div>
        
        {/* User engagement indicators */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium">Engagement Indicators</h3>
          
          <div className="space-y-2">
            {/* Match Frequency */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Match Frequency</span>
              <EngagementIndicator 
                value={user.totalMatches > 10 ? (user.totalMatches > 30 ? 3 : 2) : 1} 
              />
            </div>
            
            {/* Tournament Participation */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Tournament Participation</span>
              <EngagementIndicator 
                value={user.totalTournaments > 2 ? (user.totalTournaments > 5 ? 3 : 2) : 1} 
              />
            </div>
            
            {/* Profile Completeness */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Profile Completeness</span>
              <EngagementIndicator 
                value={
                  user.profileCompletionPct >= 80 ? 3 : 
                  user.profileCompletionPct >= 50 ? 2 : 1
                } 
              />
            </div>
            
            {/* Account Recency */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Recent Activity</span>
              <EngagementIndicator 
                value={
                  user.lastMatchDate && new Date(user.lastMatchDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 3 :
                  user.lastMatchDate && new Date(user.lastMatchDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 2 : 1
                } 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Engagement indicator component
const EngagementIndicator = ({ value }: { value: 1 | 2 | 3 }) => {
  return (
    <div className="flex gap-1">
      <div 
        className={`h-2 w-6 rounded-sm ${
          value >= 1 ? 'bg-emerald-500' : 'bg-muted'
        }`}
      />
      <div 
        className={`h-2 w-6 rounded-sm ${
          value >= 2 ? 'bg-emerald-500' : 'bg-muted'
        }`}
      />
      <div 
        className={`h-2 w-6 rounded-sm ${
          value >= 3 ? 'bg-emerald-500' : 'bg-muted'
        }`}
      />
    </div>
  );
};