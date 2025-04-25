/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Page
 * 
 * This page hosts the SAGE coaching panel with Structured Coaching, Conversational UI,
 * Journaling, and Concierge components.
 * 
 * @framework Framework5.3
 * @version 3.2.0
 * @lastModified 2025-04-25
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SageCoachingPanel from "@/components/sage/SageCoachingPanel";
import SageConversationPanel from "@/components/sage/SageConversationPanel";
import SageJournalPanel from "@/components/sage/SageJournalPanel";
import { SageConciergePanel } from "@/components/sage/SageConciergePanel";
import { SageRecommendationCard } from "@/components/sage/SageRecommendationCard";
import { PlatformFeatureExplorer } from "@/components/sage/PlatformFeatureExplorer";
import { 
  Loader2, 
  MessageSquare, 
  ListChecks, 
  BookText, 
  Compass, 
  Lightbulb
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function SageCoachingPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("structured");

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
        <p className="mb-6">
          Please log in to access the S.A.G.E. coaching features.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">S.A.G.E. Coaching</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Skills Assessment & Growth Engine - Your Personal Pickleball Coach
        </p>
      </div>
      
      <Tabs defaultValue="conversation" onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="w-full max-w-xl">
            <TabsTrigger value="conversation" className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center justify-center gap-2">
              <ListChecks className="h-5 w-5" />
              <span>Training</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center justify-center gap-2">
              <BookText className="h-5 w-5" />
              <span>Journal</span>
            </TabsTrigger>
            <TabsTrigger value="concierge" className="flex items-center justify-center gap-2">
              <Compass className="h-5 w-5" />
              <span>Concierge</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center justify-center gap-2">
              <Lightbulb className="h-5 w-5" />
              <span>For You</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="conversation" className="w-full flex justify-center">
          <SageConversationPanel />
        </TabsContent>
        
        <TabsContent value="structured">
          <SageCoachingPanel />
        </TabsContent>
        
        <TabsContent value="journal">
          <SageJournalPanel />
        </TabsContent>
        
        <TabsContent value="concierge" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SageConciergePanel />
            </div>
            <div className="lg:col-span-1">
              <SageRecommendationCard />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="w-full">
          <div className="grid grid-cols-1 gap-6">
            <PlatformFeatureExplorer />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SageRecommendationCard />
              <div className="bg-muted p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Personalized Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Based on your CourtIQ™ profile and recent activities, these
                  features are tailored to help you improve your game.
                </p>
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Top skills to improve:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Technical Skills</span>
                    <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">Mental Toughness</span>
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">Consistency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}