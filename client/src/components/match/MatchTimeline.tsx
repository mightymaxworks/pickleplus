import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordedMatch } from '@/lib/sdk/matchSDK';
import { TiltCard } from '@/components/ui/tilt-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO, isSameMonth, differenceInCalendarMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MatchTimelineProps {
  matches: RecordedMatch[];
  onMatchSelected: (match: RecordedMatch) => void;
  className?: string;
}

/**
 * MatchTimeline Component
 * 
 * An interactive timeline visualization of match history with horizontal scrolling,
 * grouping by month, and interactive match cards.
 * 
 * Part of the MATCH-UI-278651[ENHANCE] implementation.
 */
export function MatchTimeline({ matches, onMatchSelected, className = '' }: MatchTimelineProps) {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 2]); // Show 3 months at a time
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Group matches by month
  const matchesByMonth = React.useMemo(() => {
    const result: { [key: string]: RecordedMatch[] } = {};
    
    // Sort matches by date (most recent first)
    const sortedMatches = [...matches].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Group by month
    sortedMatches.forEach(match => {
      const date = parseISO(match.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!result[monthKey]) {
        result[monthKey] = [];
      }
      
      result[monthKey].push(match);
    });
    
    return result;
  }, [matches]);
  
  // Get array of month keys (for scrolling navigation)
  const monthKeys = Object.keys(matchesByMonth).sort().reverse(); // Most recent months first
  
  // Set the initial selected month to the most recent month with matches
  useEffect(() => {
    if (monthKeys.length > 0 && !selectedMonth) {
      const mostRecentMonth = monthKeys[0];
      setSelectedMonth(parseISO(`${mostRecentMonth}-01`));
    }
  }, [monthKeys, selectedMonth]);
  
  // Navigate to previous month
  const prevMonth = () => {
    if (visibleRange[0] > 0) {
      setVisibleRange([visibleRange[0] - 1, visibleRange[1] - 1]);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (visibleRange[1] < monthKeys.length - 1) {
      setVisibleRange([visibleRange[0] + 1, visibleRange[1] + 1]);
    }
  };
  
  // Check if there are previous/next months to navigate to
  const hasPrevMonths = visibleRange[0] > 0;
  const hasNextMonths = visibleRange[1] < monthKeys.length - 1;
  
  // Get visible months
  const visibleMonths = monthKeys.slice(visibleRange[0], visibleRange[1] + 1);
  
  // Handle scroll wheel events for horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      // Vertical scrolling - convert to horizontal
      if (e.deltaY > 0 && hasNextMonths) {
        nextMonth();
      } else if (e.deltaY < 0 && hasPrevMonths) {
        prevMonth();
      }
    } else {
      // Horizontal scrolling
      if (e.deltaX > 0 && hasNextMonths) {
        nextMonth();
      } else if (e.deltaX < 0 && hasPrevMonths) {
        prevMonth();
      }
    }
  };
  
  if (monthKeys.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No matches found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Match Timeline</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            disabled={!hasPrevMonths}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            disabled={!hasNextMonths}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Timeline visualization */}
      <div
        ref={timelineRef}
        className="relative overflow-hidden"
        onWheel={handleWheel}
      >
        <div className="flex space-x-3 pb-4 overflow-x-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {visibleMonths.map((monthKey, idx) => (
              <motion.div
                key={monthKey}
                className="flex-shrink-0 w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <div className="mb-3 sticky left-0">
                  <h4 className="text-lg font-medium">
                    {format(parseISO(`${monthKey}-01`), 'MMMM yyyy')}
                  </h4>
                  <div className="h-1 w-16 bg-primary rounded mt-1"></div>
                </div>
                
                <div className="space-y-4">
                  {matchesByMonth[monthKey].map((match) => (
                    <MatchTimelineCard
                      key={match.id}
                      match={match}
                      currentUserId={user?.id}
                      onClick={() => onMatchSelected(match)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Timeline visual elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div 
            className="absolute h-full bg-primary" 
            style={{ 
              left: `${(visibleRange[0] / Math.max(1, monthKeys.length - 1)) * 100}%`,
              right: `${(1 - (visibleRange[1] / Math.max(1, monthKeys.length - 1))) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface MatchTimelineCardProps {
  match: RecordedMatch;
  currentUserId?: number;
  onClick?: () => void;
}

/**
 * MatchTimelineCard
 * 
 * A card component that displays match information within the timeline.
 * Uses TiltCard for 3D interactive effect and enhanced visual hierarchy.
 */
function MatchTimelineCard({ match, currentUserId, onClick }: MatchTimelineCardProps) {
  const {
    date,
    players,
    formatType,
    location,
    matchType,
    validationStatus
  } = match;
  
  const matchDate = parseISO(date);
  const formattedDate = format(matchDate, 'MMM d, yyyy');
  const formattedTime = format(matchDate, 'h:mm a');
  
  // Find the current user's player data and their opponent
  const currentUserPlayer = players.find(p => p.userId === currentUserId);
  const opponentPlayer = players.find(p => p.userId !== currentUserId);
  
  if (!currentUserPlayer || !opponentPlayer) {
    return null;
  }
  
  const userWon = currentUserPlayer.isWinner;
  const glowColor = userWon 
    ? 'rgba(34, 197, 94, 0.35)' // Success green with transparency
    : 'rgba(239, 68, 68, 0.35)'; // Destructive red with transparency
  
  return (
    <TiltCard
      /* MATCH-UI-278652[ENHANCE] - Mobile-optimized match card */
      glowColor={glowColor}
      tiltAmount={10} // Reduced tilt for better mobile usability
      glowOnHover={true}
      glowAlways={true}
      hoverScale={1.05} // Smaller hover for better mobile experience
      onClick={onClick}
      className={`border-2 shadow-md ${userWon ? 'border-green-500/30 bg-gradient-to-br from-green-50/5 to-green-900/5' : 'border-red-500/30 bg-gradient-to-br from-red-50/5 to-red-900/5'}`}
    >
      <div className="p-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          {/* Player info - Stack elements on mobile */}
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 shrink-0">
              {opponentPlayer.avatarUrl ? (
                <AvatarImage src={opponentPlayer.avatarUrl} alt={opponentPlayer.displayName} />
              ) : (
                <AvatarFallback>
                  {opponentPlayer.avatarInitials || opponentPlayer.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0"> {/* Prevent text overflow */}
              <div className="font-medium truncate">
                vs {opponentPlayer.displayName || 'Unknown Player'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center flex-wrap gap-1 sm:gap-x-3">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> {formattedDate}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {formattedTime}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {location && (
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    <MapPin className="h-3 w-3 mr-1" /> 
                    <span className="truncate max-w-[80px]">{location}</span>
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize py-0 h-5">
                  <Users className="h-3 w-3 mr-1" /> {formatType}
                </Badge>
                {matchType && (
                  <Badge variant="outline" className="text-xs capitalize py-0 h-5">
                    {matchType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Score info - Aligned right on desktop, centered on mobile */}
          <div className="sm:text-right flex flex-row justify-between sm:block items-center border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
            <div className="flex items-center">
              <span className="font-bold mr-2 text-lg">
                {currentUserPlayer.score} - {opponentPlayer.score}
              </span>
              <Badge variant={userWon ? "success" : "destructive"} className="h-6">
                {userWon ? "Won" : "Lost"}
              </Badge>
            </div>
            
            {/* Points visualization - Stack on mobile */}
            <div className="flex gap-1 sm:gap-2 sm:mt-2 sm:justify-end">
              <Badge variant="outline" className="text-xs flex items-center py-0 h-5">
                <Trophy className="h-3 w-3 mr-1" /> +15 pts
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center py-0 h-5">
                <Zap className="h-3 w-3 mr-1" /> +25 XP
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

export default MatchTimeline;