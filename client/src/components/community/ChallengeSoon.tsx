/**
 * PKL-278651-COMM-0031-CHLG-COMING-SOON
 * Community Challenge Feature Communication & Roadmap Implementation  
 * 
 * ChallengeSoon Component
 * Main implementation component that combines Coming Soon Banner, Feature Roadmap,
 * and Feedback Collection in a community dashboard-ready layout
 * 
 * Implementation Date: April 20, 2025
 * Framework Version: 5.2
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, Lightbulb, Users } from 'lucide-react';
import { ComingSoonBanner } from './ComingSoonBanner';
import { FeatureRoadmap, RoadmapFeature } from './FeatureRoadmap';
import { FeedbackCollection } from './FeedbackCollection';

export interface ChallengeSoonProps {
  communityId?: number;
  communityName?: string;
  className?: string;
}

export function ChallengeSoon({
  communityId,
  communityName = 'your community',
  className = '',
}: ChallengeSoonProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample roadmap features for the community challenges
  const roadmapFeatures: RoadmapFeature[] = [
    {
      id: 'challenge-system',
      name: 'Challenge Creation System',
      description: 'Create custom challenges specific to your community with targets, timeframes, and rewards.',
      status: 'planned',
      expectedDate: 'May 2025',
      statusMessage: 'In active development, scheduled for release next month.'
    },
    {
      id: 'custom-multipliers',
      name: 'Custom Activity Multipliers',
      description: 'Set custom multipliers for different types of community activities to boost engagement.',
      status: 'planned',
      expectedDate: 'May 2025',
      statusMessage: 'Development scheduled to start next week.'
    },
    {
      id: 'leaderboards',
      name: 'Challenge Leaderboards',
      description: 'Community-specific leaderboards for challenge participation and completion.',
      status: 'planned',
      expectedDate: 'May 2025',
      statusMessage: 'Design phase completed, implementation starting soon.'
    },
    {
      id: 'rewards-badges',
      name: 'Custom Challenge Rewards & Badges',
      description: 'Create unique badges and rewards for challenge participants and winners.',
      status: 'planned',
      expectedDate: 'June 2025',
      statusMessage: 'Design phase in progress.'
    },
    {
      id: 'team-challenges',
      name: 'Team Challenges',
      description: 'Create challenges for teams within your community to compete against each other.',
      status: 'planned',
      expectedDate: 'July 2025',
      statusMessage: 'Planned for Q3 2025.'
    }
  ];

  return (
    <Card className={`${className} border border-gray-200 shadow-sm overflow-hidden`}>
      <CardContent className="p-6">
        <ComingSoonBanner 
          title="Community Challenges"
          description={`Engage your members with custom challenges, boost activity, and build a more vibrant ${communityName} community.`}
          releaseDate="May 2025"
          icon="gift"
          actionText="Learn More"
          onAction={() => setActiveTab('roadmap')}
          className="mb-6"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Suggest Features</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <div className="space-y-6">
              {/* Challenge previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-gray-800">Weekly Challenges</h3>
                  <p className="text-gray-600 text-sm">Regular challenges to keep your community engaged and active</p>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Coming Soon</div>
                </div>
                
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-gray-800">Team Competitions</h3>
                  <p className="text-gray-600 text-sm">Form teams and compete in community-wide challenges</p>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Coming Soon</div>
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-3">What's Coming in Community Challenges</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="min-w-4 min-h-4 rounded-full bg-orange-400 mt-1.5"></div>
                    <p className="text-gray-700">Create custom challenges specific to your community</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-4 min-h-4 rounded-full bg-orange-400 mt-1.5"></div>
                    <p className="text-gray-700">Set custom XP multipliers for challenge activities</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-4 min-h-4 rounded-full bg-orange-400 mt-1.5"></div>
                    <p className="text-gray-700">Award unique badges to challenge participants and winners</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-4 min-h-4 rounded-full bg-orange-400 mt-1.5"></div>
                    <p className="text-gray-700">Track progress with community-specific leaderboards</p>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="roadmap" className="mt-0">
            <FeatureRoadmap 
              features={roadmapFeatures}
              title="Community Challenges Roadmap"
              subtitle="Here's our development plan for upcoming community challenge features"
            />
          </TabsContent>
          
          <TabsContent value="feedback" className="mt-0">
            <FeedbackCollection 
              title="Shape the Future of Community Challenges"
              subtitle="Your feedback helps us prioritize the features that matter most to you"
              onFeedbackSubmitted={() => setActiveTab('roadmap')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}