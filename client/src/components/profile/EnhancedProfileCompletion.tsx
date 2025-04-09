import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  CheckCircle, 
  Zap, 
  ChevronRight, 
  ChevronDown, 
  InfoIcon,
  User,
  Dumbbell,
  Settings,
  Calendar 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// Field category definitions
const FIELD_CATEGORIES = {
  personal: {
    title: "Personal Info",
    icon: User,
    fields: ["bio", "location", "yearOfBirth", "displayName"]
  },
  equipment: {
    title: "Equipment",
    icon: Dumbbell,
    fields: ["paddleBrand", "paddleModel", "backupPaddleBrand", "backupPaddleModel", "apparelBrand", "shoesBrand", "otherEquipment"]
  },
  playing: {
    title: "Playing Style",
    icon: Settings,
    fields: ["skillLevel", "playingSince", "preferredFormat", "dominantHand", "preferredPosition", "playingStyle", "shotStrengths"]
  },
  preferences: {
    title: "Preferences",
    icon: Calendar,
    fields: ["regularSchedule", "lookingForPartners", "mentorshipInterest", "preferredSurface", "indoorOutdoorPreference", "competitiveIntensity", "homeCourtLocations", "travelRadiusKm"]
  },
  skills: {
    title: "Skill Ratings",
    icon: Trophy,
    fields: ["forehandStrength", "backhandStrength", "servePower", "dinkAccuracy", "thirdShotConsistency", "courtCoverage"]
  }
};

// Define the XP reward tiers
const COMPLETION_TIERS = [
  { threshold: 25, reward: 25, label: "Bronze" },
  { threshold: 50, reward: 50, label: "Silver" },
  { threshold: 75, reward: 75, label: "Gold" }, 
  { threshold: 100, reward: 100, label: "Platinum" }
];

// Get the current tier based on completion percentage
function getCurrentTier(percentage: number) {
  if (percentage >= 100) return null;
  
  for (const tier of COMPLETION_TIERS) {
    if (percentage < tier.threshold) {
      return tier;
    }
  }
  
  return null;
}

// Get the previous tier for animation purposes
function getPreviousTier(percentage: number) {
  let previousTier = null;
  
  for (const tier of COMPLETION_TIERS) {
    if (percentage >= tier.threshold) {
      previousTier = tier;
    } else {
      break;
    }
  }
  
  return previousTier;
}

// Categorize fields into their respective sections
function categorizeFields(fields: string[]) {
  const categorized: Record<string, string[]> = {
    personal: [],
    equipment: [],
    playing: [],
    preferences: [],
    skills: [],
    other: []
  };
  
  fields.forEach(field => {
    let found = false;
    
    // Find which category this field belongs to
    Object.keys(FIELD_CATEGORIES).forEach(category => {
      if (FIELD_CATEGORIES[category as keyof typeof FIELD_CATEGORIES].fields.includes(field.toLowerCase())) {
        categorized[category].push(field);
        found = true;
      }
    });
    
    // If the field doesn't belong to any category, put it in "other"
    if (!found) {
      categorized.other.push(field);
    }
  });
  
  return categorized;
}

