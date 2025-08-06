import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Filter, Users, User } from "lucide-react";
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
  formatType?: "singles" | "doubles" | "mixed";
}

export default function EnhancedLeaderboard({ formatType = "singles" }: EnhancedLeaderboardProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("open");
  const [selectedGender, setSelectedGender] = useState<string>("male");

  // Age divisions based on standard tournament rules
  const ageDivisions = [
    { value: "open", label: "Open (All Ages)", minAge: 0 },
    { value: "35+", label: "35+ Division", minAge: 35 },
    { value: "50+", label: "50+ Division", minAge: 50 },
    { value: "60+", label: "60+ Division", minAge: 60 },
    { value: "70+", label: "70+ Division", minAge: 70 }
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
  ];

  // PicklePlus Tier System - 7 tiers based on algorithm
  const playerTiers: PlayerTier[] = [
    {
      name: "Elite",
      minPoints: 2000,
      maxPoints: 9999,
      color: "text-purple-700",
      bgColor: "bg-gradient-to-r from-purple-100 to-indigo-100",
      icon: "👑",
      description: "Elite competitors"
    },
    {
      name: "Expert",
      minPoints: 1500,
      maxPoints: 1999,
      color: "text-red-700",
      bgColor: "bg-gradient-to-r from-red-100 to-pink-100",
      icon: "🔥",
      description: "Expert level"
    },
    {
      name: "Advanced",
      minPoints: 1000,
      maxPoints: 1499,
      color: "text-orange-700",
      bgColor: "bg-gradient-to-r from-orange-100 to-yellow-100",
      icon: "⭐",
      description: "Advanced players"
    },
    {
      name: "Intermediate",
      minPoints: 500,
      maxPoints: 999,
      color: "text-blue-700",
      bgColor: "bg-gradient-to-r from-blue-100 to-cyan-100",
      icon: "🎯",
      description: "Intermediate skill"
    },
    {
      name: "Developing",
      minPoints: 200,
      maxPoints: 499,
      color: "text-green-700",
      bgColor: "bg-gradient-to-r from-green-100 to-emerald-100",
      icon: "📈",
      description: "Developing skills"
    },
    {
      name: "Beginner",
      minPoints: 50,
      maxPoints: 199,
      color: "text-gray-700",
      bgColor: "bg-gradient-to-r from-gray-100 to-slate-100",
      icon: "🌱",
      description: "New to the game"
    },
    {
      name: "Rookie",
      minPoints: 0,
      maxPoints: 49,
      color: "text-amber-700",
      bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
      icon: "🎾",
      description: "Just starting out"
    }
  ];

  const getPlayerTier = (points: number): PlayerTier => {
    return playerTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || playerTiers[playerTiers.length - 1];
  };

  // Fetch leaderboard data with format, division and gender filters
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: [`/api/leaderboard/${formatType}`, selectedDivision, selectedGender],
    queryFn: async () => {
      const params = new URLSearchParams({
        format: formatType,
        division: selectedDivision,
        gender: selectedGender
      });
      
      const response = await fetch(`/api/leaderboard/${formatType}?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      return await response.json() as LeaderboardEntry[];
    }
  });

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
      {/* Mobile-First Filters */}
      <div className="mb-4">
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
                  onClick={() => setSelectedDivision(division.value)}
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
                  onClick={() => setSelectedGender(gender.value)}
                >
                  {gender.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-orange-600 mt-2 text-center bg-orange-50 rounded px-2 py-1">
          {getAgeGroupLabel(selectedDivision, selectedGender)} • {formatType === "singles" ? "Singles" : 
                                  formatType === "mixed" ? "Mixed Doubles" : "Doubles"}
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
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 transition-colors hover:bg-orange-50/50 ${
                    index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                  } ${tier.bgColor} border-l-4 ${
                    tier.name === "Elite" ? "border-purple-500" :
                    tier.name === "Expert" ? "border-red-500" :
                    tier.name === "Advanced" ? "border-orange-500" :
                    tier.name === "Intermediate" ? "border-blue-500" :
                    tier.name === "Developing" ? "border-green-500" :
                    tier.name === "Beginner" ? "border-gray-500" : "border-amber-500"
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
                    Age {player.age} • {player.winRate}% wins • {player.matchesPlayed} matches
                  </div>
                </div>
                
                {/* Mobile-Optimized Points Display */}
                <div className="text-right">
                  <div className={`font-bold text-sm ${tier.color}`}>{player.points}</div>
                  <div className="text-xs text-orange-600">pts</div>
                </div>
              </div>
            ))}
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