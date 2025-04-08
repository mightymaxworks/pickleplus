import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordedMatch } from '@/lib/sdk/matchSDK';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MatchTimeline from './MatchTimeline';
import MatchTrends from './MatchTrends';
import ContextualFilters, { ContextualFiltersState } from './ContextualFilters';
import MatchDetails from './MatchDetails';
import { TiltCard } from '@/components/ui/tilt-card';
import { 
  BarChart4, 
  Calendar, 
  Trophy, 
  Users, 
  Activity, 
  Zap,
  Monitor,
  PlusCircle,
  Filter,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MatchDashboardProps {
  matches: RecordedMatch[];
  matchStats: {
    totalMatches: number | string;
    matchesWon: number | string;
    winRate: number | string;
    singlesMatches?: number | string;
    doublesMatches?: number | string;
  };
  isLoading?: boolean;
  onMatchSelected?: (match: RecordedMatch) => void;
  onRecordMatch?: () => void;
  onRefreshData?: () => void;
  className?: string;
}

/**
 * MatchDashboard Component
 * 
 * A modern HUD-style interface for the Match Center that provides a visually rich
 * and interactive experience for viewing match history, stats, and trends.
 * 
 * Part of the MATCH-UI-278651[ENHANCE] implementation.
 */
export function MatchDashboard({
  matches,
  matchStats,
  isLoading = false,
  onMatchSelected,
  onRecordMatch,
  onRefreshData,
  className = ''
}: MatchDashboardProps) {
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<RecordedMatch | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'stats'>('timeline');
  const [filters, setFilters] = useState<ContextualFiltersState>({
    dateRange: [null, null],
    matchType: 'all',
    formatType: 'all',
    opponent: null,
    location: null
  });
  
  // Apply filters to matches
  const filteredMatches = React.useMemo(() => {
    if (!matches) return [];
    
    return matches.filter(match => {
      // Date range filter
      if (filters.dateRange[0] || filters.dateRange[1]) {
        const matchDate = new Date(match.date);
        
        if (filters.dateRange[0] && matchDate < filters.dateRange[0]) {
          return false;
        }
        
        if (filters.dateRange[1]) {
          // Set time to end of day
          const endDate = new Date(filters.dateRange[1]);
          endDate.setHours(23, 59, 59, 999);
          
          if (matchDate > endDate) {
            return false;
          }
        }
      }
      
      // Match type filter
      if (filters.matchType !== 'all' && match.matchType !== filters.matchType) {
        return false;
      }
      
      // Format type filter
      if (filters.formatType !== 'all' && match.formatType !== filters.formatType) {
        return false;
      }
      
      // Opponent filter
      if (filters.opponent) {
        const opponentFound = match.players.some(p => 
          p.userId === filters.opponent?.id && p.userId !== user?.id
        );
        
        if (!opponentFound) {
          return false;
        }
      }
      
      // Location filter
      if (filters.location && match.location !== filters.location) {
        return false;
      }
      
      return true;
    });
  }, [matches, filters, user]);
  
  // Handle match selection
  const handleMatchSelect = (match: RecordedMatch) => {
    setSelectedMatch(match);
    if (onMatchSelected) {
      onMatchSelected(match);
    }
  };
  
  // Handle view toggle
  const handleViewToggle = (view: 'timeline' | 'stats') => {
    setActiveView(view);
  };
  
  if (isLoading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-24 bg-muted rounded mb-3"></div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 w-48 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`${className} space-y-6`}>
      {/* Header with stats cards */}
      {/* MATCH-UI-278652[ENHANCE] - Mobile-optimized dashboard layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Matches - More compact for mobile */}
        <TiltCard 
          className="border-2 border-primary/20 p-1 overflow-visible bg-gradient-to-br from-background to-muted shadow-md" 
          tiltAmount={10} // Reduced tilt for better mobile usability
          glowOnHover={true}
          glowAlways={true}
          hoverScale={1.05} // Smaller scale for mobile
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-muted-foreground text-xs sm:text-sm font-medium">
                <Calendar className="h-4 w-4 mr-1 text-primary" />
                <span className="hidden xs:inline">Total</span> Matches
              </div>
              <Badge variant="outline" className="text-xs font-bold hidden sm:flex">Lifetime</Badge>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{matchStats?.totalMatches || 0}</div>
            <div className="w-full h-1.5 md:h-2 bg-primary/10 rounded-full mt-2 md:mt-3">
              <div 
                className="h-full bg-primary rounded-full shadow-sm" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </CardContent>
        </TiltCard>
        
        {/* Matches Won - More compact for mobile */}
        <TiltCard 
          className="border-2 border-primary/20 p-1 bg-gradient-to-br from-background to-muted shadow-md" 
          tiltAmount={10}
          glowOnHover={true} 
          glowAlways={true}
          hoverScale={1.05}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-muted-foreground text-xs sm:text-sm font-medium">
                <Trophy className="h-4 w-4 mr-1 text-primary" />
                <span className="hidden xs:inline">Matches</span> Won
              </div>
              <Badge variant="outline" className="text-xs font-bold hidden sm:flex">Lifetime</Badge>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{matchStats?.matchesWon || 0}</div>
            <div className="w-full h-1.5 md:h-2 bg-primary/10 rounded-full mt-2 md:mt-3">
              <div 
                className="h-full bg-primary rounded-full shadow-sm" 
                style={{ width: `${matchStats?.winRate || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </TiltCard>
        
        {/* Win Rate - More compact for mobile */}
        <TiltCard 
          className="border-2 border-green-500/20 p-1 bg-gradient-to-br from-background to-muted shadow-md" 
          tiltAmount={10}
          glowOnHover={true}
          glowAlways={true}
          hoverScale={1.05}
          glowColor="rgba(132, 204, 22, 0.4)" // Success green
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-muted-foreground text-xs sm:text-sm font-medium">
                <BarChart4 className="h-4 w-4 mr-1 text-green-500" />
                Win Rate
              </div>
              <Badge variant="outline" className="text-xs font-bold text-green-500 border-green-500/50 hidden sm:flex">Performance</Badge>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-green-500">{matchStats?.winRate || 0}%</div>
            <div className="w-full h-1.5 md:h-2 bg-primary/10 rounded-full mt-2 md:mt-3">
              <div 
                className="h-full bg-green-500 rounded-full shadow-sm" 
                style={{ width: `${matchStats?.winRate || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </TiltCard>
        
        {/* Format Breakdown - More compact for mobile */}
        <TiltCard 
          className="border-2 border-blue-500/20 p-1 bg-gradient-to-br from-background to-muted shadow-md" 
          tiltAmount={10}
          glowOnHover={true}
          glowAlways={true}
          hoverScale={1.05}
          glowColor="rgba(59, 130, 246, 0.4)" // Blue
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-muted-foreground text-xs sm:text-sm font-medium">
                <Users className="h-4 w-4 mr-1 text-blue-500" />
                Format
              </div>
              <Badge variant="outline" className="text-xs font-bold text-blue-500 border-blue-500/50 hidden sm:flex">Distribution</Badge>
            </div>
            <div className="flex items-center justify-between text-xl md:text-2xl mt-1 md:mt-2">
              <div className="text-center">
                <div className="text-xs md:text-sm text-muted-foreground">Singles</div>
                <div className="font-bold text-blue-500 text-2xl md:text-3xl">{matchStats?.singlesMatches || 0}</div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-8 md:h-10 bg-blue-500/20" />
              <div className="text-center">
                <div className="text-xs md:text-sm text-muted-foreground">Doubles</div>
                <div className="font-bold text-blue-500 text-2xl md:text-3xl">{matchStats?.doublesMatches || 0}</div>
              </div>
            </div>
          </CardContent>
        </TiltCard>
      </div>
      
      {/* MATCH-UI-278652[ENHANCE] - Mobile-optimized filters and controls */}
      <div className="space-y-3">
        {/* Action buttons - Top placement on mobile for easy access */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-1 ${activeView === 'timeline' ? 'bg-muted' : ''}`}
              onClick={() => handleViewToggle('timeline')}
            >
              <Activity className="h-4 w-4" />
              <span className="hidden xs:inline">Timeline</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-1 ${activeView === 'stats' ? 'bg-muted' : ''}`}
              onClick={() => handleViewToggle('stats')}
            >
              <BarChart4 className="h-4 w-4" />
              <span className="hidden xs:inline">Stats</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefreshData}
              className="gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={onRecordMatch}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden xs:inline">Record</span> Match
          </Button>
        </div>
        
        {/* Filters - Full width on mobile */}
        <div className="w-full">
          <ContextualFilters 
            matches={matches} 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>
      </div>
      
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeView === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredMatches.length > 0 ? (
              <MatchTimeline 
                matches={filteredMatches} 
                onMatchSelected={handleMatchSelect} 
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                  {matches.length > 0 ? (
                    <>
                      <h3 className="font-medium text-lg">No matches match your filters</h3>
                      <p className="text-muted-foreground">Try adjusting your filters to see more matches.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setFilters({
                          dateRange: [null, null],
                          matchType: 'all',
                          formatType: 'all',
                          opponent: null,
                          location: null
                        })}
                      >
                        Reset Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-lg">No Matches Yet</h3>
                      <p className="text-muted-foreground mb-4">Record your first match to start building your history.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={onRecordMatch}
                        className="gap-1"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Record Match
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
        
        {activeView === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredMatches.length > 0 ? (
              <MatchTrends matches={filteredMatches} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart4 className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                  <h3 className="font-medium text-lg">No Stats Available</h3>
                  <p className="text-muted-foreground">Record matches to see your performance stats.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetails 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}

export default MatchDashboard;