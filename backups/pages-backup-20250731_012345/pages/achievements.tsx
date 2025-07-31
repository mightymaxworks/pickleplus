import React from 'react';
import { AchievementList } from '@/components/achievements/AchievementList';
import { AdvancedAchievementTracker } from '@/components/gamification/AdvancedAchievementTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Award } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Achievements</h1>
          <p className="text-gray-600">Track your progress and celebrate your milestones</p>
        </div>

        {/* Achievement Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="earned" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Earned
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              In Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdvancedAchievementTracker />
          </TabsContent>

          <TabsContent value="earned">
            <Card>
              <CardHeader>
                <CardTitle>Completed Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementList achievements={[]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Achievements In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Keep playing to unlock new achievements!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}