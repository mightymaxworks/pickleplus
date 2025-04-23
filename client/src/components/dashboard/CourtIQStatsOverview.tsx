import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, BarChart2, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCourtIQPerformance, CourtIQPerformanceData } from "@/hooks/use-courtiq-performance";

interface CourtIQStatsOverviewProps {
  userId?: number;
  enhancedPerformanceData?: CourtIQPerformanceData;
}

export default function CourtIQStatsOverview({ userId, enhancedPerformanceData: propData }: CourtIQStatsOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSourceBreakdown, setShowSourceBreakdown] = useState(false);
  const [, navigate] = useLocation();
  
  // Query user ratings using the legacy endpoint
  const { data: courtIQStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/user/ratings", { userId }],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/user/ratings?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch CourtIQ stats");
        return await res.json();
      } catch (error) {
        console.error("Error fetching CourtIQ stats:", error);
        return null;
      }
    },
  });
  
  // Use the enhanced CourtIQ performance hook with source-specific ratings
  // Always fetch data in development mode for visualization testing
  const { data: fetchedPerformanceData, isLoading: isPerformanceLoading } = useCourtIQPerformance({
    userId: userId || 1, // Default to userId 1 if not provided
    enabled: !propData // Always enable in development
  });
  
  // Use the prop data if provided, otherwise use the fetched data
  const enhancedPerformanceData = propData || fetchedPerformanceData;
  
  const isLoading = isStatsLoading || isPerformanceLoading;
  
  // Calculate the normalized values for radar chart (0-100)
  const normalizeValue = (value: number, max = 1500) => Math.min(100, Math.max(0, (value / max) * 100));
  
  const navigateToDetailedAnalysis = () => {
    // Navigate to the detailed CourtIQ analysis page with the current user's ID
    navigate(`/courtiq/analysis/${userId || 1}`);
  };
  
  // Function to toggle the source breakdown view
  const toggleSourceBreakdown = () => {
    setShowSourceBreakdown(!showSourceBreakdown);
  };
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-purple-500/20' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-purple-500" />
          CourtIQ™ Stats
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Loading stats...</div>
          </div>
        ) : enhancedPerformanceData || courtIQStats ? (
          <div className="space-y-4">
            {/* Overall Rating */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Overall Rating</div>
                <div className="text-2xl font-bold text-purple-500">
                  {enhancedPerformanceData?.overallRating || courtIQStats?.overall || 1250}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-gray-500">Rank</div>
                <div className="text-xl font-bold flex items-center">
                  {courtIQStats?.rank ? (
                    <>
                      <span className="mr-1">{courtIQStats.rank}</span>
                      {courtIQStats.rankChange < 0 ? (
                        <TrendingUp size={16} className="text-green-500" />
                      ) : courtIQStats.rankChange > 0 ? (
                        <TrendingDown size={16} className="text-red-500" />
                      ) : null}
                    </>
                  ) : (
                    <span className="text-gray-400">22</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Radar Chart */}
            <div className="relative h-52 mx-auto">
              {/* Source type visualization toggle - always visible in development */}
              {(enhancedPerformanceData?.sourceRatings || import.meta.env.DEV) && (
                <div className="absolute top-0 right-0 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={toggleSourceBreakdown}
                        >
                          <Info size={14} className={showSourceBreakdown ? "text-primary" : "text-muted-foreground"} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Toggle multi-source visualization</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              {courtIQStats?.dimensions || enhancedPerformanceData?.dimensions ? (
                <>
                  {/* Base pentagon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[90%] h-[90%] relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Grid lines */}
                        <polygon points="50,10 90,50 70,90 30,90 10,50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="0.5" 
                        />
                        <polygon points="50,20 80,50 65,80 35,80 20,50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="0.5" 
                        />
                        <polygon points="50,30 70,50 60,70 40,70 30,50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="0.5" 
                        />
                        <polygon points="50,40 60,50 55,60 45,60 40,50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="0.5" 
                        />
                        
                        {/* Default radar or multi-source visualizations */}
                        {showSourceBreakdown && (enhancedPerformanceData?.sourceRatings || import.meta.env.DEV) ? (
                          <>
                            {/* Self-assessment polygon (purple) */}
                            <polygon 
                              points={`
                                50,${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.power || 45), 100) * 0.4} 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.focus || 35), 100) * 0.4},50 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.consistency || 45), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.consistency || 45), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.speed || 45), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.speed || 45), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.self?.strategy || 40), 100) * 0.4},50
                              `}
                              fill="rgba(139, 92, 246, 0.1)"
                              stroke="#8b5cf6"
                              strokeWidth="1"
                              strokeDasharray="0"
                            />
                            
                            {/* Opponent-assessment polygon (red) */}
                            <polygon 
                              points={`
                                50,${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.power || 35), 100) * 0.4} 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.focus || 25), 100) * 0.4},50 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.consistency || 30), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.consistency || 30), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.speed || 35), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.speed || 35), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.opponent?.strategy || 25), 100) * 0.4},50
                              `}
                              fill="rgba(244, 67, 54, 0.1)"
                              stroke="#F44336"
                              strokeWidth="1"
                              strokeDasharray="0"
                            />
                            
                            {/* Coach-assessment polygon (green) */}
                            <polygon 
                              points={`
                                50,${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.power || 50), 100) * 0.4} 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.focus || 30), 100) * 0.4},50 
                                ${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.consistency || 40), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.consistency || 40), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.speed || 40), 100) * 0.2},${50 + normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.speed || 40), 100) * 0.2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.sourceRatings?.coach?.strategy || 30), 100) * 0.4},50
                              `}
                              fill="rgba(76, 175, 80, 0.1)"
                              stroke="#4CAF50"
                              strokeWidth="1"
                              strokeDasharray="0"
                            />
                            
                            {/* Composite (black outline - no fill) */}
                            <polygon 
                              points={`
                                50,${50 - normalizeValue((enhancedPerformanceData?.dimensions?.power?.score || 4), 10) * 4} 
                                ${50 + normalizeValue((enhancedPerformanceData?.dimensions?.focus?.score || 3), 10) * 4},50 
                                ${50 + normalizeValue((enhancedPerformanceData?.dimensions?.consistency?.score || 4), 10) * 2},${50 + normalizeValue((enhancedPerformanceData?.dimensions?.consistency?.score || 4), 10) * 2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.dimensions?.speed?.score || 4), 10) * 2},${50 + normalizeValue((enhancedPerformanceData?.dimensions?.speed?.score || 4), 10) * 2} 
                                ${50 - normalizeValue((enhancedPerformanceData?.dimensions?.strategy?.score || 3), 10) * 4},50
                              `}
                              fill="none"
                              stroke="#000000"
                              strokeWidth="1.5"
                              strokeDasharray="0"
                            />
                          </>
                        ) : (
                          // Default view - just show the aggregate ratings with fallbacks for development
                          <polygon 
                            points={`
                              50,${50 - normalizeValue(courtIQStats?.dimensions?.power || (enhancedPerformanceData?.dimensions?.power?.score ? enhancedPerformanceData?.dimensions?.power?.score * 100 : 40) || 40) * 0.4} 
                              ${50 + normalizeValue(courtIQStats?.dimensions?.control || (enhancedPerformanceData?.dimensions?.focus?.score ? enhancedPerformanceData?.dimensions?.focus?.score * 100 : 30) || 30) * 0.4},50 
                              ${50 + normalizeValue(courtIQStats?.dimensions?.consistency || (enhancedPerformanceData?.dimensions?.consistency?.score ? enhancedPerformanceData?.dimensions?.consistency?.score * 100 : 35) || 35) * 0.2},${50 + normalizeValue(courtIQStats?.dimensions?.consistency || (enhancedPerformanceData?.dimensions?.consistency?.score ? enhancedPerformanceData?.dimensions?.consistency?.score * 100 : 35) || 35) * 0.2} 
                              ${50 - normalizeValue(courtIQStats?.dimensions?.mobility || (enhancedPerformanceData?.dimensions?.speed?.score ? enhancedPerformanceData?.dimensions?.speed?.score * 100 : 35) || 35) * 0.2},${50 + normalizeValue(courtIQStats?.dimensions?.mobility || (enhancedPerformanceData?.dimensions?.speed?.score ? enhancedPerformanceData?.dimensions?.speed?.score * 100 : 35) || 35) * 0.2} 
                              ${50 - normalizeValue(courtIQStats?.dimensions?.strategy || (enhancedPerformanceData?.dimensions?.strategy?.score ? enhancedPerformanceData?.dimensions?.strategy?.score * 100 : 30) || 30) * 0.4},50
                            `}
                            fill="rgba(139, 92, 246, 0.2)"
                            stroke="#8b5cf6"
                            strokeWidth="1.5"
                          />
                        )}
                      </svg>
                      
                      {/* Labels */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs font-medium text-gray-700">Power</div>
                      <div className="absolute top-1/2 right-0 transform translate-x-1 text-xs font-medium text-gray-700">Control</div>
                      <div className="absolute bottom-0 right-1/4 transform translate-x-1/2 text-xs font-medium text-gray-700">Consistency</div>
                      <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2 text-xs font-medium text-gray-700">Mobility</div>
                      <div className="absolute top-1/2 left-0 transform -translate-x-1 text-xs font-medium text-gray-700">Strategy</div>
                    </div>
                  </div>
                  
                  {/* Dimension values */}
                  {isExpanded && !showSourceBreakdown && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center">
                        <div className="bg-purple-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Power</div>
                          <div className="text-sm font-bold text-purple-500">
                            {courtIQStats?.dimensions?.power || 
                             (enhancedPerformanceData?.dimensions?.power?.score ? 
                              Math.round(enhancedPerformanceData.dimensions.power.score * 10) : 0)}
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Control</div>
                          <div className="text-sm font-bold text-purple-500">
                            {courtIQStats?.dimensions?.control || 
                             (enhancedPerformanceData?.dimensions?.focus?.score ? 
                              Math.round(enhancedPerformanceData.dimensions.focus.score * 10) : 0)}
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Consistency</div>
                          <div className="text-sm font-bold text-purple-500">
                            {courtIQStats?.dimensions?.consistency || 
                             (enhancedPerformanceData?.dimensions?.consistency?.score ? 
                              Math.round(enhancedPerformanceData.dimensions.consistency.score * 10) : 0)}
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Mobility</div>
                          <div className="text-sm font-bold text-purple-500">
                            {courtIQStats?.dimensions?.mobility || 
                             (enhancedPerformanceData?.dimensions?.speed?.score ? 
                              Math.round(enhancedPerformanceData.dimensions.speed.score * 10) : 0)}
                          </div>
                        </div>
                        <div className="col-span-2 bg-purple-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Strategy</div>
                          <div className="text-sm font-bold text-purple-500">
                            {courtIQStats?.dimensions?.strategy || 
                             (enhancedPerformanceData?.dimensions?.strategy?.score ? 
                              Math.round(enhancedPerformanceData.dimensions.strategy.score * 10) : 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Multi-source breakdown legend */}
                  {showSourceBreakdown && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                        <span>Self</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                        <span>Opponent</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span>Coach</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <Activity className="h-8 w-8 text-gray-300 mb-2" />
                  <div className="text-sm text-gray-500">Play more matches to generate your CourtIQ™ profile</div>
                </div>
              )}
            </div>
            
            {/* If expanded, show additional data */}
            {isExpanded && courtIQStats && (
              <>
                {/* Recent Trends */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Trends</h4>
                  
                  <div className="space-y-2">
                    {courtIQStats.recentTrends ? (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-600">Last 5 Matches</div>
                          <div className="flex items-center">
                            {courtIQStats.recentTrends.change > 0 ? (
                              <>
                                <TrendingUp size={14} className="text-green-500 mr-1" />
                                <span className="text-xs font-medium text-green-600">
                                  +{courtIQStats.recentTrends.change} pts
                                </span>
                              </>
                            ) : courtIQStats.recentTrends.change < 0 ? (
                              <>
                                <TrendingDown size={14} className="text-red-500 mr-1" />
                                <span className="text-xs font-medium text-red-600">
                                  {courtIQStats.recentTrends.change} pts
                                </span>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-gray-600">No change</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-600">Strongest Area</div>
                          <div className="text-xs font-medium text-gray-800">
                            {courtIQStats.recentTrends.strongestArea || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-600">Area to Improve</div>
                          <div className="text-xs font-medium text-gray-800">
                            {courtIQStats.recentTrends.weakestArea || 'N/A'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Play more matches to see trends
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-center mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToDetailedAnalysis}
                className="w-full text-xs"
              >
                View Detailed Analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <BarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-medium text-gray-700">No CourtIQ™ Data Yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Play matches to generate your stats</p>
            <Button 
              onClick={() => navigate("/record-match")}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600"
            >
              Record a Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}