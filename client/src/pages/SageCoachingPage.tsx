/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Page
 * 
 * Unified interface for SAGE with no tabs - combines conversational UI, coaching, 
 * journaling, concierge, and recommendations in a single interface.
 * 
 * @framework Framework5.3
 * @version 4.0.0
 * @lastModified 2025-04-25
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSageConversation } from "@/hooks/useSageConversation";
import { SageRecommendationCard } from "@/components/sage/SageRecommendationCard";
import { 
  Loader2, 
  MessageSquare, 
  Send, 
  BookText, 
  Info, 
  Lightbulb, 
  Crown,
  Compass, 
  ListChecks, 
  ArrowUpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import sageImage from "@assets/Untitled design (51).png";

export default function SageCoachingPage() {
  const { user, isLoading } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [showPremiumTeaser, setShowPremiumTeaser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mock conversation state - would be replaced with actual API integration
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'sage';
    content: string;
    timestamp: Date;
    category?: 'training' | 'journal' | 'navigation' | 'recommendation';
  }>>([
    {
      id: '1',
      type: 'sage',
      content: "Hello! I'm SAGE, your Skills Assessment & Growth Engine for pickleball. I can help with coaching advice, journal your progress, navigate the platform, or recommend personalized drills. What would you like help with today?",
      timestamp: new Date(),
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock function to determine message intent
  const determineMessageIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('drill') || lowerMessage.includes('train') || 
        lowerMessage.includes('exercise') || lowerMessage.includes('practice') ||
        lowerMessage.includes('improve')) {
      return 'training';
    }
    
    if (lowerMessage.includes('journal') || lowerMessage.includes('record') || 
        lowerMessage.includes('track') || lowerMessage.includes('progress') ||
        lowerMessage.includes('today') || lowerMessage.includes('played')) {
      return 'journal';
    }
    
    if (lowerMessage.includes('find') || lowerMessage.includes('where') || 
        lowerMessage.includes('how do i') || lowerMessage.includes('navigate') ||
        lowerMessage.includes('show me')) {
      return 'navigation';
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
        lowerMessage.includes('what should') || lowerMessage.includes('best for me')) {
      return 'recommendation';
    }
    
    return 'general';
  };

  // Mock function to generate training responses (with 3 drill limit for free tier)
  const getTrainingResponse = (message: string): string => {
    return `Here are 3 drills that can help you improve:

1. **Precision Dinking Drill**: Practice soft shots that just clear the net and land in the kitchen. This improves touch and control.

2. **Third Shot Drop Practice**: Work on dropping the ball into the kitchen from the baseline. This is crucial for transitioning from the baseline to the net.

3. **Reset Drill**: Practice resetting hard shots back into the kitchen. This defensive skill will help neutralize aggressive opponents.

*Want a complete personalized training plan with video demonstrations and progressive difficulty? Upgrade to SAGE Premium.*`;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Determine message intent
    const messageIntent = determineMessageIntent(inputValue);
    
    // Simulate API call delay
    setTimeout(() => {
      let responseContent = '';
      let category: 'training' | 'journal' | 'navigation' | 'recommendation' | undefined;
      
      // Generate response based on intent
      if (messageIntent === 'training' && inputValue.toLowerCase().includes('drill')) {
        responseContent = getTrainingResponse(inputValue);
        category = 'training';
        // Show premium teaser for training requests
        setShowPremiumTeaser(true);
      } else if (messageIntent === 'journal') {
        responseContent = "I've recorded your journal entry. Would you like to add any reflections on how this affected your mental game or physical performance?";
        category = 'journal';
      } else if (messageIntent === 'navigation') {
        responseContent = "I can help you navigate to that section of Pickle+. Would you like me to explain how that feature works or take you there directly?";
        category = 'navigation';
      } else if (messageIntent === 'recommendation') {
        responseContent = "Based on your CourtIQ profile and recent activity, I recommend focusing on improving your dink consistency and third shot drops. Would you like specific drills for these skills?";
        category = 'recommendation';
      } else {
        responseContent = "I'm here to help with all your pickleball needs. I can provide coaching advice, track your progress, help you navigate Pickle+, or offer personalized recommendations. Could you clarify what you'd like assistance with?";
      }
      
      // Add sage response
      const sageMessage = {
        id: (Date.now() + 1).toString(),
        type: 'sage' as const,
        content: responseContent,
        timestamp: new Date(),
        category
      };
      
      setMessages(prev => [...prev, sageMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Quick action buttons to help users with common requests
  const quickActions = [
    { label: 'Training Plan', icon: <ListChecks className="h-4 w-4 mr-2" />, prompt: "I need a training plan to improve my skills" },
    { label: 'Record Progress', icon: <BookText className="h-4 w-4 mr-2" />, prompt: "I want to journal today's match results" },
    { label: 'Platform Help', icon: <Compass className="h-4 w-4 mr-2" />, prompt: "Help me navigate the Pickle+ platform" },
    { label: 'Skill Analysis', icon: <Lightbulb className="h-4 w-4 mr-2" />, prompt: "What skills should I focus on improving?" }
  ];

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
        <Button asChild>
          <a href="/auth">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20 flex flex-col md:flex-row items-center gap-6">
        <div 
          className="w-20 h-20 rounded-full flex-shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sageImage})` }}
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">SAGE™ - Skills Assessment & Growth Engine</h1>
          <p className="text-sm text-muted-foreground">
            Your AI-powered pickleball coach, journal, and platform concierge - all in one conversation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-primary/10 h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                SAGE Conversation
              </CardTitle>
              <CardDescription>
                Ask anything about pickleball or Pickle+ platform features
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.category && (
                          <Badge variant="outline" className="mb-2">
                            {message.category === 'training' && <ListChecks className="h-3 w-3 mr-1" />}
                            {message.category === 'journal' && <BookText className="h-3 w-3 mr-1" />}
                            {message.category === 'navigation' && <Compass className="h-3 w-3 mr-1" />}
                            {message.category === 'recommendation' && <Lightbulb className="h-3 w-3 mr-1" />}
                            {message.category}
                          </Badge>
                        )}
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="pt-0">
              <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask SAGE anything about pickleball or Pickle+..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInputValue(action.prompt);
                  inputRef.current?.focus();
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Premium Teaser Card */}
          {showPremiumTeaser && (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-amber-800 dark:text-amber-400 flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-amber-500" />
                    SAGE Premium
                  </CardTitle>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700">Limited Offer</Badge>
                </div>
                <CardDescription className="text-amber-700 dark:text-amber-400">
                  Unlock your full potential
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-amber-900 dark:text-amber-300 mb-3">
                  Upgrade to get complete personalized training plans with:
                </p>
                <ul className="space-y-1 text-amber-800 dark:text-amber-400 mb-4">
                  <li className="flex items-start">
                    <ArrowUpCircle className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited personalized drills</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowUpCircle className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Video demonstrations</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowUpCircle className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Weekly progression plans</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span className="text-sm text-amber-700 dark:text-amber-400">Basic Plan</span>
                      <p className="text-lg font-bold text-amber-800 dark:text-amber-300">$5.99/month</p>
                    </div>
                    <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                      Subscribe
                    </Button>
                  </div>
                  <div className="flex justify-between items-center w-full pt-2 border-t border-amber-200 dark:border-amber-800/30">
                    <div>
                      <span className="text-sm text-amber-700 dark:text-amber-400">Power Plan</span>
                      <p className="text-lg font-bold text-amber-800 dark:text-amber-300">$11.99/month</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" className="border-amber-600 text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400">
                            Learn More
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-4">
                          <p className="font-bold mb-2">Power Plan includes:</p>
                          <ul className="space-y-1 text-sm">
                            <li>• Everything in Basic Plan</li>
                            <li>• Advanced multi-dimensional training</li>
                            <li>• Video analysis capabilities</li>
                            <li>• Priority SAGE responses</li>
                            <li>• Advanced performance analytics</li>
                            <li>• Exclusive premium drills</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {/* SAGE Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                About SAGE
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-3">
                SAGE understands all aspects of pickleball and the Pickle+ platform:
              </p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Badge variant="outline" className="mr-2 bg-primary/5">Coaching</Badge>
                  <span className="text-muted-foreground text-xs">Training plans, technique advice, strategy tips</span>
                </div>
                <div className="flex items-start">
                  <Badge variant="outline" className="mr-2 bg-primary/5">Platform</Badge>
                  <span className="text-muted-foreground text-xs">Navigate features, rankings, tournaments</span>
                </div>
                <div className="flex items-start">
                  <Badge variant="outline" className="mr-2 bg-primary/5">Rules</Badge>
                  <span className="text-muted-foreground text-xs">Official pickleball rules and regulations</span>
                </div>
                <div className="flex items-start">
                  <Badge variant="outline" className="mr-2 bg-primary/5">Personal</Badge>
                  <span className="text-muted-foreground text-xs">Journal, track progress, set goals</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recommendation Card */}
          <SageRecommendationCard />
        </div>
      </div>
    </div>
  );
}