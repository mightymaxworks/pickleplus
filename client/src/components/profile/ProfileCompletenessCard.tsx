import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Clock, 
  Medal, 
  FileText, 
  Heart, 
  Dumbbell, 
  Share2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  X,
  Trophy,
  Zap
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ProfileCompletenessCardProps {
  user: any;
  profileCompletion: number;
}

interface ProfileCompletionData {
  percentage: number;
  completedFields: string[];
  incompleteFields: string[];
  completedCategories: {
    basic: number;
    pickleball: number;
    social: number;
    health: number;
  };
  fieldNameMapping: Record<string, string>;
}

const CATEGORY_INFO = {
  basic: {
    name: "Basic Info",
    icon: <User className="h-4 w-4" />,
    color: "#2196F3", // Blue
    description: "Your personal information and general details",
  },
  pickleball: {
    name: "Pickleball Details",
    icon: <Medal className="h-4 w-4" />,
    color: "#FF5722", // Orange
    description: "Your playing preferences, equipment, and experience",
  },
  social: {
    name: "Social Connections",
    icon: <Share2 className="h-4 w-4" />,
    color: "#9C27B0", // Purple
    description: "Your clubs, leagues, and community connections",
  },
  health: {
    name: "Health & Fitness",
    icon: <Heart className="h-4 w-4" />,
    color: "#4CAF50", // Green
    description: "Your fitness preferences and health considerations",
  }
};

// XP reward milestones (same as server thresholds)
const XP_MILESTONES = [
  { threshold: 25, reward: 50, label: "Getting Started" },
  { threshold: 50, reward: 100, label: "Half-Way There" },
  { threshold: 75, reward: 150, label: "Almost Complete" },
  { threshold: 100, reward: 250, label: "Profile Master" }
];

