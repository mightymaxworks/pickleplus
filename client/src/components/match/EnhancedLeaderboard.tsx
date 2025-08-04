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
  gender: 'male' | 'female' | 'other';
  age: number;
  division: string;
  ranking: number;
}

interface EnhancedLeaderboardProps {
  formatType?: "singles" | "doubles";
}

export default function EnhancedLeaderboard({ formatType = "singles" }: EnhancedLeaderboardProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("open");
  const [selectedGender, setSelectedGender] = useState<string>("all");

  // Age divisions based on standard tournament rules
  const ageDivisions = [
    { value: "open", label: "Open (All Ages)", minAge: 0 },
    { value: "35+", label: "35+ Division", minAge: 35 },
    { value: "50+", label: "50+ Division", minAge: 50 },
    { value: "60+", label: "60+ Division", minAge: 60 },
    { value: "70+", label: "70+ Division", minAge: 70 }
  ];

  const genderOptions = [
    { value: "all", label: "All Players" },
    { value: "male", label: "Men" },
    { value: "female", label: "Women" },
    { value: "other", label: "Other" }
  ];

  // Fetch leaderboard data with division and gender filters
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
    
    if (gender === "all") {
      return ageLabel;
    }
    return `${ageLabel} - ${genderLabel}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formatType === "singles" ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          Enhanced Leaderboard - {formatType === "singles" ? "Singles" : "Doubles"}
        </CardTitle>
        
        {/* Filtering Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Age Division</label>
            <div className="flex flex-wrap gap-2">
              {ageDivisions.map((division) => (
                <Button
                  key={division.value}
                  variant={selectedDivision === division.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDivision(division.value)}
                >
                  {division.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Gender</label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((gender) => (
                <Button
                  key={gender.value}
                  variant={selectedGender === gender.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGender(gender.value)}
                >
                  {gender.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing: {getAgeGroupLabel(selectedDivision, selectedGender)}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : leaderboardData && leaderboardData.length > 0 ? (
          <div className="space-y-2">
            {leaderboardData.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 border rounded-lg transition-colors hover:bg-accent/50 ${
                  index < 3 ? "bg-gradient-to-r from-accent/30 to-transparent" : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                
                {/* Player Info */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={player.avatar} alt={player.displayName} />
                  <AvatarFallback>
                    {player.displayName?.charAt(0) || player.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium">{player.displayName || player.username}</div>
                  <div className="text-sm text-muted-foreground">
                    @{player.username} • Age {player.age} • {player.division}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="text-center">
                  <div className="font-bold text-lg">{player.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{player.winRate}%</div>
                  <div className="text-xs text-muted-foreground">win rate</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{player.matchesPlayed}</div>
                  <div className="text-xs text-muted-foreground">matches</div>
                </div>
                
                {/* Division Badge */}
                <Badge variant="secondary">
                  {player.division} {player.gender !== 'other' ? player.gender.charAt(0).toUpperCase() : ''}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rankings Yet</h3>
            <p className="text-muted-foreground">
              No players found for {getAgeGroupLabel(selectedDivision, selectedGender)} division.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Start recording matches to populate the leaderboard!
            </p>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-6 p-4 bg-accent/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Division Rules</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Open Division:</strong> Players of all ages compete together</p>
            <p>• <strong>Age Divisions:</strong> Based on oldest player in doubles, individual age in singles</p>
            <p>• <strong>Gender Separation:</strong> Separate leaderboards for men, women, and mixed competitions</p>
            <p>• <strong>Points System:</strong> Tournament matches (100%), League matches (67%), Casual matches (50%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}