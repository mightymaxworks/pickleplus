/**
 * PKL-278651-COACH-0021-WIDGET-SIMPLE
 * Direct SAGE Messaging Interface for Dashboard
 * 
 * This component provides an immediate SAGE messaging interface
 * directly on the dashboard with no additional navigation required.
 * 
 * @framework Framework5.3
 * @version 1.2.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Info, PlusCircle } from "lucide-react";
import { useLocation } from 'wouter';

// Quick suggestions for common SAGE interactions
const QUICK_SUGGESTIONS = [
  "What's a good drill for my dinking?",
  "How can I improve my third shot drop?", 
  "Help me prepare for my tournament",
  "Tips for better positioning"
];

export default function SimpleSageWidget() {
  const [, navigate] = useLocation();
  const [userMessage, setUserMessage] = useState('');
  const [conversations, setConversations] = useState<{role: 'user'|'sage', content: string}[]>([
    {role: 'sage', content: "👋 Hi! I'm SAGE, your pickleball coach. How can I help with your game today?"}
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages whenever conversations change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations]);
  
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
      // Generate a simple contextual response
      let response: string;
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('dink') || msg.includes('dinking')) {
        response = "For dinking practice, I recommend the 'Four Corners' drill. Position yourself at the kitchen line and aim for all four corners of the opponent's kitchen. Focus on control and placement rather than power.";
      } else if (msg.includes('third') || msg.includes('drop')) {
        response = "To improve your third shot drop, try the 'Target Practice' drill. Have a partner stand at the kitchen line while you hit drop shots from the baseline. Aim for targets placed in different spots in the kitchen to develop touch and accuracy.";
      } else if (msg.includes('tournament') || msg.includes('competition')) {
        response = "Before a tournament, focus on consistency drills rather than learning new skills. Practice pressure situations with game scenarios, and make sure to have a solid warm-up routine. Would you like me to create a tournament preparation plan for you?";
      } else if (msg.includes('position') || msg.includes('movement')) {
        response = "Good positioning starts with the ready position - knees slightly bent, paddle up at chest level. Practice side-to-side kitchen line movements and always try to return to the center of your side after each shot. The 'Shadow Drill' where you mirror a partner's movements can help with this.";
      } else {
        response = "That's a great question! I'd recommend practicing specific drills focused on that aspect of your game. Would you like a detailed breakdown of exercises that could help?";
      }
      
      setConversations(prev => [...prev, {role: 'sage', content: response}]);
    }, 500);
    
    setUserMessage('');
  };
  
  // Function to handle quick suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setUserMessage(suggestion);
    setConversations([...conversations, {role: 'user', content: suggestion}]);
    
    // Simulate SAGE response
    setTimeout(() => {
      let response: string;
      
      if (suggestion.includes('dinking')) {
        response = "For dinking practice, I recommend the 'Four Corners' drill. Position yourself at the kitchen line and aim for all four corners of the opponent's kitchen. Focus on control and placement rather than power.";
      } else if (suggestion.includes('third shot drop')) {
        response = "To improve your third shot drop, try the 'Target Practice' drill. Have a partner stand at the kitchen line while you hit drop shots from the baseline. Aim for targets placed in different spots in the kitchen to develop touch and accuracy.";
      } else if (suggestion.includes('tournament')) {
        response = "Before a tournament, focus on consistency drills rather than learning new skills. Practice pressure situations with game scenarios, and make sure to have a solid warm-up routine. Would you like me to create a tournament preparation plan for you?";
      } else if (suggestion.includes('positioning')) {
        response = "Good positioning starts with the ready position - knees slightly bent, paddle up at chest level. Practice side-to-side kitchen line movements and always try to return to the center of your side after each shot. The 'Shadow Drill' where you mirror a partner's movements can help with this.";
      } else {
        response = "Let me help you with that! I can provide specific drills and techniques to improve your game.";
      }
      
      setConversations(prev => [...prev, {role: 'sage', content: response}]);
    }, 500);
    
    setUserMessage('');
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            SAGE Coach
          </CardTitle>
          
          <Button 
            variant="ghost" 
            onClick={navigateToSage} 
            className="h-8 w-8 p-0" 
            title="Open full SAGE experience"
          >
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 max-h-[200px] overflow-y-auto">
        <div className="space-y-3">
          {conversations.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <div className="px-3 pb-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <CardFooter className="pt-0 pb-3 px-3">
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Ask SAGE anything..."
            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}