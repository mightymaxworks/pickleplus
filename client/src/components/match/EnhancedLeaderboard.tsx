import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Filter, Users, User, Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Enhanced leaderboard that separates by both age group AND gender
interface LeaderboardEntry {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  points: number;
  matchesPlayed: number;
  winRate: number;
  gender: 'male' | 'female';
  age: number;
  division: string;
  ranking: number;
  isCurrentUser?: boolean;
}

interface LeaderboardResponse {
  players: LeaderboardEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentUserPosition?: {
    ranking: number;
    player: LeaderboardEntry;
  };
  searchTerm?: string;
}

// PicklePlus Tier System based on points
interface PlayerTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

interface EnhancedLeaderboardProps {
  format: "singles" | "doubles" | "mixed";
}

export default function EnhancedLeaderboard({ format }: EnhancedLeaderboardProps) {
  // Remove internal format state - now controlled by parent
  const [selectedDivision, setSelectedDivision] = useState<string>("open");
  const [selectedGender, setSelectedGender] = useState<string>("male");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Age divisions based on standalone youth system 
  const ageDivisions = [
    { value: "open", label: "Open (19+)", minAge: 19 }, // Open category for 19+ players
    { value: "u18", label: "U18 Division", minAge: 0, maxAge: 17 }, // Standalone U18 category
    { value: "u16", label: "U16 Division", minAge: 0, maxAge: 15 }, // Standalone U16 category
    { value: "u14", label: "U14 Division", minAge: 0, maxAge: 13 }, // Standalone U14 category
    { value: "u12", label: "U12 Division", minAge: 0, maxAge: 11 }, // Standalone U12 category
    { value: "35+", label: "35+ Division", minAge: 35 },
    { value: "50+", label: "50+ Division", minAge: 50 },
    { value: "60+", label: "60+ Division", minAge: 60 },
    { value: "70+", label: "70+ Division", minAge: 70 }
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
  ];

  // PicklePlus 4-Tier System - From Official Algorithm Document
  const playerTiers: PlayerTier[] = [
    {
      name: "Professional",
      minPoints: 1800,
      maxPoints: 9999,
      color: "text-purple-700",
      bgColor: "bg-gradient-to-r from-purple-100 to-indigo-100",
      icon: "👑",
      description: "Professional players - Maximum competitive expectation"
    },
    {
      name: "Elite",
      minPoints: 1000,
      maxPoints: 1799,
      color: "text-red-700",
      bgColor: "bg-gradient-to-r from-red-100 to-pink-100",
      icon: "🔥",
      description: "Elite players - High activity required"
    },
    {
      name: "Competitive",
      minPoints: 300,
      maxPoints: 999,
      color: "text-orange-700",
      bgColor: "bg-gradient-to-r from-orange-100 to-yellow-100",
      icon: "⭐",
      description: "Competitive players - Moderate activity expected"
    },
    {
      name: "Recreational",
      minPoints: 0,
      maxPoints: 299,
      color: "text-blue-700",
      bgColor: "bg-gradient-to-r from-blue-100 to-cyan-100",
      icon: "🎯",
      description: "Recreational players - Low barrier to entry"
    }
  ];

  const getPlayerTier = (points: number): PlayerTier => {
    return playerTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || playerTiers[playerTiers.length - 1];
  };

  // Fetch leaderboard data with enhanced features
  const { data: leaderboardResponse, isLoading } = useQuery({
    queryKey: [`/api/enhanced-leaderboard`, format, selectedDivision, selectedGender, debouncedSearch, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        format: format,
        division: selectedDivision,
        gender: selectedGender,
        page: currentPage.toString(),
        limit: '20',
        search: debouncedSearch
      });
      
      const response = await fetch(`/api/enhanced-leaderboard?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      return await response.json() as LeaderboardResponse;
    }
  });
  
  const leaderboardData = leaderboardResponse?.players || [];
  const currentUserPosition = leaderboardResponse?.currentUserPosition;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getAgeGroupLabel = (division: string, gender: string) => {
    const ageLabel = ageDivisions.find(d => d.value === division)?.label || division;
    const genderLabel = genderOptions.find(g => g.value === gender)?.label || "";
    
    return `${ageLabel} - ${genderLabel}`;
  };

  return (
    <div className="w-full">
      {/* Mobile-First Filters and Search */}
      <div className="mb-4">
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
            <Input
              placeholder="Search players by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Current User Position Display */}
        {currentUserPosition && currentUserPosition.player && (
          <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">
                Your Position: #{currentUserPosition.ranking} ({(currentUserPosition.player.points || 0).toFixed(2)} pts)
              </span>
            </div>
          </div>
        )}

        {/* Compact Filter Controls */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-orange-700 mb-2 block">Age Group</label>
            <div className="flex flex-wrap gap-1">
              {ageDivisions.map((division) => (
                <Button
                  key={division.value}
                  variant={selectedDivision === division.value ? "default" : "outline"}
                  size="sm"
                  className={`h-7 text-xs px-2 ${
                    selectedDivision === division.value 
                      ? "bg-orange-600 hover:bg-orange-700 text-white" 
                      : "border-orange-200 text-orange-700 hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setSelectedDivision(division.value);
                    setCurrentPage(1);
                  }}
                >
                  {division.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-orange-700 mb-2 block">Gender</label>
            <div className="flex gap-1">
              {genderOptions.map((gender) => (
                <Button
                  key={gender.value}
                  variant={selectedGender === gender.value ? "default" : "outline"}
                  size="sm"
                  className={`h-7 text-xs px-3 flex-1 ${
                    selectedGender === gender.value 
                      ? "bg-orange-600 hover:bg-orange-700 text-white" 
                      : "border-orange-200 text-orange-700 hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setSelectedGender(gender.value);
                    setCurrentPage(1);
                  }}
                >
                  {gender.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Format now controlled by parent component */}
        
        <div className="text-xs text-orange-600 mt-2 text-center bg-orange-50 rounded px-2 py-1">
          {getAgeGroupLabel(selectedDivision, selectedGender)} • {format === "singles" ? "Singles" : 
                                  format === "mixed" ? "Mixed Doubles" : "Doubles"}
        </div>
      </div>
      
      {/* Mobile-Optimized Rankings Display */}
      <div className="bg-white rounded-lg border border-orange-100">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 rounded w-8 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-6" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboardData && leaderboardData.length > 0 ? (
          <div className="divide-y divide-orange-100">
            {leaderboardData.map((player, index) => {
              const tier = getPlayerTier(player.points);
              const isCurrentUser = player.isCurrentUser;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 transition-colors ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm ring-1 ring-green-200 border-l-4 border-green-500' 
                      : `hover:bg-orange-50/50 ${index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""} ${tier.bgColor} border-l-4 ${
                          tier.name === "Professional" ? "border-purple-500" :
                          tier.name === "Elite" ? "border-red-500" :
                          tier.name === "Competitive" ? "border-orange-500" :
                          "border-blue-500"
                        }`
                  }`}
                >
                  {/* Mobile-Optimized Rank */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      getRankIcon(index + 1)
                    ) : (
                      <span className="text-xs font-bold text-orange-600">#{index + 1}</span>
                    )}
                  </div>
                
                {/* Compact Player Info */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatar} alt={player.displayName} />
                  <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                    {player.displayName?.charAt(0) || player.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-sm truncate">{player.displayName || player.username}</div>
                    {/* Tier Badge */}
                    <Badge 
                      variant="secondary" 
                      className={`text-xs h-4 px-2 ${tier.color} ${tier.bgColor} border-0 font-semibold`}
                    >
                      <span className="mr-1">{tier.icon}</span>
                      {tier.name}
                    </Badge>
                  </div>
                  <div className="text-xs text-orange-600 truncate">
                    Age {player.age || 'N/A'} • {(player.winRate || 0).toFixed(1)}% wins • {player.matchesPlayed || 0} matches
                  </div>
                </div>
                
                {/* Mobile-Optimized Points Display */}
                <div className="text-right">
                  <div className={`font-bold text-sm ${tier.color}`}>{(player.points || 0).toFixed(2)}</div>
                  <div className="text-xs text-orange-600">pts</div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <Trophy className="h-10 w-10 text-orange-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium mb-1 text-orange-800">No Rankings Yet</h3>
            <p className="text-xs text-orange-600 mb-2">
              No players in {getAgeGroupLabel(selectedDivision, selectedGender)}
            </p>
            <p className="text-xs text-orange-500">
              Start recording matches to populate rankings!
            </p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {leaderboardResponse && leaderboardResponse.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-orange-50/50 border-t border-orange-100">
            <div className="text-xs text-orange-600">
              Page {leaderboardResponse.currentPage} of {leaderboardResponse.totalPages}
              {leaderboardResponse.totalCount > 0 && (
                <span className="ml-2">({leaderboardResponse.totalCount} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={leaderboardResponse.currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                size="sm" 
                variant="outline"
                className="h-7 px-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={leaderboardResponse.currentPage >= leaderboardResponse.totalPages}
                onClick={() => setCurrentPage(p => Math.min(leaderboardResponse.totalPages, p + 1))}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Compact Legend */}
        <div className="p-3 bg-orange-50/50 border-t border-orange-100">
          <div className="text-xs text-orange-600 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">Scoring:</span>
              <span>All formats count equally</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Age Groups:</span>
              <span>Based on oldest player</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}