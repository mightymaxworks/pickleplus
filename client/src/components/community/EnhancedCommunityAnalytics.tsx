/**
 * PKL-278651-COMM-0033-STATS
 * Enhanced Community Analytics Component
 * 
 * This component combines community engagement metrics with detailed statistics
 * for a comprehensive view of community activity and growth.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, BarChart2, Award } from 'lucide-react';
import CommunityEngagementMetrics from './CommunityEngagementMetrics';
import CommunityStatistics from './CommunityStatistics';
import EngagementBadges from './EngagementBadges';

interface EnhancedCommunityAnalyticsProps {
  communityId: number;
}

const EnhancedCommunityAnalytics: React.FC<EnhancedCommunityAnalyticsProps> = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState('statistics');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">
            Community Analytics
          </CardTitle>
          <CardDescription>
            View detailed statistics, engagement metrics, and performance indicators for this community
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="statistics">
                <BarChart2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Statistics</span>
                <span className="inline sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="engagement">
                <Activity className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Engagement</span>
                <span className="inline sm:hidden">Engage</span>
              </TabsTrigger>
              <TabsTrigger value="badges">
                <Award className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Badges</span>
                <span className="inline sm:hidden">Badges</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="statistics" className="mt-0">
              <CommunityStatistics communityId={communityId} />
            </TabsContent>
            
            <TabsContent value="engagement" className="mt-0">
              <CommunityEngagementMetrics communityId={communityId} />
            </TabsContent>
            
            <TabsContent value="badges" className="mt-0">
              <EngagementBadges communityId={communityId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCommunityAnalytics;