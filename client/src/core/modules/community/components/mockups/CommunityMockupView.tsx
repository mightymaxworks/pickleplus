/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Module UI/UX Mockup Container
 * 
 * This component serves as the container for all Community Module UI mockups.
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommunityDiscoveryMockup from './CommunityDiscoveryMockup';
import CommunityProfileMockup from './CommunityProfileMockup';
import CommunityCreationMockup from './CommunityCreationMockup';
import CommunityEventsMockup from './CommunityEventsMockup';
import CommunityAnnouncementsMockup from './CommunityAnnouncementsMockup';

const CommunityMockupView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="discover">Discovery</TabsTrigger>
          <TabsTrigger value="profile">Community Profile</TabsTrigger>
          <TabsTrigger value="create">Create Community</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
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
  );
};

export default CommunityMockupView;