// Component for displaying section progress
function SectionProgress({ 
  title, 
  icon: Icon, 
  completedCount, 
  totalCount, 
  incompleteFields = [],
  expanded,
  onToggle
}: { 
  title: string; 
  icon: any; 
  completedCount: number; 
  totalCount: number;
  incompleteFields?: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={onToggle}
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          <div className="w-20">
            <Progress value={percentage} className="h-1.5" />
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && incompleteFields.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-6 space-y-1">
              {incompleteFields.map((field, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-center">
                  <div className="w-2 h-2 rounded-full bg-muted mr-2" />
                  {field}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main component
export function EnhancedProfileCompletion({ user, refreshTrigger = 0 }: { user: any; refreshTrigger?: number }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [previousPercentage, setPreviousPercentage] = useState(0);
  
  // Query to fetch detailed profile completion data
  const { data: completionData, isLoading } = useQuery({
    queryKey: ["/api/profile/completion", refreshTrigger],
    queryFn: async () => {
      const response = await fetch("/api/profile/completion", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile completion data");
      }
      
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Extract data from the completion endpoint response
  const { 
    completionPercentage = user?.profileCompletionPct || 0, 
    completedFields = [], 
    incompleteFields = [],
    xpEarned = 0,
    potentialXp = 250
  } = completionData || {};
  
  // Check if the percentage has increased
  useEffect(() => {
    if (completionPercentage > previousPercentage && previousPercentage > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousPercentage(completionPercentage);
  }, [completionPercentage, previousPercentage]);
  
  // Get the current tier for the progress bar
  const currentTier = getCurrentTier(completionPercentage);
  
  // Get the previous tier for animation
  const previousTier = getPreviousTier(completionPercentage);
  
  // Categorize incomplete fields by section
  const categorizedIncomplete = categorizeFields(incompleteFields);
  
  // Calculate section completion metrics
  const sectionMetrics = Object.keys(FIELD_CATEGORIES).map(key => {
    const category = key as keyof typeof FIELD_CATEGORIES;
    const categoryFields = FIELD_CATEGORIES[category].fields;
    const incompleteInCategory = categorizedIncomplete[key] || [];
    
    return {
      key,
      title: FIELD_CATEGORIES[category].title,
      icon: FIELD_CATEGORIES[category].icon,
      completedCount: categoryFields.length - incompleteInCategory.length,
      totalCount: categoryFields.length,
      incompleteFields: incompleteInCategory
    };
  });
  
  // If already 100% complete, show the completion card
  if (completionPercentage >= 100) {
    return (
      <Card className="bg-gradient-to-br from-[#4CAF50]/10 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-[#4CAF50]" />
            Profile Complete!
          </CardTitle>
          <CardDescription>
            Your profile is 100% complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FF5722]" />
            <div className="text-sm">
              <span className="font-semibold">+100 XP</span> earned for completing your profile!
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border-amber-200">
              <Trophy size={14} className="text-amber-500" /> Platinum Tier
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate how many fields need to be completed to reach next tier
  const fieldsToNextTier = currentTier 
    ? Math.ceil((currentTier.threshold - completionPercentage) * (completedFields.length + incompleteFields.length) / 100)
    : 0;
  
  return (
    <Card className="relative overflow-hidden">
      {/* Celebration animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 to-green-100/30 pointer-events-none z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-full p-6 shadow-lg flex items-center justify-center"
            >
              <div className="text-center">
                <Trophy size={32} className="text-yellow-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">Profile Improved!</p>
                <p className="text-sm text-gray-600">Keep going!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-[#4CAF50]" />
            Profile Completeness
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Complete your profile to earn XP and unlock features. Each section contributes to your overall profile strength.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <span className="font-medium">{completionPercentage}% Complete</span>
              {previousTier && (
                <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border-amber-200">
                  <Trophy size={10} className="text-amber-500" /> {previousTier.label}
                </Badge>
              )}
            </div>
            {currentTier && (
              <div className="text-[#FF5722] font-medium text-sm flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                +{currentTier.reward} XP at {currentTier.threshold}%
              </div>
            )}
          </div>
          
          <div className="relative pt-1">
            <Progress value={completionPercentage} className="h-2" />
            
            {/* Tier markers */}
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              {COMPLETION_TIERS.map((tier, index) => (
                <div 
                  key={index} 
                  className="relative" 
                  style={{ left: `${tier.threshold}%`, marginLeft: "-8px" }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div 
                          className={cn(
                            "w-2 h-2 rounded-full absolute -top-3", 
                            completionPercentage >= tier.threshold ? "bg-green-500" : "bg-muted"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{tier.label} Tier: {tier.threshold}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span 
                    className={cn(
                      "absolute top-2 transform -translate-x-1/2 whitespace-nowrap",
                      completionPercentage >= tier.threshold ? "text-green-600 font-medium" : ""
                    )}
                  >
                    {tier.threshold}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {fieldsToNextTier > 0 && currentTier && (
            <div className="text-xs text-center text-muted-foreground mt-2">
              Complete <span className="font-medium text-[#FF5722]">{fieldsToNextTier} more {fieldsToNextTier === 1 ? 'field' : 'fields'}</span> to reach {currentTier.label} tier!
            </div>
          )}
          
          <Separator className="my-3" />
          
          <div className="space-y-1">
            {sectionMetrics.map((section) => (
              <SectionProgress 
                key={section.key}
                title={section.title}
                icon={section.icon}
                completedCount={section.completedCount}
                totalCount={section.totalCount}
                incompleteFields={section.incompleteFields}
                expanded={expandedSection === section.key}
                onToggle={() => setExpandedSection(
                  expandedSection === section.key ? null : section.key
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full"
        >
          <Link href="/profile/edit">
            Complete Your Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}