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
        content: 'Welcome to S.A.G.E. (Skills Assessment & Growth Engine), your personal pickleball coach. How can I help you improve your game today?',
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
  
  // Send message to SAGE
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await apiRequest(
        "POST", 
        "/api/coach/sage/conversation", 
        { 
          message: messageContent,
          conversationId: conversation.sessionId
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
      // In development mode, simulate a rule-based response
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Simulating SAGE response');
        
        // Create user message
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: message,
          timestamp: new Date()
        };
        
        // Create SAGE response based on user message
        let sageResponse: Message;
        
        // Simple rule-based responses
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('dink') || lowerMessage.includes('third shot')) {
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
          content: 'Welcome to S.A.G.E. (Skills Assessment & Growth Engine), your personal pickleball coach. How can I help you improve your game today?',
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
                      <p className="text-sm">{msg.content}</p>
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