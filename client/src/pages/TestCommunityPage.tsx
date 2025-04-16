/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Module UI/UX Test Page
 * 
 * This page contains UI mockups for the Community Module features
 * to validate design patterns before full implementation.
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommunityDiscoveryMockup from '../core/modules/community/components/mockups/CommunityDiscoveryMockup';
import CommunityProfileMockup from '../core/modules/community/components/mockups/CommunityProfileMockup';
import CommunityCreationMockup from '../core/modules/community/components/mockups/CommunityCreationMockup';
import CommunityEventsMockup from '../core/modules/community/components/mockups/CommunityEventsMockup';
import CommunityAnnouncementsMockup from '../core/modules/community/components/mockups/CommunityAnnouncementsMockup';

const TestCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-accent/10 p-3 mb-6 rounded-md border border-accent/20">
        <h2 className="text-sm font-medium text-accent-foreground">PKL-278651-COMM-0001-UIMOCK</h2>
        <p className="text-sm text-muted-foreground">
          This is a UI mockup test page for the Community Module. Use the tabs below to explore different UI components.
        </p>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Community Features UI Test</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="w-full max-w-4xl flex flex-wrap gap-2">
              <TabsTrigger value="discover" className="flex-1">Discovery</TabsTrigger>
              <TabsTrigger value="profile" className="flex-1">Community Profile</TabsTrigger>
              <TabsTrigger value="create" className="flex-1">Create Community</TabsTrigger>
              <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
              <TabsTrigger value="announcements" className="flex-1">Announcements</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="discover" className="pt-4">
            <CommunityDiscoveryMockup />
          </TabsContent>
          
          <TabsContent value="profile" className="pt-4">
            <CommunityProfileMockup />
          </TabsContent>
          
          <TabsContent value="create" className="pt-4">
            <CommunityCreationMockup />
          </TabsContent>
          
          <TabsContent value="events" className="pt-4">
            <CommunityEventsMockup />
          </TabsContent>
          
          <TabsContent value="announcements" className="pt-4">
            <CommunityAnnouncementsMockup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestCommunityPage;