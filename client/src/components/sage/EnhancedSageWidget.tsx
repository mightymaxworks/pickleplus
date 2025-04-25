/**
 * PKL-278651-SAGE-0029-API - Enhanced SAGE Widget
 * 
 * This component provides an enhanced SAGE interface that uses the context data
 * to provide personalized responses based on the user's CourtIQ profile.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSageData } from '@/contexts/SageDataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Send, BookOpen, Dumbbell, Medal, Award, Calendar, 
  Users, Brain, Target, LineChart, Info, Heart, ActivitySquare 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DimensionCode } from '@shared/schema/courtiq';

// Mapping of dimension codes to human-readable names
const dimensionLabels: Record<DimensionCode, string> = {
  'TECH': 'Technical Skills',
  'TACT': 'Tactical Awareness',
  'PHYS': 'Physical Fitness',
  'MENT': 'Mental Toughness',
  'CONS': 'Consistency'
};

// Mapping of dimension codes to badge colors
const dimensionColors: Record<DimensionCode, string> = {
  'TECH': 'bg-blue-500',
  'TACT': 'bg-purple-500',
  'PHYS': 'bg-green-500',
  'MENT': 'bg-amber-500',
  'CONS': 'bg-red-500'
};

// Interface for a SAGE message
interface SageMessage {
  role: 'user' | 'sage';
  content: string;
  timestamp: Date;
}

// Interface for contextual suggestions
interface SageSuggestion {
  text: string;
  icon: React.ElementType;
  category: 'general' | 'training' | 'social' | 'performance' | 'wellness' | 'subscription';
  relevanceScore: number;
}

export function EnhancedSageWidget() {
  // Get data from context
  const { 
    profile,
    courtIQ,
    subscription,
    drillRecommendations,
    matchHistory,
    isLoading,
    getWeakestDimension
  } = useSageData();
  
  // Base suggestions that might be relevant in various contexts
  const baseSuggestions: SageSuggestion[] = [
    { 
      text: "What features should I try first?", 
      icon: Info, 
      category: 'general',
      relevanceScore: 100
    },
    { 
      text: "How do I find tournaments?", 
      icon: Calendar, 
      category: 'social',
      relevanceScore: 80
    },
    { 
      text: "Help me connect with players", 
      icon: Users, 
      category: 'social',
      relevanceScore: 70
    },
    { 
      text: "Show me my CourtIQ stats", 
      icon: LineChart, 
      category: 'performance',
      relevanceScore: 90
    },
    { 
      text: "Recommend drills for my weak areas", 
      icon: Target, 
      category: 'training',
      relevanceScore: 85
    },
    { 
      text: "What's included in premium?", 
      icon: Medal, 
      category: 'subscription',
      relevanceScore: 60
    },
    { 
      text: "How can I improve my mental game?", 
      icon: Brain, 
      category: 'training',
      relevanceScore: 75
    },
    { 
      text: "Track my wellness journey", 
      icon: Heart, 
      category: 'wellness',
      relevanceScore: 65
    },
    {
      text: "Create a training plan", 
      icon: ActivitySquare, 
      category: 'training',
      relevanceScore: 80
    }
  ];
  
  // Local state for the chat
  const [messages, setMessages] = useState<SageMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [contextualSuggestions, setContextualSuggestions] = useState<SageSuggestion[]>([]);
  
  // Generate welcome message based on user data when data loads
  useEffect(() => {
    if (!isLoading && profile && courtIQ) {
      const weakestDimension = getWeakestDimension();
      const weakestDimensionName = weakestDimension ? dimensionLabels[weakestDimension] : '';
      
      const welcomeMessage: SageMessage = {
        role: 'sage',
        content: `Hello ${profile.displayName || profile.username}! 👋\n\nI'm SAGE, your Smart Assistant and Guidance Engine. I'm here to help you improve your pickleball game and navigate the Pickle+ platform.\n\n${weakestDimensionName ? `Based on your CourtIQ profile, I notice your ${weakestDimensionName} could use some focus. I can recommend drills to help you improve in this area.` : ''}\n\nHow can I assist you today?`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isLoading, profile, courtIQ, getWeakestDimension]);
  
  // Calculate contextual suggestions whenever messages change
  useEffect(() => {
    // Debug log for suggestion context
    console.log("[SAGE][DEBUG] Calculating new contextual suggestions...");
    
    const getSuggestions = () => {
    // If no messages yet, return general suggestions
    if (messages.length === 0) {
      return baseSuggestions
        .filter(s => s.category === 'general' || s.category === 'performance')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);
    }
    
    // Get the last sage message and last user message for context
    const lastSageMessage = [...messages].reverse().find(m => m.role === 'sage');
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    // Combine texts for analysis
    const contextText = [
      lastSageMessage?.content || '', 
      lastUserMessage?.content || ''
    ].join(' ').toLowerCase();
    
    // Contextual filtering based on message content and user data
    let relevantCategories: string[] = [];
    
    // Add categories based on conversation keywords
    if (contextText.includes('drill') || contextText.includes('practice') || 
        contextText.includes('improve') || contextText.includes('skill')) {
      relevantCategories.push('training');
    }
    
    if (contextText.includes('match') || contextText.includes('game') || 
        contextText.includes('play') || contextText.includes('record')) {
      relevantCategories.push('performance');
    }
    
    if (contextText.includes('connect') || contextText.includes('player') || 
        contextText.includes('tournament') || contextText.includes('social')) {
      relevantCategories.push('social');
    }
    
    if (contextText.includes('subscription') || contextText.includes('premium') || 
        contextText.includes('pay') || contextText.includes('upgrade')) {
      relevantCategories.push('subscription');
    }
    
    if (contextText.includes('wellness') || contextText.includes('journal') || 
        contextText.includes('mental') || contextText.includes('health')) {
      relevantCategories.push('wellness');
    }
    
    // Add categories based on user data
    if (courtIQ && getWeakestDimension() === 'MENT') {
      // If mental toughness is the weakest dimension, suggest mental game improvements
      if (!relevantCategories.includes('wellness')) {
        relevantCategories.push('wellness');
      }
    }
    
    if (!subscription?.isPremium && lastSageMessage?.content.includes('limited')) {
      // If non-premium user hits a limit, suggest upgrade
      if (!relevantCategories.includes('subscription')) {
        relevantCategories.push('subscription');
      }
    }
    
    // If no relevant categories found, include general
    if (relevantCategories.length === 0) {
      relevantCategories.push('general');
    }
    
    // Filter suggestions by relevant categories and sort by relevance
    let contextualSuggestions = baseSuggestions
      .filter(s => relevantCategories.includes(s.category))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
    
    // If there aren't enough suggestions, add some general ones
    if (contextualSuggestions.length < 3) {
      const generalSuggestions = baseSuggestions
        .filter(s => s.category === 'general')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3 - contextualSuggestions.length);
      
      contextualSuggestions = [...contextualSuggestions, ...generalSuggestions];
    }
    
    return contextualSuggestions;
    }
    
    // Get the suggestions and update state
    const newSuggestions = getSuggestions();
    
    // Debug - log the categories of suggestions for debugging
    const categories = newSuggestions.map(s => s.category);
    console.log("[SAGE][DEBUG] New suggestions categories:", categories);
    
    setContextualSuggestions(newSuggestions);
  }, [messages, courtIQ, subscription, getWeakestDimension, baseSuggestions]);
  
  // Handle suggestion button click
  const handleSuggestionClick = (suggestion: SageSuggestion) => {
    setInputValue(suggestion.text);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    
    const userMessage: SageMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would make an API call to the SAGE backend
      // For now, we'll simulate a response based on context data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let responseContent = '';
      
      // Simple keyword-based responses using the data we have
      const input = inputValue.toLowerCase();
      if (input.includes('drill') || input.includes('practice') || input.includes('improve')) {
        if (drillRecommendations && drillRecommendations.drills.length > 0) {
          responseContent = `Here are some drill recommendations based on your CourtIQ profile:\n\n${
            drillRecommendations.drills.map((drill, index) => 
              `${index + 1}. **${drill.name}** - ${drill.description}`
            ).join('\n\n')
          }`;
          
          if (!subscription?.isPremium && drillRecommendations.drills.length === 3) {
            responseContent += '\n\n**Note:** Free users are limited to 3 drill recommendations. Upgrade to Pickle+ Basic or Power for unlimited access.';
          }
        } else {
          responseContent = "I'd be happy to recommend some drills for you! However, I'm still analyzing your play style. Check back soon.";
        }
      } else if (input.includes('match') || input.includes('game') || input.includes('play')) {
        if (matchHistory && matchHistory.length > 0) {
          responseContent = `I see you've played ${matchHistory.length} recent matches. Here's a summary:\n\n${
            matchHistory.map((match, index) => 
              `${index + 1}. **${match.outcome}** against Player ${match.opponentId} with a score of ${match.score} on ${new Date(match.date).toLocaleDateString()}`
            ).join('\n\n')
          }`;
        } else {
          responseContent = "I don't see any recent matches in your history. When you record your next match, I'll be able to provide insights on your performance.";
        }
      } else if (input.includes('level') || input.includes('rating') || input.includes('courtiq') || input.includes('score')) {
        if (courtIQ) {
          responseContent = `Here's your current CourtIQ profile:\n\n${
            Object.entries(courtIQ.ratings).map(([dim, rating]) => 
              `- **${dimensionLabels[dim as DimensionCode]}**: ${rating}/5`
            ).join('\n')
          }\n\nYour strongest dimension is ${dimensionLabels[courtIQ.strongestDimension]}, and your area for improvement is ${dimensionLabels[courtIQ.weakestDimension]}.`;
        } else {
          responseContent = "I'm still analyzing your play style to generate your CourtIQ ratings. Check back soon!";
        }
      } else if (input.includes('subscription') || input.includes('premium') || input.includes('upgrade')) {
        if (subscription) {
          if (subscription.isPremium) {
            responseContent = `You're currently on the ${subscription.tier} plan. Thank you for being a premium member! You have access to all premium features ${subscription.expiresAt ? `until ${new Date(subscription.expiresAt).toLocaleDateString()}` : ''}.`;
          } else {
            responseContent = "You're currently on the FREE plan. Upgrade to Pickle+ Basic ($5.99/month) for unlimited drills or Pickle+ Power ($11.99/month) for the full experience including personalized training plans and video analysis.";
          }
        } else {
          responseContent = "I'm not able to access your subscription information at the moment. Please try again later.";
        }
      } else {
        responseContent = "I'm here to help you improve your pickleball game and navigate the Pickle+ platform. You can ask me about drills, match history, your CourtIQ ratings, or subscription options.";
      }
      
      const sageResponse: SageMessage = {
        role: 'sage',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, sageResponse]);
    } catch (error) {
      console.error('Error sending message to SAGE:', error);
      const errorMessage: SageMessage = {
        role: 'sage',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle pressing Enter to send a message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">SAGE</span>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1">Your Profile</TabsTrigger>
          <TabsTrigger value="drills" className="flex-1">Drills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-0">
          <CardContent className="p-4 h-[350px] overflow-y-auto space-y-4">
            {messages.length === 0 && isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-2" />
                <p>SAGE is ready to assist you with your pickleball journey.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert break-words">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex-col space-y-3">
            {/* Contextual Suggestion Buttons */}
            <div className="flex flex-wrap gap-2 w-full">
              {contextualSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 py-1 h-auto"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isSubmitting}
                >
                  {React.createElement(suggestion.icon, { className: "h-3 w-3" })}
                  <span>{suggestion.text}</span>
                </Button>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask SAGE something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-10 flex-1"
                disabled={isLoading || isSubmitting}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={isLoading || isSubmitting || !inputValue.trim()}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-0">
          <CardContent className="p-4 h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {profile?.avatarUrl && (
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img 
                        src={profile.avatarUrl} 
                        alt={profile?.displayName || 'User avatar'} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{profile?.displayName || profile?.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      Level {profile?.level} • {profile?.xp} XP
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">CourtIQ Ratings</h3>
                  {courtIQ && (
                    <div className="space-y-3">
                      {Object.entries(courtIQ.ratings).map(([dim, rating]) => (
                        <div key={dim} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{dimensionLabels[dim as DimensionCode]}</span>
                            <Badge
                              variant="outline"
                              className={
                                dim === courtIQ.strongestDimension
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : dim === courtIQ.weakestDimension
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : ''
                              }
                            >
                              {rating}/5
                              {dim === courtIQ.strongestDimension && ' • Strongest'}
                              {dim === courtIQ.weakestDimension && ' • Focus Area'}
                            </Badge>
                          </div>
                          <Progress value={rating * 20} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Subscription Status</h3>
                  {subscription && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Plan</span>
                        <Badge variant={subscription.isPremium ? 'default' : 'outline'}>
                          {subscription.tier}
                        </Badge>
                      </div>
                      {subscription.expiresAt && (
                        <div className="flex justify-between text-sm">
                          <span>Expires</span>
                          <span>{new Date(subscription.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1">Features</h4>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center space-x-2">
                            <span className={subscription.features.unlimitedDrills ? "text-green-500" : "text-muted-foreground"}>
                              {subscription.features.unlimitedDrills ? '✓' : '×'}
                            </span>
                            <span>Unlimited Drill Recommendations</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className={subscription.features.personalizedPlans ? "text-green-500" : "text-muted-foreground"}>
                              {subscription.features.personalizedPlans ? '✓' : '×'}
                            </span>
                            <span>Personalized Training Plans</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className={subscription.features.videoAnalysis ? "text-green-500" : "text-muted-foreground"}>
                              {subscription.features.videoAnalysis ? '✓' : '×'}
                            </span>
                            <span>Video Analysis</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="drills" className="mt-0">
          <CardContent className="p-4 h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : drillRecommendations && drillRecommendations.drills.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recommended Drills</h3>
                  <Badge variant="outline">
                    {dimensionLabels[drillRecommendations.dimension]} Level {drillRecommendations.level}
                  </Badge>
                </div>
                
                {!subscription?.isPremium && (
                  <div className="rounded-lg bg-amber-500/10 p-3 text-sm">
                    <p className="font-medium text-amber-500">Free Plan Limit</p>
                    <p className="text-muted-foreground">You're limited to 3 drill recommendations. Upgrade for unlimited access.</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {drillRecommendations.drills.map((drill) => (
                    <Card key={drill.id} className="overflow-hidden">
                      <div className="bg-primary/5 p-3 flex items-center justify-between">
                        <h4 className="font-medium">{drill.name}</h4>
                        <Badge className={dimensionColors[drill.dimension]}>
                          {drill.dimension}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm">{drill.description}</p>
                        {drill.videoUrl && (
                          <Button variant="ghost" size="sm" className="mt-2 w-full text-xs">
                            Watch Video
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mb-2" />
                <p>No drill recommendations available yet.</p>
                <p className="text-sm mt-1">SAGE is still analyzing your play style.</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}