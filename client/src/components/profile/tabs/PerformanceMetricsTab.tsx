import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedUser } from '@/types/enhanced-user';
import { BarChart3, Target, Sword, Dumbbell, Award } from 'lucide-react';

interface PerformanceMetricsTabProps {
  user: EnhancedUser;
}

export function PerformanceMetricsTab({ user }: PerformanceMetricsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Statistics</CardTitle>
        <CardDescription>
          Your detailed performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Match Statistics */}
          <div>
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Match Statistics</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{user.totalMatches || 0}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{user.matchesWon || 0}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {user.totalMatches ? user.totalMatches - (user.matchesWon || 0) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {user.totalMatches && user.matchesWon 
                    ? Math.round((user.matchesWon / user.totalMatches) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </div>
          
          {/* Skill Ratings */}
          <Separator />
          
          <div>
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Skill Ratings</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Forehand
                  </div>
                  <span>{user.forehandStrength || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.forehandStrength || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Backhand
                  </div>
                  <span>{user.backhandStrength || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.backhandStrength || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Sword className="h-4 w-4 mr-2 text-primary" />
                    Serve Power
                  </div>
                  <span>{user.servePower || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.servePower || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Sword className="h-4 w-4 mr-2 text-primary" />
                    Dink Accuracy
                  </div>
                  <span>{user.dinkAccuracy || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.dinkAccuracy || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Third Shot
                  </div>
                  <span>{user.thirdShotConsistency || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.thirdShotConsistency || 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                    Court Coverage
                  </div>
                  <span>{user.courtCoverage || 'N/A'}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ width: `${(user.courtCoverage || 0) * 10}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tournament Stats */}
          <Separator />
          
          <div>
            <div className="flex items-center mb-3">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Tournament Statistics</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{user.totalTournaments || 0}</div>
                <div className="text-sm text-muted-foreground">Tournaments</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {user.level || 1}
                </div>
                <div className="text-sm text-muted-foreground">Player Level</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {user.xp || 0}
                </div>
                <div className="text-sm text-muted-foreground">Experience Points</div>
              </div>
            </div>
          </div>

          {/* Ranking Points */}
          <Separator />
          
          <div>
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Ranking Points</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{user.rankingPoints || 0}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {user.tier || 'Rookie'}
                </div>
                <div className="text-sm text-muted-foreground">Current Tier</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}