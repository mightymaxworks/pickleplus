/**
 * PKL-278651-PROF-0028-MATCH - Compatible Partners List
 * 
 * This component displays a list of compatible partners based on
 * the user's preferences and CourtIQ dimensions.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserRoundCheck,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Handshake,
  CheckCircle,
  AlertCircle,
  CalendarClock,
  MessageSquare,
  Settings,
  RefreshCcw
} from "lucide-react";
import { 
  findCompatiblePartners,
  getPartnerPreferences,
  type PartnerCompatibility,
  type PartnerPreferences,
  DEFAULT_PARTNER_PREFERENCES
} from "@/services/PartnerMatchingService";
import { EnhancedUser } from "@/types/enhanced-user";
import { cn } from "@/lib/utils";

// Component props
interface CompatiblePartnersListProps {
  userId: number;
  className?: string;
  onPreferencesClick?: () => void;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Helper function to get display name
function getDisplayName(user: EnhancedUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.username || 'Unknown Player';
}

// Helper function to get avatar URL
function getAvatarUrl(user: EnhancedUser): string | undefined {
  if (user.avatarUrl) return user.avatarUrl;
  return undefined;
}

export default function CompatiblePartnersList({
  userId,
  className = "",
  onPreferencesClick
}: CompatiblePartnersListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerCompatibility[]>([]);
  const [preferences, setPreferences] = useState<PartnerPreferences>(DEFAULT_PARTNER_PREFERENCES);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'top' | 'all'>('top');
  
  // Load preferences and compatible partners
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // Load preferences first
      const prefs = await getPartnerPreferences(userId);
      const userPreferences = prefs || DEFAULT_PARTNER_PREFERENCES;
      setPreferences(userPreferences);
      
      // Then find compatible partners
      const compatiblePartners = await findCompatiblePartners(userId, userPreferences);
      setPartners(compatiblePartners);
      
      setIsLoading(false);
    }
    
    loadData();
  }, [userId]);
  
  // Refresh partner list
  const handleRefresh = async () => {
    setIsLoading(true);
    const compatiblePartners = await findCompatiblePartners(userId, preferences);
    setPartners(compatiblePartners);
    setIsLoading(false);
  };
  
  // Toggle expanded partner details
  const toggleExpand = (partnerId: string) => {
    setExpandedPartner(current => current === partnerId ? null : partnerId);
  };
  
  // Render compatibility score badge
  const renderScoreBadge = (score: number) => {
    let variant: "default" | "secondary" | "outline" | "destructive";
    let label: string;
    
    if (score >= 85) {
      variant = "default";
      label = "Excellent Match";
    } else if (score >= 70) {
      variant = "secondary";
      label = "Good Match";
    } else if (score >= 50) {
      variant = "outline";
      label = "Fair Match";
    } else {
      variant = "destructive";
      label = "Low Compatibility";
    }
    
    return (
      <Badge variant={variant} className="ml-2">
        {label}
      </Badge>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compatible Partners</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            
            {onPreferencesClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={onPreferencesClick}
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Preferences</span>
              </Button>
            )}
          </div>
        </div>
        <CardDescription>Players who match your play style and skills</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="top" onValueChange={(value) => setActiveTab(value as 'top' | 'all')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="top">Top Matches</TabsTrigger>
            <TabsTrigger value="all">All Compatible</TabsTrigger>
          </TabsList>
          
          <TabsContent value="top" className="m-0">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
                  <p className="text-sm text-muted-foreground">Finding compatible partners...</p>
                </div>
              ) : partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No compatible partners found</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Try adjusting your preferences or check back later
                  </p>
                  {onPreferencesClick && (
                    <Button onClick={onPreferencesClick} size="sm">
                      Adjust Preferences
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {partners.slice(0, 3).map((partner) => (
                    <PartnerCard
                      key={partner.user.id}
                      partner={partner}
                      isExpanded={expandedPartner === `${partner.user.id}`}
                      onToggleExpand={() => toggleExpand(`${partner.user.id}`)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
                  <p className="text-sm text-muted-foreground">Finding compatible partners...</p>
                </div>
              ) : partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No compatible partners found</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Try adjusting your preferences or check back later
                  </p>
                  {onPreferencesClick && (
                    <Button onClick={onPreferencesClick} size="sm">
                      Adjust Preferences
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {partners.map((partner) => (
                    <PartnerCard
                      key={partner.user.id}
                      partner={partner}
                      isExpanded={expandedPartner === `${partner.user.id}`}
                      onToggleExpand={() => toggleExpand(`${partner.user.id}`)}
                      compact={activeTab === 'all'} // Use compact view for all partners list
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex-col items-start border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Partner compatibility is based on your CourtIQ™ dimensions and preferences.
          <br />Suggestions update as you play more matches and improve your skills.
        </div>
      </CardFooter>
    </Card>
  );
}

// Partner card component
function PartnerCard({
  partner,
  isExpanded,
  onToggleExpand,
  compact = false
}: {
  partner: PartnerCompatibility;
  isExpanded: boolean;
  onToggleExpand: () => void;
  compact?: boolean;
}) {
  const { user, compatibilityScore, breakdown, matchStrengths, matchChallenges } = partner;
  
  return (
    <motion.div
      layout
      className="border rounded-lg p-4 relative"
      animate={{ height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      {/* Score display in corner */}
      <div className="absolute top-3 right-3 flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/70 rounded-full px-2 py-0.5 text-xs font-semibold">
                {compatibilityScore}%
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compatibility score</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Main content */}
      <div className="flex items-center">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={getAvatarUrl(user)} />
          <AvatarFallback>{getInitials(getDisplayName(user))}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h3 className="font-medium">{getDisplayName(user)}</h3>
            {!compact && (
              <Badge 
                variant={compatibilityScore >= 80 ? "default" : compatibilityScore >= 60 ? "secondary" : "outline"}
                className="ml-2 text-xs"
              >
                {compatibilityScore >= 80 ? "Excellent" : compatibilityScore >= 60 ? "Good" : "Fair"}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="mr-3">
              {user.duprRating ? `${user.duprRating} DUPR` : 'Rating N/A'}
            </span>
            
            {user.playingStyle && (
              <span className="capitalize mr-3">
                {user.playingStyle.replace(/-/g, ' ')}
              </span>
            )}
            
            {user.preferredPosition && (
              <span className="capitalize">
                {user.preferredPosition === 'both' 
                  ? 'Plays Both Sides' 
                  : `${user.preferredPosition} Side`}
              </span>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={onToggleExpand}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Extended details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t"
          >
            {/* Compatibility score breakdown */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Compatibility Breakdown</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Skill Level</span>
                    <span>{breakdown.skillCompatibility}%</span>
                  </div>
                  <Progress value={breakdown.skillCompatibility} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Play Style</span>
                    <span>{breakdown.playstyleCompatibility}%</span>
                  </div>
                  <Progress value={breakdown.playstyleCompatibility} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Court Position</span>
                    <span>{breakdown.positionCompatibility}%</span>
                  </div>
                  <Progress value={breakdown.positionCompatibility} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>CourtIQ Dimensions</span>
                    <span>{breakdown.dimensionalCompatibility}%</span>
                  </div>
                  <Progress value={breakdown.dimensionalCompatibility} className="h-1.5" />
                </div>
              </div>
            </div>
            
            {/* Strengths and challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="text-green-500 h-3.5 w-3.5 mr-1" />
                  <span>Partnership Strengths</span>
                </h4>
                <ul className="space-y-1">
                  {matchStrengths.map((strength, index) => (
                    <li key={index} className="text-xs flex">
                      <span className="text-green-500 mr-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <AlertCircle className="text-amber-500 h-3.5 w-3.5 mr-1" />
                  <span>Potential Challenges</span>
                </h4>
                <ul className="space-y-1">
                  {matchChallenges.map((challenge, index) => (
                    <li key={index} className="text-xs flex">
                      <span className="text-amber-500 mr-1">•</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button className="gap-1.5" size="sm">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Message</span>
              </Button>
              <Button variant="outline" className="gap-1.5" size="sm">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>Schedule Match</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}