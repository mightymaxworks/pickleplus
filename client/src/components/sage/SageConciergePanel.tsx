/**
 * PKL-278651-SAGE-0013-CONCIERGE
 * SAGE Concierge Panel Component
 * 
 * This component provides an interface for interacting with the SAGE Concierge,
 * allowing users to navigate the platform through conversational interactions.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Compass, Send, Navigation, MapPin, BookOpen, BarChart4, Lightbulb } from "lucide-react";
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  NavigationAction,
  NavigationActionType,
  PlatformFeature
} from '@shared/types/sage-concierge';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  action?: NavigationAction;
}

// Generates a unique ID for messages
const generateId = () => `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export function SageConciergePanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your SAGE Concierge. How can I help you navigate the Pickle+ platform today?",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Scrolls to the bottom of the message list when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send navigation request to API
  const navigationMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/coach/sage/concierge/navigate', { message });
      return res.json();
    },
    onSuccess: (data: { action: NavigationAction }) => {
      // Add SAGE's response to messages
      const actionDescription = data.action.description || 'I can help you navigate to that.';
      
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          content: actionDescription,
          isUser: false,
          action: data.action
        }
      ]);
      
      // If action is NAVIGATE, track and then navigate the user
      if (data.action.type === 'NAVIGATE' && data.action.target) {
        trackInteraction(data.action);
        // Give user a moment to read the response before navigating
        setTimeout(() => {
          navigate(data.action.target);
        }, 1500);
      }
    },
    onError: (error: Error) => {
      console.error('Navigation request failed:', error);
      toast({
        title: 'Communication Error',
        description: 'I had trouble understanding that request. Please try again.',
        variant: 'destructive'
      });
      
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          content: "I'm sorry, I couldn't process that request. Please try asking in a different way.",
          isUser: false
        }
      ]);
    }
  });
  
  // Track interaction with the concierge
  const trackMutation = useMutation({
    mutationFn: async (data: { 
      messageContent: string, 
      navigationType: string, 
      navigationTarget: string,
      dimension?: string,
      isCompleted: boolean
    }) => {
      const res = await apiRequest('POST', '/api/coach/sage/concierge/track', data);
      return res.json();
    },
    onError: (error) => {
      console.error('Failed to track interaction:', error);
    }
  });
  
  // Get recommendations based on user profile
  const { data: recommendations } = useQuery({
    queryKey: ['/api/coach/sage/concierge/recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/coach/sage/concierge/recommendations?type=all');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const trackInteraction = (action: NavigationAction) => {
    trackMutation.mutate({
      messageContent: inputValue,
      navigationType: action.type,
      navigationTarget: action.target,
      dimension: action.dimension,
      isCompleted: action.type === 'NAVIGATE'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        content: inputValue,
        isUser: true
      }
    ]);
    
    // Send to API
    navigationMutation.mutate(inputValue);
    
    // Clear input
    setInputValue('');
  };
  
  const handleQuickAction = (action: string) => {
    setInputValue(action);
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        content: action,
        isUser: true
      }
    ]);
    
    // Send to API
    navigationMutation.mutate(action);
  };
  
  // Generate action icon based on action type
  const getActionIcon = (type: NavigationActionType) => {
    switch (type) {
      case 'NAVIGATE':
        return <Navigation className="w-4 h-4 mr-2" />;
      case 'RECOMMEND':
        return <Lightbulb className="w-4 h-4 mr-2" />;
      case 'EXPLAIN':
        return <BookOpen className="w-4 h-4 mr-2" />;
      case 'OVERVIEW':
        return <BarChart4 className="w-4 h-4 mr-2" />;
      default:
        return <Compass className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <Card className="flex flex-col h-[500px] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-semibold">
          <Compass className="w-5 h-5 mr-2" />
          SAGE Concierge
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-2 max-w-[80%]">
                {!message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/assets/sage-avatar.png" alt="SAGE" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  <div 
                    className={`rounded-lg p-3 ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {/* Action buttons for SAGE responses */}
                  {!message.isUser && message.action && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.action.type === 'NAVIGATE' && message.action.target && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center text-xs"
                          onClick={() => navigate(message.action!.target)}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {message.action.feature?.primaryAction || 'Go there now'}
                        </Button>
                      )}
                      
                      {message.action.type === 'RECOMMEND' && message.action.feature && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center text-xs"
                          onClick={() => navigate(message.action!.target)}
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {message.action.feature.primaryAction || 'View recommendation'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {/* Quick action suggestions */}
      {recommendations && recommendations.length > 0 && (
        <div className="px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickAction("Where can I find drills?")}
            >
              Find drills
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickAction("Show me upcoming tournaments")}
            >
              Tournaments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickAction("Take me to my profile")}
            >
              My profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => handleQuickAction("What features does Pickle+ have?")}
            >
              Platform overview
            </Button>
          </div>
        </div>
      )}
      
      <CardFooter className="pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ask SAGE where to find features..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={navigationMutation.isPending}
          />
          <Button type="submit" size="icon" disabled={navigationMutation.isPending || !inputValue.trim()}>
            {navigationMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}