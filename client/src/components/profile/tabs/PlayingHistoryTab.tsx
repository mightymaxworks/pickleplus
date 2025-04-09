import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedUser } from '@/types/enhanced-user';
import { History, Award, Medal } from 'lucide-react';

interface PlayingHistoryTabProps {
  user: EnhancedUser;
}

export function PlayingHistoryTab({ user }: PlayingHistoryTabProps) {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Match History</CardTitle>
          </div>
          <CardDescription>
            Your recent match outcomes and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* In a real implementation, this would fetch and display actual match history data */}
          {user.totalMatches && user.totalMatches > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Match history data is being loaded...
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-medium mb-1">No match history yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start playing matches to build your match history and performance analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Achievements</CardTitle>
          </div>
          <CardDescription>
            Milestones and badges you've earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.achievements && user.achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.achievements.map((achievement: any, index: number) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-medium mb-1">No achievements yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Continue playing matches and participating in tournaments to earn achievements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future enhancement: Rankings history */}
      {/* 
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center">
            <Medal className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Ranking History</CardTitle>
          </div>
          <CardDescription>
            Your progress through the ranks over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Medal className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-medium mb-1">Ranking history coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This feature is being developed and will show your ranking progression over time.
            </p>
          </div>
        </CardContent>
      </Card>
      */}
    </>
  );
}