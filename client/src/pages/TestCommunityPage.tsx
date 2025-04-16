/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Module UI/UX Test Page
 * 
 * This page contains UI mockups for the Community Module features
 * to validate design patterns before full implementation.
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Users, PlusCircle, Calendar, Megaphone,
  Sparkles, TestTube, FlaskConical, Beaker
} from 'lucide-react';

import CommunityDiscoveryMockup from '../core/modules/community/components/mockups/CommunityDiscoveryMockup';
import CommunityProfileMockup from '../core/modules/community/components/mockups/CommunityProfileMockup';
import CommunityCreationMockup from '../core/modules/community/components/mockups/CommunityCreationMockup';
import CommunityEventsMockup from '../core/modules/community/components/mockups/CommunityEventsMockup';
import CommunityAnnouncementsMockup from '../core/modules/community/components/mockups/CommunityAnnouncementsMockup';

const TestCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-primary/5 p-4 mb-6 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-primary">PKL-278651-COMM-0001-UIMOCK</h2>
          </div>
          <div className="flex items-start gap-2">
            <Beaker className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This is a UI mockup test page for the Community Module. Use the tabs below to explore different UI components.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Community Features UI Test</h1>
          <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary gap-1.5">
            <TestTube className="h-4 w-4" />
            <span className="text-sm font-medium">UI Prototype</span>
          </div>
        </div>
        
        <div className="bg-card rounded-xl shadow-lg p-6 border border-muted">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="w-full max-w-4xl flex flex-wrap gap-3 p-1.5 bg-muted/70">
                <TabsTrigger value="discover" className="flex-1 gap-2 py-3">
                  <Search className="h-4 w-4" />
                  <span>Discovery</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex-1 gap-2 py-3">
                  <Users className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="create" className="flex-1 gap-2 py-3">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex-1 gap-2 py-3">
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                </TabsTrigger>
                <TabsTrigger value="announcements" className="flex-1 gap-2 py-3">
                  <Megaphone className="h-4 w-4" />
                  <span>News</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="relative">
              <div className="absolute -top-14 right-0 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Showing interactive mockups with example data</span>
              </div>
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
    </div>
  );
};

export default TestCommunityPage;
