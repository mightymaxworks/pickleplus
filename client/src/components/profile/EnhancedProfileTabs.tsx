import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  User, 
  Settings, 
  BarChart3, 
  History, 
  Shield
} from 'lucide-react';

import { EnhancedUser } from '@/types/enhanced-user';
import {
  ProfileDetailsTab,
  EquipmentPreferencesTab,
  PerformanceMetricsTab,
  PlayingHistoryTab,
  PrivacyControlPanel
} from './tabs';

interface EnhancedProfileTabsProps {
  user: EnhancedUser;
}

export function EnhancedProfileTabs({ user }: EnhancedProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:w-[600px]">
        <TabsTrigger value="overview">
          <User className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Overview</span>
          <span className="md:hidden">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="statistics">
          <BarChart3 className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Statistics</span>
          <span className="md:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">History</span>
          <span className="md:hidden">History</span>
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Settings</span>
          <span className="md:hidden">Settings</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab Content */}
      <TabsContent value="overview" className="space-y-6">
        <ProfileDetailsTab user={user} />
        <EquipmentPreferencesTab user={user} />
      </TabsContent>

      {/* Statistics Tab Content */}
      <TabsContent value="statistics" className="space-y-6">
        <PerformanceMetricsTab user={user} />
      </TabsContent>

      {/* Match History Tab Content */}
      <TabsContent value="history" className="space-y-6">
        <PlayingHistoryTab user={user} />
      </TabsContent>

      {/* Privacy Settings Tab Content */}
      <TabsContent value="settings" className="space-y-6">
        <PrivacyControlPanel user={user} />
      </TabsContent>
    </Tabs>
  );
}