/**
 * PKL-278651-SAGE-0028-ASSISTANT
 * SAGE Platform Assistant Interface
 * 
 * This component provides an immediate SAGE interaction interface
 * directly on the dashboard to guide users throughout the platform.
 * 
 * @framework Framework5.3
 * @version 2.1.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, Map, Calendar, Users, Settings, Star, Search, PlusCircle,
  Info, LineChart, Target, Brain, Heart, Trophy, Medal
} from "lucide-react";
import { useLocation } from 'wouter';

// Interface for SAGE link with navigation capability
interface SageLink {
  text: string;
  url: string;
  type: 'primary' | 'secondary';
}

// Interface for quick suggestions with improved context
interface SageSuggestion {
  text: string;
  icon: React.ElementType;
  category: 'general' | 'training' | 'social' | 'performance' | 'wellness' | 'subscription';
  link?: string; // Direct link to platform pages
}

// Enhanced quick suggestions with links and categories
const SAGE_SUGGESTIONS: SageSuggestion[] = [
  { 
    text: "What features should I try first?", 
    icon: Info, 
    category: 'general'
    // Removed direct link to use conversation instead
  },
  { 
    text: "How do I find tournaments?", 
    icon: Calendar, 
    category: 'social',
    link: "/events" // Updated to existing route
  },
  { 
    text: "Help me connect with players", 
    icon: Users, 
    category: 'social',
    link: "/community/discovery" // Updated to existing route
  },
  { 
    text: "Show me my CourtIQ stats", 
    icon: LineChart, 
    category: 'performance',
    link: "/profile" // Updated to existing route
  },
  { 
    text: "Recommend drills for me", 
    icon: Target, 
    category: 'training',
    link: "/training/drills" // Updated to existing route
  },
  { 
    text: "What's included in premium?", 
    icon: Medal, 
    category: 'subscription',
    link: "/account/subscription" // Updated to existing route
  },
  { 
    text: "How can I improve my mental game?", 
    icon: Brain, 
    category: 'training',
    link: "/training/mental" // Updated to existing route
  },
  { 
    text: "Track my wellness journey", 
    icon: Heart, 
    category: 'wellness'
    // Removed direct link for future feature
  }
];

// Enhanced message type with deep links
interface SageMessage {
  role: 'user'|'sage';
  content: string;
  timestamp?: Date;
  links?: SageLink[];
}

export default function SimpleSageWidget() {
  const [, navigate] = useLocation();
  const [userMessage, setUserMessage] = useState('');
  
  // Add welcome links to the initial message
  const welcomeLinks: SageLink[] = [
    {
      text: 'View Profile',
      url: '/profile',
      type: 'primary'
    },
    {
      text: 'Find Players',
      url: '/community/discovery',
      type: 'secondary'
    }
  ];
  
  const [conversations, setConversations] = useState<SageMessage[]>([
    {
      role: 'sage', 
      content: "👋 Hi! I'm SAGE, your personal assistant. I can help you explore Pickle+ features, find players, discover tournaments, or improve your game. What would you like to do today?",
      timestamp: new Date(),
      links: welcomeLinks
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current contextual suggestions based on conversation
  const [contextualSuggestions, setContextualSuggestions] = useState<SageSuggestion[]>([]);
  
  // Initialize with default suggestions
  const defaultSuggestions = useMemo(() => {
    return SAGE_SUGGESTIONS.filter(s => s.category === 'general').slice(0, 3);
  }, []);
  
  // Update contextual suggestions on component mount
  useEffect(() => {
    setContextualSuggestions(defaultSuggestions);
  }, [defaultSuggestions]);
  
  // Scroll to bottom of messages whenever conversations change
  // Use scrollIntoView with block: 'nearest' to prevent page scrolling
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' // This prevents the page from scrolling excessively
      });
    }
  }, [conversations]);
  
  // Function to navigate to full SAGE experience
  const navigateToSage = () => {
    navigate('/coach/sage');
  };
  
  // Helper function to get contextual suggestions based on message content
  const getContextualSuggestions = useCallback((content: string = '') => {
    console.log("[SAGE] Getting contextual suggestions for content:", content);
    
    // Default suggestions (general)
    let defaultSuggestions = SAGE_SUGGESTIONS
      .filter(s => s.category === 'general')
      .slice(0, 3);
      
    // If no content, return default
    if (!content) {
      return defaultSuggestions;
    }
    
    content = content.toLowerCase();
    
    // Simple keyword matching for categories
    if (content.includes('drill') || content.includes('practice') || content.includes('improve')) {
      return SAGE_SUGGESTIONS
        .filter(s => s.category === 'training')
        .slice(0, 3);
    }
    
    if (content.includes('match') || content.includes('game') || content.includes('play') || 
        content.includes('tournament') || content.includes('event')) {
      return SAGE_SUGGESTIONS
        .filter(s => s.category === 'performance' || s.category === 'social')
        .slice(0, 3);
    }
    
    if (content.includes('connect') || content.includes('social') || 
        content.includes('community') || content.includes('player')) {
      return SAGE_SUGGESTIONS
        .filter(s => s.category === 'social')
        .slice(0, 3);
    }
    
    if (content.includes('subscription') || content.includes('premium') || content.includes('upgrade')) {
      return SAGE_SUGGESTIONS
        .filter(s => s.category === 'subscription')
        .slice(0, 3);
    }
    
    if (content.includes('wellness') || content.includes('journal') || content.includes('mental')) {
      return SAGE_SUGGESTIONS
        .filter(s => s.category === 'wellness')
        .slice(0, 3);
    }
    
    return defaultSuggestions;
  }, []);

  // Update suggestions whenever messages change
  useEffect(() => {
    if (conversations.length === 0) {
      setContextualSuggestions(defaultSuggestions);
      return;
    }
    
    // Get the last SAGE message to update suggestions
    const lastSageMsg = [...conversations].reverse().find(msg => msg.role === 'sage');
    if (lastSageMsg) {
      const newSuggestions = getContextualSuggestions(lastSageMsg.content);
      setContextualSuggestions(newSuggestions);
    }
  }, [conversations, defaultSuggestions, getContextualSuggestions]);
  
  // Function to handle user input submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    
    // Create user message
    const userMsg: SageMessage = {
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    };
    
    // Add user message to conversation
    setConversations([...conversations, userMsg]);
    
    // Simulate SAGE response (in a real implementation, this would call the API)
    setTimeout(() => {
      // Generate a contextual response based on platform features
      let response: string;
      let links: SageLink[] = [];
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('feature') || msg.includes('try') || msg.includes('new')) {
        response = "Based on your profile, I'd recommend exploring these Pickle+ features:\n\n1. CourtIQ™ Performance - track your multi-dimensional skill ratings\n2. Community Hub - connect with players in your area\n3. Tournament Finder - discover upcoming events\n\nWhat would you like to explore first?";
        
        links = [
          { text: 'Profile Stats', url: '/profile', type: 'primary' },
          { text: 'Community', url: '/community/discovery', type: 'secondary' },
          { text: 'Find Events', url: '/events', type: 'secondary' }
        ];
      } else if (msg.includes('tournament') || msg.includes('event') || msg.includes('play')) {
        response = "The Tournament Finder is your hub for events! Head to the Events tab to browse upcoming tournaments filtered by location, skill level, and format. You can register directly through Pickle+, and I can help you prepare a training plan leading up to your selected event.";
        
        links = [
          { text: 'Events Calendar', url: '/events', type: 'primary' },
          { text: 'Profile', url: '/profile', type: 'secondary' }
        ];
      } else if (msg.includes('player') || msg.includes('partner') || msg.includes('connect') || msg.includes('friend')) {
        response = "To connect with other players, visit the Community tab where you can:\n\n• Search for players by location and skill level\n• Join local Pickle+ groups\n• Use Partner Finder to match with compatible players\n• Create or join meetups\n\nWould you like me to help you find specific types of players?";
        
        links = [
          { text: 'Find Players', url: '/community/discovery', type: 'primary' },
          { text: 'Community', url: '/community', type: 'secondary' }
        ];
      } else if (msg.includes('stat') || msg.includes('courtiq') || msg.includes('rating') || msg.includes('score')) {
        response = "Your CourtIQ™ performance shows your multi-dimensional rating across 5 key areas. Looking at your profile, your strongest dimensions are Technical Skills and Tactical Awareness, while you could benefit from development in Mental Toughness. Would you like me to recommend personalized drills to improve your weaker dimensions?";
        
        links = [
          { text: 'View Profile', url: '/profile', type: 'primary' },
          { text: 'Leaderboard', url: '/leaderboard', type: 'secondary' }
        ];
      } else if (msg.includes('coach') || msg.includes('drill') || msg.includes('improve') || msg.includes('learn')) {
        response = "I can help with your pickleball skills! The Coaching section offers:\n\n• Personalized drill recommendations\n• Technique analysis\n• Strategy guides for different play styles\n• Mental game development\n\nWhat specific aspect of your game would you like to work on?";
        
        links = [
          { text: 'Training', url: '/training', type: 'primary' },
          { text: 'Profile', url: '/profile', type: 'secondary' }
        ];
      } else {
        response = "I can help you with that! As your personal assistant, I can guide you through any feature on the platform, help you find tournaments, connect with players, improve your skills, or track your progress. What aspect are you most interested in exploring?";
      }
      
      // Create SAGE response with links
      const sageResponse: SageMessage = {
        role: 'sage', 
        content: response,
        timestamp: new Date(),
        links: links.length > 0 ? links : undefined
      };
      
      setConversations(prev => [...prev, sageResponse]);
      
      // Update contextual suggestions
      setContextualSuggestions(getContextualSuggestions(response));
    }, 500);
    
    setUserMessage('');
  };
  
  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion: SageSuggestion) => {
    // If the suggestion has a direct link, navigate to it
    if (suggestion.link) {
      console.log(`[SAGE] Navigating to ${suggestion.link}`);
      navigate(suggestion.link);
      return;
    }
    
    // Otherwise use it as a message
    setUserMessage(suggestion.text);
    
    // Create user message
    const userMsg: SageMessage = {
      role: 'user', 
      content: suggestion.text,
      timestamp: new Date()
    };
    
    setConversations([...conversations, userMsg]);
    
    // Simulate SAGE response
    setTimeout(() => {
      let response: string;
      let links: SageLink[] = [];
      
      if (suggestion.text.includes('features')) {
        response = "Based on your profile, I'd recommend exploring these Pickle+ features:\n\n1. CourtIQ™ Performance - track your multi-dimensional skill ratings\n2. Community Hub - connect with players in your area\n3. Tournament Finder - discover upcoming events\n\nWhat would you like to explore first?";
        
        links = [
          { text: 'Profile Stats', url: '/profile', type: 'primary' },
          { text: 'Community', url: '/community/discovery', type: 'secondary' },
          { text: 'Find Events', url: '/events', type: 'secondary' }
        ];
      } else if (suggestion.text.includes('tournaments')) {
        response = "The Tournament Finder is your hub for events! Head to the Events tab to browse upcoming tournaments filtered by location, skill level, and format. You can register directly through Pickle+, and I can help you prepare a training plan leading up to your selected event.";
        
        links = [
          { text: 'Events Calendar', url: '/events', type: 'primary' },
          { text: 'Profile', url: '/profile', type: 'secondary' }
        ];
      } else if (suggestion.text.includes('connect')) {
        response = "To connect with other players, visit the Community tab where you can:\n\n• Search for players by location and skill level\n• Join local Pickle+ groups\n• Use Partner Finder to match with compatible players\n• Create or join meetups\n\nWould you like me to help you find specific types of players?";
        
        links = [
          { text: 'Find Players', url: '/community/discovery', type: 'primary' },
          { text: 'Community', url: '/community', type: 'secondary' }
        ];
      } else if (suggestion.text.includes('CourtIQ')) {
        response = "Your CourtIQ™ performance shows your multi-dimensional rating across 5 key areas. Looking at your profile, your strongest dimensions are Technical Skills and Tactical Awareness, while you could benefit from development in Mental Toughness. Would you like me to recommend personalized drills to improve your weaker dimensions?";
        
        links = [
          { text: 'View Profile', url: '/profile', type: 'primary' },
          { text: 'Leaderboard', url: '/leaderboard', type: 'secondary' }
        ];
      } else {
        response = "I can help you with that! As your personal assistant, I can guide you through any feature on the platform, help you find tournaments, connect with players, improve your skills, or track your progress. What aspect are you most interested in exploring?";
      }
      
      // Create SAGE response with links
      const sageResponse: SageMessage = {
        role: 'sage', 
        content: response,
        timestamp: new Date(),
        links: links.length > 0 ? links : undefined
      };
      
      setConversations(prev => [...prev, sageResponse]);
      
      // Update contextual suggestions
      setContextualSuggestions(getContextualSuggestions(response));
    }, 500);
    
    setUserMessage('');
  };
  
  // Function to handle link click
  const handleLinkClick = (url: string) => {
    console.log(`[SAGE] Navigating to link: ${url}`);
    navigate(url);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            SAGE
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
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Message bubble */}
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {msg.content}
              </div>
              
              {/* Action links if present */}
              {msg.links && msg.links.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1 ml-1">
                  {msg.links.map((link, j) => (
                    <button
                      key={j}
                      onClick={() => handleLinkClick(link.url)}
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        link.type === 'primary'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {link.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <div className="px-3 pb-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {contextualSuggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full whitespace-nowrap"
            >
              {React.createElement(suggestion.icon, { className: "h-3 w-3" })}
              {suggestion.text}
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