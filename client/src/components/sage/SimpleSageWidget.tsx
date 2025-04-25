/**
 * PKL-278651-COACH-0021-WIDGET-SIMPLE
 * Simple SAGE Recommendations Widget
 * 
 * This is a simplified SAGE widget for the dashboard that provides
 * direct interaction with SAGE without leaving the dashboard.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, MessageCircle, ChevronRight, ThumbsUp, Sparkles } from "lucide-react";
import { useLocation } from 'wouter';

export default function SimpleSageWidget() {
  const [, navigate] = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [conversations, setConversations] = useState<{role: 'user'|'sage', content: string}[]>([]);
  
  // Function to navigate to full SAGE experience
  const navigateToSage = () => {
    navigate('/coach/sage');
  };
  
  // Function to handle user input submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    
    // Add user message to conversation
    setConversations([...conversations, {role: 'user', content: userMessage}]);
    
    // Simulate SAGE response (in a real implementation, this would call the API)
    setTimeout(() => {
      let response = "I'd recommend focusing on your dinking technique. Try the 'Four Corners' drill to improve precision and control.";
      setConversations(prev => [...prev, {role: 'sage', content: response}]);
    }, 500);
    
    setUserMessage('');
  };
  
  // Just use a direct recommendation for simplicity
  const recommendation = {
    id: 'rec-1',
    type: 'drill',
    title: 'Improve Your Dink Accuracy',
    summary: 'Based on your recent matches, focusing on controlled dinking will improve your consistency in kitchen exchanges. Try the "Four Corners" drill to build precision.',
    dimensionCode: 'TECH'
  };
  
  // Helper function to get dimension badge color
  const getDimensionColor = (code: string) => {
    switch (code) {
      case 'TECH': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'TACT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'PHYS': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MENT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'CONS': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Helper function to get dimension name
  const getDimensionName = (code: string) => {
    switch (code) {
      case 'TECH': return 'Technical';
      case 'TACT': return 'Tactical';
      case 'PHYS': return 'Physical';
      case 'MENT': return 'Mental';
      case 'CONS': return 'Consistency';
      default: return 'General';
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            SAGE Coach
          </CardTitle>
          
          {!showChat && (
            <Badge variant="outline" className={getDimensionColor(recommendation.dimensionCode)}>
              {getDimensionName(recommendation.dimensionCode)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {showChat ? (
        <>
          <CardContent className="p-3 max-h-[180px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <Sparkles className="h-5 w-5 mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Ask SAGE about drills, technique, or strategy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-2">
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask SAGE something..."
                className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="pt-4 pb-2">
            <h3 className="font-medium mb-1">{recommendation.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {recommendation.summary}
            </p>
          </CardContent>
          
          <CardFooter className="pt-2 flex gap-2">
            <Button 
              onClick={() => setShowChat(true)} 
              variant="outline" 
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Quick Chat
            </Button>
            <Button 
              onClick={navigateToSage} 
              variant="default" 
              className="flex-1"
            >
              <span>Full Coach</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}