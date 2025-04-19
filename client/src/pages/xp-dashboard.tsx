/**
 * PKL-278651-XP-0002-UI
 * XP Dashboard Page
 * 
 * This is a showcase/demo page that displays all the XP system components.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  XpProgressTracker, 
  XpHistoryFeed, 
  LevelUpNotification,
  ProgressTracker,
  RewardDisplay,
  DiscoveryTracker,
  DiscoveryAlert 
} from '@/core/modules/gamification';
import { useXpProgress } from '@/core/modules/gamification';

// Demo data for rewards
const demoRewards = [
  {
    id: 1,
    title: "Skilled Player",
    description: "Won 5 matches in a row",
    type: "achievement" as const,
    rarity: "uncommon" as const,
    icon: "TrophyIcon",
    dateEarned: "2025-04-17T12:00:00Z"
  },
  {
    id: 2,
    title: "Community Builder",
    description: "Created a community with 20+ members",
    type: "badge" as const,
    rarity: "rare" as const,
    icon: "UsersIcon",
    dateEarned: "2025-04-14T10:30:00Z"
  },
  {
    id: 3,
    title: "Tournament Organizer",
    description: "Successfully hosted a tournament",
    type: "title" as const,
    rarity: "epic" as const,
    icon: "TrophyIcon",
    dateEarned: "2025-04-10T16:00:00Z"
  }
];

const XpDashboard: React.FC = () => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  
  // Demo discovery alert data
  const discoveryReward = {
    id: 1,
    name: 'XP Boost',
    description: 'You discovered the XP Dashboard!',
    type: 'xp',
    rarity: 'uncommon',
    value: {
      xpAmount: 10
    }
  };

  useEffect(() => {
    // Set page title
    document.title = 'XP Dashboard - Pickle+';
  }, []);
  
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">XP Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <XpProgressTracker />
          <DiscoveryTracker 
            totalDiscoveries={25} 
            discoveredCount={8} 
            title="Platform Exploration"
            description="Discover Pickle+ features"
          />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <XpHistoryFeed limit={8} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RewardDisplay rewards={demoRewards} />
          
          <ProgressTracker 
            title="Weekly Challenge Progress"
            description="Play 10 matches this week"
            currentValue={7}
            maxValue={10}
            indicatorClassName="bg-amber-500"
          />
          
          <div className="space-y-4">
            <h3 className="text-base font-medium">Demo Controls</h3>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowLevelUp(true)} variant="outline">
                Show Level Up Notification
              </Button>
              <Button onClick={() => setShowDiscovery(true)} variant="outline">
                Show Discovery Alert
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Notification */}
      <LevelUpNotification
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        level={6}
        previousLevel={5}
        perks={['Custom profile theme', 'Tournament early access']}
        isKeyMilestone={false}
      />
      
      {/* Discovery Alert */}
      <DiscoveryAlert
        title="New Discovery!"
        message="You found the XP Dashboard. This is where you can track your progress and see your rewards."
        level="success"
        open={showDiscovery}
        autoHide={false}
        reward={discoveryReward}
        onClose={() => setShowDiscovery(false)}
      />
    </div>
  );
};

export default XpDashboard;