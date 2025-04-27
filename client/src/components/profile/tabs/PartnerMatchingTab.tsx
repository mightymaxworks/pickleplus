/**
 * PKL-278651-PROF-0029-TAB - Partner Matching Tab
 * 
 * This component provides a profile tab for partner compatibility features,
 * including preferences and matches.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { EnhancedUser } from "@/types/enhanced-user";
import PartnerMatchingPreferences from "../modern/PartnerMatchingPreferences";
import CompatiblePartnersList from "../modern/CompatiblePartnersList";

interface PartnerMatchingTabProps {
  user: EnhancedUser;
  isCurrentUser: boolean;
}

export default function PartnerMatchingTab({
  user,
  isCurrentUser
}: PartnerMatchingTabProps) {
  const [activeView, setActiveView] = useState<'preferences' | 'matches'>(
    isCurrentUser ? 'matches' : 'preferences'
  );
  
  return (
    <div className="p-4 sm:p-6">
      <Tabs 
        defaultValue={activeView} 
        onValueChange={(value) => setActiveView(value as 'preferences' | 'matches')}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Partner Matching</h2>
          <TabsList>
            <TabsTrigger value="matches">Partners</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="matches" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <CompatiblePartnersList 
              userId={user.id} 
              onPreferencesClick={isCurrentUser ? () => setActiveView('preferences') : undefined}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <PartnerMatchingPreferences
              userId={user.id}
              onSaved={() => setActiveView('matches')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}