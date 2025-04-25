/**
 * PKL-278651-SAGE-0002-CONV
 * SAGE Conversational UI Component
 * 
 * This component implements a chat-style interface for interacting with the
 * S.A.G.E. coaching system. It allows users to have natural conversations
 * about their pickleball skills and receive coaching advice.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import { 
  Send, 
  User, 
  Brain, 
  Bot, 
  RefreshCw, 
  Lightbulb, 
  Dumbbell,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Message types for conversation
interface Message {
  id: string;
  type: 'user' | 'sage' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    recommendationType?: 'training' | 'insight' | 'schedule';
    dimensionFocus?: string;
    feedback?: 'positive' | 'negative' | null;
    sessionId?: number;
    planId?: number;
  };
}

// Current conversation state
interface ConversationState {
  sessionId?: number;
  topic?: string;
  dimensionFocus?: string;
  startedAt: Date;
  messages: Message[];
}

export default function SageConversationPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationState>({
    startedAt: new Date(),
    messages: [
      {
        id: 'welcome',
        type: 'system',
        content: 'Welcome to S.A.G.E. (Skills Assessment & Growth Engine), your personal pickleball assistant. I can help you improve your game with personalized coaching and also help you navigate Pickle+ features. Ask me about training, tournaments, CourtIQ ratings, or any other platform features!',
        timestamp: new Date()
      }
    ]
  });
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);
  
  // Fetch previous conversations if they exist
  const { data: savedConversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: [`/api/coach/sage/conversation`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user
  });
  
  // Load saved conversation if available
  useEffect(() => {
    if (savedConversation && savedConversation.messages && savedConversation.messages.length > 0) {
      setConversation(savedConversation);
    }
  }, [savedConversation]);
  
  // Query the extended knowledge base for relevant content
  const queryKnowledgeBase = async (query: string): Promise<any> => {
    try {
      // First, try to get intent-based knowledge using the POST endpoint
      const intentResponse = await apiRequest(
        "POST",
        "/api/coach/sage/knowledge/intent",
        {
          query,
          intent: query.toLowerCase().includes('drill') || 
                  query.toLowerCase().includes('practice') || 
                  query.toLowerCase().includes('training') 
                    ? 'training' 
                    : 'general'
        }
      );
      
      if (intentResponse.ok) {
        return await intentResponse.json();
      }
      
      // Fallback to search if intent-based query fails
      const searchResponse = await apiRequest(
        "GET",
        `/api/coach/sage/knowledge/search?query=${encodeURIComponent(query)}`
      );
      
      if (searchResponse.ok) {
        return await searchResponse.json();
      }
      
      return null;
    } catch (error) {
      console.error("Error querying knowledge base:", error);
      return null;
    }
  };
  
  // Send message to SAGE
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      // First, check if there's relevant knowledge base content
      const knowledgeResults = await queryKnowledgeBase(messageContent);
      
      // Send message to SAGE conversation API
      const response = await apiRequest(
        "POST", 
        "/api/coach/sage/conversation", 
        { 
          message: messageContent,
          conversationId: conversation.sessionId,
          // Include knowledge base results if available
          knowledgeResults: knowledgeResults?.success ? knowledgeResults : undefined
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update conversation with response
      setConversation(prevConversation => ({
        ...prevConversation,
        sessionId: data.sessionId || prevConversation.sessionId,
        topic: data.topic || prevConversation.topic,
        dimensionFocus: data.dimensionFocus || prevConversation.dimensionFocus,
        messages: [
          ...prevConversation.messages,
          ...data.newMessages
        ]
      }));
      
      // Clear input field
      setMessage('');
    },
    onError: (error: Error) => {
      // In development mode, simulate a rule-based response with knowledge base integration
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Simulating SAGE response with knowledge base integration');
        
        // Create user message
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: message,
          timestamp: new Date()
        };
        
        // Create SAGE response based on user message
        let sageResponse: Message;
        
        // First, check if we need knowledge base information
        const isKnowledgeQuery = 
          message.toLowerCase().includes('what is') || 
          message.toLowerCase().includes('how do') || 
          message.toLowerCase().includes('explain') || 
          message.toLowerCase().includes('define') ||
          message.toLowerCase().includes('tell me about');
          
        // Check if this is a concierge request (exploring platform features)
        const isConciergeQuery = 
          message.toLowerCase().includes('feature') || 
          message.toLowerCase().includes('show me') || 
          message.toLowerCase().includes('help me find') ||
          message.toLowerCase().includes('where is') ||
          message.toLowerCase().includes('how to access') ||
          message.toLowerCase().includes('navigate');
        
        // Simple rule-based responses
        const lowerMessage = message.toLowerCase();
        
        // Check for concierge/feature exploration queries first
        if (isConciergeQuery && (lowerMessage.includes('tournament') || lowerMessage.includes('match'))) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: `# Tournament & Match Features

Pickle+ offers comprehensive tournament and match tracking capabilities to enhance your competitive experience.

## Tournament Features

Our tournament system allows you to:
- Browse upcoming tournaments in your area
- Register for events with seamless payment
- Track your bracket and upcoming matches
- Receive notifications about schedule changes
- View complete match history and statistics

## Match Recording

The match recording system helps you:
- Log casual and competitive matches
- Track scores and key statistics
- Analyze your performance trends
- Share results with friends and teammates
- Build your CourtIQ™ profile

Would you like me to help you navigate to one of these features?`,
            timestamp: new Date()
          };
        }
        else if (isConciergeQuery && (lowerMessage.includes('subscription') || lowerMessage.includes('pricing') || lowerMessage.includes('plan'))) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: `# Pickle+ Subscription Plans

Pickle+ offers flexible subscription tiers designed to match your commitment level and help you reach your pickleball goals.

## Free Plan

Our free tier gives you access to:
- Basic match recording and statistics
- Public tournament information
- Community forum access
- Basic CourtIQ™ assessment
- Limited SAGE coaching (3 drill recommendations per month)

## Basic Plan - $5.99/month

The Basic Plan includes everything in Free, plus:
- Unlimited SAGE coaching conversations
- Complete training plans and drills
- Full match analytics and insights
- Expanded CourtIQ™ metrics
- Early tournament registration

## Power Plan - $11.99/month

For serious players, the Power Plan includes everything in Basic, plus:
- Advanced training programs with video analysis
- Priority SAGE coaching responses
- Exclusive advanced drills
- Tournament strategy guides
- Customized improvement roadmaps

Would you like to see a detailed feature comparison or learn how to upgrade your account?`,
            timestamp: new Date()
          };
        }
        else if (isConciergeQuery && (lowerMessage.includes('courtiq') || lowerMessage.includes('rating'))) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: `# CourtIQ™ Multi-Dimensional Rating System

CourtIQ™ is Pickle+'s proprietary rating system that provides a comprehensive view of your pickleball abilities across five key dimensions.

## The Five Dimensions

1. **Technical Skills (TECH)** - Your shot execution, form, and mechanical abilities
2. **Tactical Awareness (TACT)** - Your strategic decision-making and court positioning
3. **Physical Fitness (PHYS)** - Your speed, endurance, and athletic capabilities
4. **Mental Toughness (MENT)** - Your focus, composure, and competitive mindset
5. **Consistency (CONS)** - Your ability to maintain performance levels over time

## How It Works

CourtIQ™ analyzes your match results, practice sessions, and specialized assessments to generate scores in each dimension on a scale of 1-5. This creates a complete picture of your strengths and areas for improvement.

Would you like to see your current CourtIQ™ profile or learn how to improve specific dimensions?`,
            timestamp: new Date()
          };
        }
        // Then check for knowledge base related queries
        else if (isKnowledgeQuery && lowerMessage.includes('beginner') && (lowerMessage.includes('drill') || lowerMessage.includes('practice'))) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: `# Beginner Pickleball Drills

Getting started with pickleball is exciting, and these fundamental drills will help you build a solid foundation for your game.

## Why Beginner Drills Matter

Beginner drills are essential because they:
- Build proper technique from the start
- Develop consistent shot-making abilities
- Create muscle memory for fundamental movements
- Increase confidence on the court
- Make the game more enjoyable as you improve

## Core Beginner Skills to Practice

### Dinking
The soft game at the kitchen line is the heart of pickleball. Practicing controlled dinks helps you develop touch and consistency.

### Serving & Return
Every point starts with a serve and return. These are your first opportunity to set up a successful point or neutralize your opponent's advantage.

Would you like me to recommend specific drills for any of these skills?`,
            timestamp: new Date(),
            metadata: {
              recommendationType: 'training',
              dimensionFocus: 'TECH'
            }
          };
        }
        else if (isKnowledgeQuery && lowerMessage.includes('mental') && (lowerMessage.includes('game') || lowerMessage.includes('toughness'))) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: `# The Mental Side of Pickleball

The mental game is often what separates good players from great ones. Developing mental toughness and psychological skills can dramatically improve your pickleball performance.

## Why Mental Skills Matter

In pickleball, mental skills are crucial because:
- Matches can shift momentum quickly
- Quick decisions must be made under pressure
- Errors can lead to frustration if not managed
- Confidence affects how aggressively you play
- Focus determines how well you execute shots

## Key Mental Skills to Develop

### Focus & Concentration
Learn to direct your attention where it matters most and block out distractions during play.

### Emotional Management
Develop techniques to stay calm under pressure and recover quickly from mistakes or setbacks.

Would you like specific exercises to improve your mental game?`,
            timestamp: new Date(),
            metadata: {
              recommendationType: 'training',
              dimensionFocus: 'MENT'
            }
          };
        }
        else if (lowerMessage.includes('dink') || lowerMessage.includes('third shot')) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'Your dinking technique is crucial for controlling the game. For better third shots and dinks, focus on paddle angle and keeping your wrist firm. Would you like me to create a training plan focused on your technical skills?',
            timestamp: new Date(),
            metadata: {
              recommendationType: 'training',
              dimensionFocus: 'TECH'
            }
          };
        } else if (lowerMessage.includes('strategy') || lowerMessage.includes('position')) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'Court positioning and strategy are key tactical elements. I notice you might benefit from working on your tactical awareness. Remember to return to the middle after each shot and communicate clearly with your partner.',
            timestamp: new Date(),
            metadata: {
              recommendationType: 'insight',
              dimensionFocus: 'TACT'
            }
          };
        } else if (lowerMessage.includes('nervous') || lowerMessage.includes('pressure')) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'Mental toughness is often overlooked but critically important. When feeling pressure, use deep breathing and focus on one point at a time. Would you like to work on some mental exercises to improve performance under pressure?',
            timestamp: new Date(),
            metadata: {
              recommendationType: 'training',
              dimensionFocus: 'MENT'
            }
          };
        } else if (lowerMessage.includes('tired') || lowerMessage.includes('stamina')) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'Physical conditioning directly impacts your game, especially in long tournaments. I recommend incorporating more pickleball-specific movement drills to improve your on-court stamina.',
            timestamp: new Date(),
            metadata: {
              recommendationType: 'insight',
              dimensionFocus: 'PHYS'
            }
          };
        } else if (lowerMessage.includes('training') || lowerMessage.includes('practice')) {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'Consistent practice leads to consistent play. I can create a structured training schedule to help you improve systematically. Would you like me to generate a weekly practice plan?',
            timestamp: new Date(),
            metadata: {
              recommendationType: 'schedule',
              dimensionFocus: 'CONS'
            }
          };
        } else {
          sageResponse = {
            id: `sage-${Date.now()}`,
            type: 'sage',
            content: 'I understand you want to improve your pickleball skills. To offer more specific guidance, could you tell me which aspect of your game you want to focus on? Technical skills, tactical awareness, physical fitness, mental toughness, or consistency?',
            timestamp: new Date()
          };
        }
        
        // Update conversation with simulated messages
        setConversation(prevConversation => ({
          ...prevConversation,
          messages: [
            ...prevConversation.messages,
            userMessage,
            sageResponse
          ]
        }));
        
        // Clear input field
        setMessage('');
        return;
      }
      
      // If we're not in development mode, show the error
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
    }
  });
  
  // Clear conversation
  const clearConversation = () => {
    setConversation({
      startedAt: new Date(),
      messages: [
        {
          id: 'welcome',
          type: 'system',
          content: 'Welcome to S.A.G.E. (Skills Assessment & Growth Engine), your personal pickleball assistant. I can help you improve your game with personalized coaching and also help you navigate Pickle+ features. Ask me about training, tournaments, CourtIQ ratings, or any other platform features!',
          timestamp: new Date()
        }
      ]
    });
  };
  
  // Record feedback on advice
  const recordFeedbackMutation = useMutation({
    mutationFn: async ({ messageId, feedbackType }: { messageId: string, feedbackType: 'positive' | 'negative' }) => {
      const response = await apiRequest(
        "POST", 
        "/api/coach/sage/feedback", 
        { 
          messageId,
          feedbackType,
          conversationId: conversation.sessionId
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to record feedback");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update message with feedback recorded
      setConversation(prevConversation => ({
        ...prevConversation,
        messages: prevConversation.messages.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, metadata: { ...msg.metadata, feedback: data.feedbackType } } 
            : msg
        )
      }));
      
      toast({
        title: "Feedback recorded",
        description: "Thank you for helping improve the SAGE coaching system."
      });
    },
    onError: (error: Error) => {
      // In development mode, simulate feedback recording
      if (process.env.NODE_ENV !== 'production') {
        const { messageId, feedbackType } = error.cause as any;
        
        // Update message with feedback
        setConversation(prevConversation => ({
          ...prevConversation,
          messages: prevConversation.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, metadata: { ...msg.metadata, feedback: feedbackType } } 
              : msg
          )
        }));
        
        toast({
          title: "Feedback recorded",
          description: "Thank you for helping improve the SAGE coaching system."
        });
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Error recording feedback",
        description: error.message,
      });
    }
  });
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // For development, directly use the mutation
    sendMessageMutation.mutate(message);
  };
  
  // Generate a recommendation card based on message metadata
  const renderRecommendationCard = (msg: Message) => {
    if (!msg.metadata?.recommendationType) return null;
    
    // Generate the appropriate recommendation card
    switch (msg.metadata.recommendationType) {
      case 'training':
        return (
          <Card className="my-2 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Dumbbell className="h-4 w-4 mr-2" />
                Training Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">
                SAGE suggests creating a training plan focused on 
                {msg.metadata.dimensionFocus === 'TECH' && " technical skills"} 
                {msg.metadata.dimensionFocus === 'TACT' && " tactical awareness"} 
                {msg.metadata.dimensionFocus === 'PHYS' && " physical fitness"} 
                {msg.metadata.dimensionFocus === 'MENT' && " mental toughness"} 
                {msg.metadata.dimensionFocus === 'CONS' && " consistency"}
                .
              </p>
              <div className="mt-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  // Navigate to create a new training plan
                  toast({
                    title: "Creating training plan",
                    description: "Navigating to training plan creation..."
                  });
                  // In a real implementation, this would navigate to the training plan creation with the specific focus
                }}>
                  Create Training Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'insight':
        return (
          <Card className="my-2 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Coaching Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">
                Based on this conversation, SAGE has identified an opportunity to improve your
                {msg.metadata.dimensionFocus === 'TECH' && " technical execution"} 
                {msg.metadata.dimensionFocus === 'TACT' && " strategic approach"} 
                {msg.metadata.dimensionFocus === 'PHYS' && " physical conditioning"} 
                {msg.metadata.dimensionFocus === 'MENT' && " mental game"} 
                {msg.metadata.dimensionFocus === 'CONS' && " consistency"}.
              </p>
              <div className="mt-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  // Save this insight to the user's profile
                  toast({
                    title: "Insight saved",
                    description: "This insight has been added to your coaching profile."
                  });
                }}>
                  Save Insight
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'schedule':
        return (
          <Card className="my-2 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Practice Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">
                SAGE recommends creating a structured practice schedule to improve your skills systematically.
              </p>
              <div className="mt-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  // Generate a practice schedule
                  toast({
                    title: "Generating schedule",
                    description: "Creating your personalized practice schedule..."
                  });
                }}>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Brain className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>S.A.G.E. Conversation</CardTitle>
              <CardDescription>
                Chat with your Skills Assessment & Growth Engine coach
              </CardDescription>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearConversation}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {conversation.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.type === 'user' ? (
                      <Avatar>
                        <AvatarFallback className="bg-blue-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : msg.type === 'sage' ? (
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar>
                        <AvatarFallback className="bg-gray-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div>
                    <div 
                      className={`p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : msg.type === 'sage'
                            ? 'bg-muted' 
                            : 'bg-accent'
                      }`}
                    >
                      {msg.type === 'sage' && msg.content.includes('#') ? (
                        <div className="text-sm sage-markdown">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Feedback buttons for SAGE responses only */}
                      {msg.type === 'sage' && !msg.metadata?.feedback && (
                        <div className="ml-2 flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => recordFeedbackMutation.mutate({ 
                                    messageId: msg.id, 
                                    feedbackType: 'positive' 
                                  })}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Helpful</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => recordFeedbackMutation.mutate({ 
                                    messageId: msg.id, 
                                    feedbackType: 'negative' 
                                  })}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Not helpful</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      
                      {/* Show feedback status if provided */}
                      {msg.type === 'sage' && msg.metadata?.feedback && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {msg.metadata.feedback === 'positive' ? 'Helpful' : 'Not helpful'}
                        </Badge>
                      )}
                      
                      {/* Show dimension focus if present */}
                      {msg.type === 'sage' && msg.metadata?.dimensionFocus && (
                        <Badge 
                          className={`ml-2 ${
                            msg.metadata.dimensionFocus === 'TECH' ? 'bg-blue-500' :
                            msg.metadata.dimensionFocus === 'TACT' ? 'bg-purple-500' :
                            msg.metadata.dimensionFocus === 'PHYS' ? 'bg-green-500' :
                            msg.metadata.dimensionFocus === 'MENT' ? 'bg-yellow-500' :
                            msg.metadata.dimensionFocus === 'CONS' ? 'bg-red-500' :
                            'bg-gray-500'
                          } text-white`}
                        >
                          {msg.metadata.dimensionFocus === 'TECH' ? 'Technical' :
                           msg.metadata.dimensionFocus === 'TACT' ? 'Tactical' :
                           msg.metadata.dimensionFocus === 'PHYS' ? 'Physical' :
                           msg.metadata.dimensionFocus === 'MENT' ? 'Mental' :
                           msg.metadata.dimensionFocus === 'CONS' ? 'Consistency' :
                           msg.metadata.dimensionFocus}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Recommendation cards for sage messages */}
                    {msg.type === 'sage' && renderRecommendationCard(msg)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            placeholder="Ask SAGE about your pickleball game..."
            className="flex-1 min-h-[60px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !message.trim()} 
            className="self-end"
          >
            {sendMessageMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}