export function ProfileCompletenessCard({ user, profileCompletion }: ProfileCompletenessCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevCompletion, setPrevCompletion] = useState(profileCompletion);
  
  // Get detailed profile completion data from API
  const { data: completionData, isLoading } = useQuery<ProfileCompletionData>({
    queryKey: ["/api/profile/completion"],
    enabled: !!user,
  });
  
  // Calculate next milestone
  const nextMilestone = XP_MILESTONES.find(milestone => profileCompletion < milestone.threshold);
  const prevMilestone = [...XP_MILESTONES].reverse().find(milestone => profileCompletion >= milestone.threshold);
  
  // Check for threshold crossing for confetti animation
  useEffect(() => {
    if (profileCompletion > prevCompletion) {
      // Check if we crossed a milestone threshold
      const crossedMilestone = XP_MILESTONES.find(
        milestone => prevCompletion < milestone.threshold && profileCompletion >= milestone.threshold
      );
      
      if (crossedMilestone) {
        setShowConfetti(true);
        // Fire confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Reset confetti after animation
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
    setPrevCompletion(profileCompletion);
  }, [profileCompletion, prevCompletion]);

  // Simple categories when API data isn't available
  const defaultCategories = {
    basic: 0,
    pickleball: 0,
    social: 0,
    health: 0
  };
  
  // Calculate the completed categories percentages
  const categories = completionData?.completedCategories || defaultCategories;
  
  // Original list of fields that should be filled out (used as fallback)
  const requiredFields = [
    { name: 'location', label: 'Add your location', category: 'basic' },
    { name: 'playingSince', label: 'Add when you started playing', category: 'basic' },
    { name: 'skillLevel', label: 'Add your skill level', category: 'basic' },
    { name: 'bio', label: 'Add a short bio', category: 'basic' },
    { name: 'paddleBrand', label: 'Add your paddle brand', category: 'pickleball' },
    { name: 'paddleModel', label: 'Add your paddle model', category: 'pickleball' },
    { name: 'preferredPosition', label: 'Add your preferred position', category: 'pickleball' },
    { name: 'dominantHand', label: 'Add your dominant hand', category: 'basic' },
    { name: 'playingStyle', label: 'Add your playing style', category: 'pickleball' }
  ];

  // Filter missing fields from API or fallback
  const missingFields = completionData?.incompleteFields
    ? completionData.incompleteFields.map(field => ({
        name: field,
        label: `Add your ${completionData.fieldNameMapping[field] || field}`,
        category: getCategoryForField(field)
      }))
    : requiredFields.filter(field => !user[field.name]);

  // Function to determine category for a field
  function getCategoryForField(fieldName: string): string {
    // Basic mapping of fields to categories
    const categoryMap: Record<string, string> = {
      'bio': 'basic',
      'location': 'basic',
      'skillLevel': 'basic', 
      'playingSince': 'basic',
      'preferredFormat': 'basic',
      'dominantHand': 'basic',
      
      'preferredPosition': 'pickleball',
      'paddleBrand': 'pickleball',
      'paddleModel': 'pickleball',
      'playingStyle': 'pickleball',
      'shotStrengths': 'pickleball',
      'playerGoals': 'pickleball',
      'regularSchedule': 'pickleball',
      'lookingForPartners': 'pickleball',
      
      'coach': 'social',
      'clubs': 'social',
      'leagues': 'social',
      'socialHandles': 'social',
      
      'mobilityLimitations': 'health',
      'preferredMatchDuration': 'health',
      'fitnessLevel': 'health'
    };
    
    return categoryMap[fieldName] || 'basic';
  }

  // Function to filter missing fields by category
  function getMissingFieldsByCategory(category: string) {
    return missingFields.filter(field => field.category === category);
  }

  // Function to get category icon
  function getCategoryIcon(category: string) {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.icon || <Info className="h-4 w-4" />;
  }

  // Function to get category color
  function getCategoryColor(category: string) {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.color || "#909090";
  }

  // Animation keyframes for the progress circles
  const progressCircleKeyframes = `
    @keyframes progressCircle {
      0% {
        stroke-dashoffset: ${2 * Math.PI * 45};
      }
      100% {
        stroke-dashoffset: ${2 * Math.PI * 45 * (1 - profileCompletion / 100)};
      }
    }
    
    @keyframes progressCircleComplete {
      0% {
        stroke-dashoffset: ${2 * Math.PI * 45};
      }
      70% {
        stroke-dashoffset: 0;
      }
      80% {
        stroke-dashoffset: 20;
      }
      90% {
        stroke-dashoffset: 0;
      }
    }
  `;
  
  // Animation for the progress indicator
  const circleAnimation = profileCompletion < 100 
    ? "animate-progress-circle" 
    : "animate-progress-circle-complete";

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isExpanded ? "shadow-lg" : "",
      showConfetti ? "ring-2 ring-[#FF5722] ring-opacity-50" : ""
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" /> 
            Profile Completeness
          </CardTitle>
          
          {nextMilestone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30">
                    <Zap className="h-3 w-3 mr-1" />
                    {nextMilestone.reward} XP available
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reach {nextMilestone.threshold}% completion to earn {nextMilestone.reward} XP!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {prevMilestone && profileCompletion === 100 && (
            <Badge variant="outline" className="bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/30">
              <Trophy className="h-3 w-3 mr-1" />
              Profile Master
            </Badge>
          )}
        </div>
        
        {profileCompletion < 100 && (
          <CardDescription>
            Complete your profile to improve your matchmaking and earn XP rewards.
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Circular progress indicator */}
            <div className="relative flex items-center justify-center h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#E0E0E0" 
                  strokeWidth="8" 
                />
                
                {/* Progress circle with gradient */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF5722" />
                    <stop offset="100%" stopColor="#FF9800" />
                  </linearGradient>
                </defs>
                
                {/* Category progress circles */}
                {Object.entries(categories).map(([category, percentage], index) => {
                  const radius = 45 - (index * 8);
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (percentage / 100) * circumference;
                  return (
                    <circle 
                      key={category}
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="none" 
                      stroke={getCategoryColor(category)}
                      strokeWidth="5" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className={circleAnimation}
                      style={{ 
                        animationDelay: `${index * 0.2}s`,
                        opacity: 0.7 + (index * 0.1)
                      }} 
                    />
                  );
                })}
                
                {/* Overall progress circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="url(#progressGradient)" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 45}`} 
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - profileCompletion / 100)}`}
                  strokeLinecap="round"
                  className={circleAnimation}
                />
                
                {/* Percentage text */}
                <text 
                  x="50" 
                  y="45" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-3xl font-bold"
                  fill={profileCompletion === 100 ? "#4CAF50" : "#FF5722"}
                >
                  {profileCompletion}%
                </text>
                
                <text 
                  x="50" 
                  y="60" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-xs"
                  fill="#666"
                >
                  Complete
                </text>
              </svg>
            </div>
            
            {/* Category breakdown */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {Object.entries(categories).map(([category, percentage]) => (
                <button
                  key={category}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                    activeCategory === category ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900",
                    "cursor-pointer"
                  )}
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div style={{ color: getCategoryColor(category) }}>
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-xs font-medium">
                      {CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.name}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-1.5 w-full" 
                    indicatorClassName={`bg-[${getCategoryColor(category)}]`} 
                  />
                  <span className="text-xs text-muted-foreground mt-1">{percentage}%</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Missing fields section */}
          {missingFields.length > 0 && (
            <div className="space-y-3 mt-3">
              {/* Category-specific missing fields */}
              {activeCategory && getMissingFieldsByCategory(activeCategory).length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <span style={{ color: getCategoryColor(activeCategory) }}>
                        {getCategoryIcon(activeCategory)}
                      </span>
                      <span>Missing {CATEGORY_INFO[activeCategory as keyof typeof CATEGORY_INFO]?.name} Fields</span>
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs text-muted-foreground" 
                      onClick={() => setActiveCategory(null)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  <div className="space-y-1.5">
                    {getMissingFieldsByCategory(activeCategory).map((field, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 mr-2 text-[#FF5722]" />
                        <span>{field.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Quick Wins</h4>
                    <span className="text-xs text-muted-foreground">
                      {missingFields.length} fields remaining
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {missingFields.slice(0, 3).map((field, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 mr-2 text-[#FF5722]" />
                        <span>{field.label}</span>
                      </div>
                    ))}
                    
                    {missingFields.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        + {missingFields.length - 3} more fields to complete
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Completed profile message */}
          {missingFields.length === 0 && (
            <div className="flex items-center text-[#4CAF50] bg-[#4CAF50]/10 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Your profile is complete!</p>
                <p className="text-sm text-[#4CAF50]/80">You've maximized your matchmaking potential and earned all available XP rewards.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Collapsible section for milestones */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center text-xs text-muted-foreground rounded-t-none border-t"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Milestones
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                View XP Milestones
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-6 pb-4 pt-2 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FF9800]" />
              Profile Completion Rewards
            </h4>
            
            <div className="space-y-2">
              {XP_MILESTONES.map((milestone, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md",
                    profileCompletion >= milestone.threshold ? "bg-[#4CAF50]/10" : "bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {profileCompletion >= milestone.threshold ? (
                      <CheckCircle2 className="h-4 w-4 text-[#4CAF50]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                    )}
                    <span className="text-sm">{milestone.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge 
                      variant={profileCompletion >= milestone.threshold ? "outline" : "secondary"}
                      className={cn(
                        profileCompletion >= milestone.threshold && "border-[#4CAF50] text-[#4CAF50]"
                      )}
                    >
                      {milestone.threshold}%
                    </Badge>
                    <Badge className={cn(
                      "bg-[#FF9800]",
                      profileCompletion >= milestone.threshold ? "opacity-40" : ""
                    )}>
                      {milestone.reward} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setActiveCategory(null)}
          className="text-xs"
        >
          Reset View
        </Button>
        <Button variant="default" size="sm" className="text-xs" asChild>
          <Link to="/profile/edit">
            Complete Profile
          </Link>
        </Button>
      </CardFooter>
      
      {/* Add keyframes for circle animations via React's style approach instead */}
    </Card>
  );
}