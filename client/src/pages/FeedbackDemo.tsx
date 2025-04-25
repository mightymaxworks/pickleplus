/**
 * PKL-278651-SAGE-0010-FEEDBACK - Feedback System Demo Page
 * 
 * This page demonstrates the feedback system components and functionality.
 */

import React, { useState } from "react";
import { FeedbackDisplay } from "../components/feedback/FeedbackDisplay";
import { FeedbackForm } from "../components/feedback/FeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FeedbackDemo() {
  // Demo data for different content types
  const demoItems = [
    { type: 'drill' as const, id: 1, name: 'Drop Shot Drill' },
    { type: 'training_plan' as const, id: 2, name: 'Beginner Training Plan' },
    { type: 'sage_conversation' as const, id: 3, name: 'SAGE Technique Analysis' },
    { type: 'video' as const, id: 4, name: 'Third Shot Drop Tutorial' }
  ];
  
  const [selectedItem, setSelectedItem] = useState(demoItems[0]);
  const [showFormOnly, setShowFormOnly] = useState(false);
  
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Feedback System</h1>
        <p className="text-muted-foreground mt-2">
          Sprint 5: Social Features & UI Polish
        </p>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Demo</CardTitle>
            <CardDescription>
              The comprehensive feedback system allows users to provide detailed feedback on drills, 
              training plans, SAGE conversations, and videos. The system collects quantitative ratings 
              and qualitative feedback, then analyzes the data to drive continuous improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button 
                variant={!showFormOnly ? "default" : "outline"}
                onClick={() => setShowFormOnly(false)}
              >
                Show Full Feedback Display
              </Button>
              
              <Button 
                variant={showFormOnly ? "default" : "outline"}
                onClick={() => setShowFormOnly(true)}
              >
                Show Feedback Form Only
              </Button>
            </div>
            
            <Tabs defaultValue="drill" className="mb-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger 
                  value="drill" 
                  onClick={() => setSelectedItem(demoItems[0])}
                >
                  Drill
                </TabsTrigger>
                <TabsTrigger 
                  value="training_plan" 
                  onClick={() => setSelectedItem(demoItems[1])}
                >
                  Training Plan
                </TabsTrigger>
                <TabsTrigger 
                  value="sage_conversation" 
                  onClick={() => setSelectedItem(demoItems[2])}
                >
                  SAGE Conversation
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  onClick={() => setSelectedItem(demoItems[3])}
                >
                  Video
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
              <p className="text-muted-foreground mb-6">
                Viewing feedback for {selectedItem.type.replace('_', ' ')} ID: {selectedItem.id}
              </p>
              
              {showFormOnly ? (
                <FeedbackForm 
                  itemType={selectedItem.type}
                  itemId={selectedItem.id}
                  itemName={selectedItem.name}
                  onSuccess={() => setShowFormOnly(false)}
                  onCancel={() => setShowFormOnly(false)}
                  includeContext={true}
                />
              ) : (
                <FeedbackDisplay 
                  itemType={selectedItem.type}
                  itemId={selectedItem.id}
                  itemName={selectedItem.name}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
            <CardDescription>
              Technical details about the feedback system implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Database Structure</h3>
                <p className="text-muted-foreground">
                  The feedback system uses a comprehensive database schema with multiple tables:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>enhancedFeedback - Core feedback data with ratings and comments</li>
                  <li>feedbackAnalytics - Pre-calculated metrics for efficient retrieval</li>
                  <li>feedbackImprovementPlans - Plans for addressing feedback</li>
                  <li>feedbackImplementations - Records of implemented changes</li>
                  <li>feedbackNotifications - Notifications to users about implemented changes</li>
                  <li>userFeedbackParticipation - Tracks user engagement with the feedback system</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Key Features</h3>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Multi-dimensional ratings (overall, clarity, difficulty, enjoyment, effectiveness)</li>
                  <li>Qualitative feedback collection</li>
                  <li>Context-aware feedback with user skill levels and CourtIQ scores</li>
                  <li>Automated sentiment analysis</li>
                  <li>Keyword extraction</li>
                  <li>Actionable insights generation</li>
                  <li>Analytics dashboard with visualizations</li>
                  <li>Full feedback management workflow (submission → review → implementation → notification)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Integration Points</h3>
                <p className="text-muted-foreground">
                  The feedback system integrates with:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Drill pages - Feedback on specific drills</li>
                  <li>Training plans - Feedback on training programs</li>
                  <li>SAGE conversations - Feedback on AI coaching</li>
                  <li>Video content - Feedback on instructional videos</li>
                  <li>Admin dashboard - For reviewing and implementing feedback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}