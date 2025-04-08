import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, BarChart2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface CourtIQStatsOverviewProps {
  userId: number;
}

export default function CourtIQStatsOverview({ userId }: CourtIQStatsOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();
  
  // Query user ratings
  const { data: courtIQStats, isLoading } = useQuery({
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
  
  // Calculate the normalized values for radar chart (0-100)
  const normalizeValue = (value: number, max = 1500) => Math.min(100, Math.max(0, (value / max) * 100));
  
  const navigateToTraining = () => {
    navigate("/training");
  };
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-[#2196F3]/20' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-[#2196F3]" />
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
            <div className="animate-spin h-5 w-5 border-2 border-[#2196F3] border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Loading stats...</div>
          </div>
        ) : courtIQStats ? (
          <div className="space-y-4">
            {/* Overall Rating */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Overall Rating</div>
                <div className="text-2xl font-bold text-[#2196F3]">
                  {courtIQStats.overall || 0}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-gray-500">Rank</div>
                <div className="text-xl font-bold flex items-center">
                  {courtIQStats.rank ? (
                    <>
                      <span className="mr-1">{courtIQStats.rank}</span>
                      {courtIQStats.rankChange < 0 ? (
                        <TrendingUp size={16} className="text-green-500" />
                      ) : courtIQStats.rankChange > 0 ? (
                        <TrendingDown size={16} className="text-red-500" />
                      ) : null}
                    </>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Radar Chart */}
            <div className="relative h-52 mx-auto">
              {courtIQStats.dimensions ? (
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
                        
                        {/* Data polygon */}
                        <polygon 
                          points={`
                            50,${50 - normalizeValue(courtIQStats.dimensions.power || 0) * 0.4} 
                            ${50 + normalizeValue(courtIQStats.dimensions.control || 0) * 0.4},50 
                            ${50 + normalizeValue(courtIQStats.dimensions.consistency || 0) * 0.2},${50 + normalizeValue(courtIQStats.dimensions.consistency || 0) * 0.2} 
                            ${50 - normalizeValue(courtIQStats.dimensions.mobility || 0) * 0.2},${50 + normalizeValue(courtIQStats.dimensions.mobility || 0) * 0.2} 
                            ${50 - normalizeValue(courtIQStats.dimensions.strategy || 0) * 0.4},50
                          `}
                          fill="rgba(33, 150, 243, 0.2)"
                          stroke="#2196F3"
                          strokeWidth="1.5"
                        />
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
                  {isExpanded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center">
                        <div className="bg-blue-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Power</div>
                          <div className="text-sm font-bold text-[#2196F3]">{courtIQStats.dimensions.power || 0}</div>
                        </div>
                        <div className="bg-blue-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Control</div>
                          <div className="text-sm font-bold text-[#2196F3]">{courtIQStats.dimensions.control || 0}</div>
                        </div>
                        <div className="bg-blue-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Consistency</div>
                          <div className="text-sm font-bold text-[#2196F3]">{courtIQStats.dimensions.consistency || 0}</div>
                        </div>
                        <div className="bg-blue-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Mobility</div>
                          <div className="text-sm font-bold text-[#2196F3]">{courtIQStats.dimensions.mobility || 0}</div>
                        </div>
                        <div className="col-span-2 bg-blue-50 rounded-md px-2 py-1">
                          <div className="text-xs text-gray-500">Strategy</div>
                          <div className="text-sm font-bold text-[#2196F3]">{courtIQStats.dimensions.strategy || 0}</div>
                        </div>
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
                onClick={navigateToTraining}
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
              className="bg-[#2196F3] hover:bg-[#2196F3]/90"
            >
              Record a Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}