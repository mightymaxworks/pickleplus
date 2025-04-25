/**
 * PKL-278651-SAGE-0028-CONCIERGE
 * SAGE Platform Concierge Interface
 * 
 * This component provides an immediate SAGE interaction interface
 * directly on the dashboard to guide users throughout the platform.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Map, Calendar, Users, Settings, Star, Search, PlusCircle } from "lucide-react";
import { useLocation } from 'wouter';

// Quick suggestions for SAGE platform concierge interactions
const QUICK_SUGGESTIONS = [
  "What features should I try first?",
  "How do I find tournaments?", 
  "Help me connect with players",
  "Show me my CourtIQ stats"
];

export default function SimpleSageWidget() {
  const [, navigate] = useLocation();
  const [userMessage, setUserMessage] = useState('');
  const [conversations, setConversations] = useState<{role: 'user'|'sage', content: string}[]>([
    {role: 'sage', content: "👋 Hi! I'm SAGE, your Pickle+ concierge. I can help you discover features, find players, or improve your game. What would you like to explore today?"}
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
      // Generate a contextual response based on platform features
      let response: string;
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('feature') || msg.includes('try') || msg.includes('new')) {
        response = "Based on your profile, I'd recommend exploring these Pickle+ features:\n\n1. CourtIQ™ Performance - track your multi-dimensional skill ratings\n2. Community Hub - connect with players in your area\n3. Tournament Finder - discover upcoming events\n\nWhat would you like to explore first?";
      } else if (msg.includes('tournament') || msg.includes('event') || msg.includes('play')) {
        response = "The Tournament Finder is your hub for events! Head to the Events tab to browse upcoming tournaments filtered by location, skill level, and format. You can register directly through Pickle+, and I can help you prepare a training plan leading up to your selected event.";
      } else if (msg.includes('player') || msg.includes('partner') || msg.includes('connect') || msg.includes('friend')) {
        response = "To connect with other players, visit the Community tab where you can:\n\n• Search for players by location and skill level\n• Join local Pickle+ groups\n• Use Partner Finder to match with compatible players\n• Create or join meetups\n\nWould you like me to help you find specific types of players?";
      } else if (msg.includes('stat') || msg.includes('courtiq') || msg.includes('rating') || msg.includes('score')) {
        response = "Your CourtIQ™ performance shows your multi-dimensional rating across 5 key areas. Looking at your profile, your strongest dimensions are Technical Skills and Tactical Awareness, while you could benefit from development in Mental Toughness. Would you like me to recommend personalized drills to improve your weaker dimensions?";
      } else if (msg.includes('coach') || msg.includes('drill') || msg.includes('improve') || msg.includes('learn')) {
        response = "I can help with your pickleball skills! The Coaching section offers:\n\n• Personalized drill recommendations\n• Technique analysis\n• Strategy guides for different play styles\n• Mental game development\n\nWhat specific aspect of your game would you like to work on?";
      } else {
        response = "I can help you with that! As your Pickle+ concierge, I can guide you through any feature on the platform, help you find tournaments, connect with players, improve your skills, or track your progress. What aspect are you most interested in exploring?";
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
      
      if (suggestion.includes('features')) {
        response = "Based on your profile, I'd recommend exploring these Pickle+ features:\n\n1. CourtIQ™ Performance - track your multi-dimensional skill ratings\n2. Community Hub - connect with players in your area\n3. Tournament Finder - discover upcoming events\n\nWhat would you like to explore first?";
      } else if (suggestion.includes('tournaments')) {
        response = "The Tournament Finder is your hub for events! Head to the Events tab to browse upcoming tournaments filtered by location, skill level, and format. You can register directly through Pickle+, and I can help you prepare a training plan leading up to your selected event.";
      } else if (suggestion.includes('connect')) {
        response = "To connect with other players, visit the Community tab where you can:\n\n• Search for players by location and skill level\n• Join local Pickle+ groups\n• Use Partner Finder to match with compatible players\n• Create or join meetups\n\nWould you like me to help you find specific types of players?";
      } else if (suggestion.includes('CourtIQ')) {
        response = "Your CourtIQ™ performance shows your multi-dimensional rating across 5 key areas. Looking at your profile, your strongest dimensions are Technical Skills and Tactical Awareness, while you could benefit from development in Mental Toughness. Would you like me to recommend personalized drills to improve your weaker dimensions?";
      } else {
        response = "I can help you with that! As your Pickle+ concierge, I can guide you through any feature on the platform, help you find tournaments, connect with players, improve your skills, or track your progress. What aspect are you most interested in exploring?";
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
            <Bot className="h-5 w-5 mr-2 text-primary" />
            SAGE Concierge
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