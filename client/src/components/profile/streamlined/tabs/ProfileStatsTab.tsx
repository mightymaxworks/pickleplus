/**
 * PKL-278651-SPUI-0001: Profile Stats & Ratings Tab
 * Detailed view of player performance metrics and ratings
 */
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Award, TrendingUp, BarChart, ArrowUpRight, 
  ArrowRight, Target, Zap 
} from 'lucide-react';

interface ProfileStatsTabProps {
  user: any;
}

// Helper function to get a color based on rating value
const getRatingColor = (value: number | null): string => {
  if (!value) return 'bg-gray-200';
  if (value >= 80) return 'bg-green-500';
  if (value >= 60) return 'bg-blue-500';
  if (value >= 40) return 'bg-yellow-500';
  if (value >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

const ProfileStatsTab: FC<ProfileStatsTabProps> = ({ user }) => {
  // CourtIQ™ System Data (placeholder)
  const courtIQData = {
    overall: user.rankingPoints || 0,
    forehand: user.forehandStrength || null,
    backhand: user.backhandStrength || null,
    serve: user.servePower || null,
    dink: user.dinkAccuracy || null,
    thirdShot: user.thirdShotConsistency || null,
    courtCoverage: user.courtCoverage || null
  };
  
  // Recent Progress (placeholder)
  const recentProgress = {
    lastMonth: 25,
    lastThreeMonths: 120,
    trend: 'up' // 'up', 'down', or 'stable'
  };
  
  // Match Performance Stats (placeholder)
  const matchStats = {
    totalMatches: user.totalMatches || 0,
    wins: user.matchesWon || 0,
    losses: (user.totalMatches || 0) - (user.matchesWon || 0),
    winRate: user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0,
    averagePPM: 8.3, // Points Per Match (placeholder)
    streakType: 'win', // 'win' or 'loss'
    streakCount: 3 // Current streak
  };
  
  // Calculate skill level value as percentage (for progress bar)
  const skillLevelValue = parseFloat(user.skillLevel || '0');
  const skillLevelPercentage = (skillLevelValue / 7) * 100; // Assuming max skill level is 7.0
  
  return (
    <div className="space-y-6">
      {/* CourtIQ™ Rating Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            CourtIQ™ Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <div className="text-3xl font-bold">{courtIQData.overall}</div>
              <div className="text-sm text-muted-foreground">Overall Rating</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="px-3 py-1 bg-primary/10"
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{recentProgress.lastMonth} pts this month
              </Badge>
              
              <Badge 
                variant="outline" 
                className="px-3 py-1"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {courtIQData.overall >= 1800 ? 'Elite' : 
                  courtIQData.overall >= 1500 ? 'Advanced' : 
                  courtIQData.overall >= 1200 ? 'Intermediate' : 
                  courtIQData.overall >= 800 ? 'Competitive' : 'Beginner'}
              </Badge>
            </div>
          </div>
          
          {/* Attribute Ratings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-2">Skill Breakdown</h4>
            
            {/* Forehand */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Forehand</span>
                <span>{courtIQData.forehand || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.forehand)}`}
                  style={{ width: `${courtIQData.forehand || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Backhand */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Backhand</span>
                <span>{courtIQData.backhand || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.backhand)}`}
                  style={{ width: `${courtIQData.backhand || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Serve */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Serve Power</span>
                <span>{courtIQData.serve || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.serve)}`}
                  style={{ width: `${courtIQData.serve || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Dink Accuracy */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Dink Accuracy</span>
                <span>{courtIQData.dink || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.dink)}`}
                  style={{ width: `${courtIQData.dink || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Third Shot */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Third Shot Consistency</span>
                <span>{courtIQData.thirdShot || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.thirdShot)}`}
                  style={{ width: `${courtIQData.thirdShot || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Court Coverage */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Court Coverage</span>
                <span>{courtIQData.courtCoverage || 'Not rated'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRatingColor(courtIQData.courtCoverage)}`}
                  style={{ width: `${courtIQData.courtCoverage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Skill Level Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Skill Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Skill Level</span>
              <Badge variant="outline">{user.skillLevel || 'Not set'}</Badge>
            </div>
            
            <div className="space-y-2">
              <Progress value={skillLevelPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Pro</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Self-assessed skill level following the International Pickleball Rating System.
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Match Performance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Match Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-3xl font-bold">{matchStats.totalMatches}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600">{matchStats.wins}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-red-500">{matchStats.losses}</div>
              <div className="text-sm text-muted-foreground">Losses</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Win Rate</span>
                <Badge variant={matchStats.winRate >= 50 ? "success" : "default"} className="px-2 py-0">
                  {matchStats.winRate}%
                </Badge>
              </div>
              <Progress value={matchStats.winRate} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <div className="text-sm font-medium">Current Streak</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={matchStats.streakType === 'win' ? "outline" : "destructive"} 
                    className={`px-2 py-0 ${matchStats.streakType === 'win' ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {matchStats.streakType === 'win' ? 'W' : 'L'}
                  </Badge>
                  <span className="mx-1 text-sm font-bold">{matchStats.streakCount}</span>
                </div>
              </div>
              <Zap className={`h-5 w-5 ${matchStats.streakType === 'win' ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStatsTab;