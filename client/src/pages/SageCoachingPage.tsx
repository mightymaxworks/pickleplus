/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Page
 * 
 * This page hosts the SAGE coaching panel with Structured Coaching, Conversational UI,
 * and Journaling components.
 * 
 * @framework Framework5.3
 * @version 3.0.0
 * @lastModified 2025-04-24
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SageCoachingPanel from "@/components/sage/SageCoachingPanel";
import SageConversationPanel from "@/components/sage/SageConversationPanel";
import SageJournalPanel from "@/components/sage/SageJournalPanel";
import { Loader2, MessageSquare, ListChecks, BookText } from "lucide-react";
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
          <TabsList className="w-full max-w-md">
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
      </Tabs>
    </div>
  );
}