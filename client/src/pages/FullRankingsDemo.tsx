/**
 * Full Rankings Demo - Complete Leaderboard Tables
 * 
 * This demonstrates what the full rankings page would look like when
 * accessed from the condensed passport rankings display
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Trophy, Search, Filter, TrendingUp, TrendingDown, 
  ArrowLeft, Users, Award, Calendar, MapPin 
} from "lucide-react";

const mockLeaderboardData = [
  { rank: 1, name: "Sarah Chen", points: 2847, trend: "up", matches: 45, winRate: 89, location: "NYC" },
  { rank: 2, name: "Mike Rodriguez", points: 2734, trend: "up", matches: 52, winRate: 85, location: "LA" },
  { rank: 3, name: "Emily Johnson", points: 2698, trend: "down", matches: 38, winRate: 87, location: "Chicago" },
  { rank: 4, name: "David Kim", points: 2651, trend: "up", matches: 41, winRate: 83, location: "Seattle" },
  { rank: 5, name: "Lisa Wang", points: 2589, trend: "same", matches: 47, winRate: 81, location: "Boston" },
  { rank: 6, name: "Alex Thompson", points: 2523, trend: "up", matches: 39, winRate: 84, location: "Denver" },
  { rank: 7, name: "Maria Garcia", points: 2467, trend: "down", matches: 43, winRate: 78, location: "Miami" },
  { rank: 8, name: "You (Jake Smith)", points: 1456, trend: "up", matches: 16, winRate: 75, location: "NYC", isCurrentUser: true },
  { rank: 9, name: "Jordan Lee", points: 1389, trend: "down", matches: 32, winRate: 72, location: "Austin" },
  { rank: 10, name: "Taylor Brown", points: 1345, trend: "up", matches: 28, winRate: 76, location: "Portland" },
];

export default function FullRankingsDemo() {
  const [selectedDivision, setSelectedDivision] = useState("doubles-19");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Passport
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Complete Rankings & Leaderboards</h1>
          <p className="text-muted-foreground">Comprehensive player rankings across all divisions</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Division</label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles-19">Singles 19+</SelectItem>
                  <SelectItem value="doubles-19">Doubles 19+ ⭐</SelectItem>
                  <SelectItem value="mixed-19">Mixed 19+</SelectItem>
                  <SelectItem value="singles-open">Singles Open</SelectItem>
                  <SelectItem value="doubles-open">Doubles Open</SelectItem>
                  <SelectItem value="mixed-open">Mixed Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="nyc">New York City</SelectItem>
                  <SelectItem value="la">Los Angeles</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="seattle">Seattle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Player</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Division Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                Doubles 19+ Division Leaderboard
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Rankings updated every match • Last updated: 2 hours ago
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">247</div>
                <div className="text-muted-foreground">Total Players</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">1,834</div>
                <div className="text-muted-foreground">Matches Played</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">#8</div>
                <div className="text-muted-foreground">Your Rank</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboardData.map((player) => (
              <div 
                key={player.rank} 
                className={`p-4 rounded-lg border transition-colors ${
                  player.isCurrentUser 
                    ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                  {/* Rank & Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      player.rank <= 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {player.rank <= 3 && <Trophy className="h-4 w-4" />}
                      {player.rank > 3 && `#${player.rank}`}
                    </div>
                    <div>
                      <div className={`font-medium ${player.isCurrentUser ? "text-blue-700" : ""}`}>
                        {player.name}
                        {player.isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {player.location}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <div className="font-semibold text-lg">{player.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>

                  {/* Trend */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {player.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {player.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {player.trend === "same" && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                      <span className={`text-sm font-medium ${
                        player.trend === "up" ? "text-green-600" : 
                        player.trend === "down" ? "text-red-600" : "text-gray-600"
                      }`}>
                        {player.trend === "up" ? "↗" : player.trend === "down" ? "↘" : "─"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Trend</div>
                  </div>

                  {/* Matches */}
                  <div className="text-center">
                    <div className="font-semibold">{player.matches}</div>
                    <div className="text-xs text-muted-foreground">Matches</div>
                  </div>

                  {/* Win Rate */}
                  <div className="text-center">
                    <div className="font-semibold">{player.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>

                  {/* Actions */}
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Rankings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="font-semibold text-lg">Top 10%</div>
            <div className="text-sm text-muted-foreground">Your Division Standing</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="font-semibold text-lg">+23 Points</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="font-semibold text-lg">3 Matches</div>
            <div className="text-sm text-muted-foreground">Until Next Rank</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}