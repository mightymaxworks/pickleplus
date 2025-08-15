import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Trophy, TrendingUp, Star, Target, Zap, Eye, EyeOff, Shield } from "lucide-react";
import { 
  MatchScoreCard, 
  MatchScoreDisplay, 
  PicklePointsBreakdown 
} from "@/components/match";

// Sample data for demonstration
const sampleMatches = [
  {
    id: 1,
    matchDate: "2025-08-13",
    matchType: 'tournament' as const,
    formatType: 'singles' as const,
    scorePlayerOne: "2",
    scorePlayerTwo: "1",
    winnerId: 1,
    location: "Tournament Court A",
    notes: "[Game Scores: 11-8, 11-6, 9-11]",
    playerOne: {
      id: 1,
      username: "ace_player",
      fullName: "Alex Chen",
      picklePoints: 1250,
      ageGroup: "30-39",
      gender: "male",
      level: "advanced"
    },
    playerTwo: {
      id: 2,
      username: "power_serve",
      fullName: "Maria Rodriguez",
      picklePoints: 980,
      ageGroup: "under-30",
      gender: "female",
      level: "intermediate"
    }
  },
  {
    id: 2,
    matchDate: "2025-08-13",
    matchType: 'casual' as const,
    formatType: 'doubles' as const,
    scorePlayerOne: "1",
    scorePlayerTwo: "2",
    winnerId: 2,
    location: "Community Center",
    notes: "[Game Scores: 11-9, 8-11, 7-11]",
    playerOne: {
      id: 3,
      username: "net_ninja",
      fullName: "David Kim",
      picklePoints: 750,
      ageGroup: "40-49",
      gender: "male",
      level: "intermediate"
    },
    playerTwo: {
      id: 4,
      username: "baseline_boss",
      fullName: "Sarah Johnson",
      picklePoints: 1100,
      ageGroup: "30-39",
      gender: "female",
      level: "advanced"
    },
    playerOnePartner: {
      id: 5,
      username: "doubles_pro",
      fullName: "Mike Wilson",
      picklePoints: 820,
      ageGroup: "50-59",
      gender: "male",
      level: "intermediate"
    },
    playerTwoPartner: {
      id: 6,
      username: "court_queen",
      fullName: "Lisa Zhang",
      picklePoints: 1300,
      ageGroup: "under-30",
      gender: "female",
      level: "expert"
    }
  }
];

export default function MatchScoreDemo() {
  const [selectedMatch, setSelectedMatch] = useState(sampleMatches[0]);
  const [showPointsBreakdown, setShowPointsBreakdown] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [playerFriendlyMode, setPlayerFriendlyMode] = useState(false);

  // Calculate Ranking Points (Competitive System)
  const calculateRankingPoints = (playerId: number, isWinner: boolean) => {
    const basePoints = isWinner ? 3 : 1;
    const tournamentMultiplier = selectedMatch.matchType === 'tournament' ? 2.0 : 1.0;
    // Age/Gender multipliers would be calculated based on player data in real implementation
    const ageMultiplier = 1.2; // Example for demo
    const genderMultiplier = 1.0; // Example for demo
    
    const total = Math.round(basePoints * tournamentMultiplier * ageMultiplier * genderMultiplier);
    
    return {
      basePoints,
      tournamentMultiplier,
      ageMultiplier,
      genderMultiplier,
      total,
      reason: `${isWinner ? 'Win' : 'Loss'} in ${selectedMatch.matchType} ${selectedMatch.formatType}`
    };
  };

  // Calculate Pickle Points (Gamification System)
  const calculatePicklePoints = (rankingPoints: number, isWinner: boolean) => {
    const conversionRate = 10; // 10x conversion rate per algorithm documentation
    const picklePointsFromMatch = Math.ceil(rankingPoints * conversionRate);
    const bonusPicklePoints = isWinner ? 2 : 0; // Example bonus for winning
    const totalPicklePoints = picklePointsFromMatch + bonusPicklePoints;
    
    return {
      rankingPointsEarned: rankingPoints,
      conversionRate,
      picklePointsFromMatch,
      bonusPicklePoints,
      totalPicklePoints,
      reason: `Converted from ${rankingPoints} ranking points + bonuses`
    };
  };

  // Player-friendly simplified calculation (hides algorithm details)
  const getSimplifiedPlayerResults = (playerId: number, isWinner: boolean) => {
    // Simple display logic - don't reveal exact multipliers
    let performanceLevel = isWinner ? "Excellent" : "Good";
    let rankingProgress = isWinner ? 6 : 2; // Simplified display points
    let rewardsEarned = Math.ceil(rankingProgress * 1.5);
    
    if (selectedMatch.matchType === 'tournament') {
      performanceLevel = isWinner ? "Outstanding" : "Solid";
      rankingProgress *= 2;
      rewardsEarned *= 2;
    }
    
    const bonusIndicators = [];
    if (selectedMatch.matchType === 'tournament') bonusIndicators.push('Tournament Bonus');
    if (selectedMatch.formatType === 'doubles') bonusIndicators.push('Teamwork XP');
    
    const player = playerId === selectedMatch.playerOne.id ? selectedMatch.playerOne : selectedMatch.playerTwo;
    const currentRanking = player.picklePoints || 0;
    const currentRewards = player.picklePoints || 0;
    
    return {
      performanceLevel,
      rankingProgress,
      rewardsEarned,
      bonusIndicators,
      currentRanking,
      currentRewards,
      newRanking: currentRanking + rankingProgress,
      newRewards: currentRewards + rewardsEarned,
      motivationalMessage: isWinner 
        ? "Outstanding performance! Keep building that momentum! 🏆"
        : "Great effort! Every match builds experience and skills! 💪"
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">DUPR-Style Score Display Components</h1>
        <p className="text-gray-600">Comprehensive match scoring with points allocation visualization</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMatch.id === 1 ? "default" : "outline"}
              onClick={() => setSelectedMatch(sampleMatches[0])}
            >
              Tournament Singles
            </Button>
            <Button
              variant={selectedMatch.id === 2 ? "default" : "outline"}
              onClick={() => setSelectedMatch(sampleMatches[1])}
            >
              Casual Doubles
            </Button>
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPointsBreakdown}
                onChange={(e) => setShowPointsBreakdown(e.target.checked)}
                className="rounded"
              />
              <span>Show Points Breakdown</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="rounded"
              />
              <span>Compact Mode</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={playerFriendlyMode}
                onChange={(e) => setPlayerFriendlyMode(e.target.checked)}
                className="rounded"
              />
              <div className="flex items-center space-x-1">
                {playerFriendlyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>Player-Friendly Mode</span>
                <Shield className="h-3 w-3 text-blue-500" />
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Full Match Score Card */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Complete Match Score Card</h2>
        <MatchScoreCard 
          match={selectedMatch}
          showPointsBreakdown={showPointsBreakdown}
          compact={compactMode}
        />
      </div>

      <Separator />

      {/* Standalone Score Display */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Standalone Score Display</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Small Size</h3>
            <MatchScoreDisplay
              team1Score={parseInt(selectedMatch.scorePlayerOne)}
              team2Score={parseInt(selectedMatch.scorePlayerTwo)}
              team1Players={[selectedMatch.playerOne.fullName || selectedMatch.playerOne.username]}
              team2Players={[selectedMatch.playerTwo.fullName || selectedMatch.playerTwo.username]}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              size="sm"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Medium Size</h3>
            <MatchScoreDisplay
              team1Score={parseInt(selectedMatch.scorePlayerOne)}
              team2Score={parseInt(selectedMatch.scorePlayerTwo)}
              team1Players={[selectedMatch.playerOne.fullName || selectedMatch.playerOne.username]}
              team2Players={[selectedMatch.playerTwo.fullName || selectedMatch.playerTwo.username]}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              size="md"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Large Size</h3>
            <MatchScoreDisplay
              team1Score={parseInt(selectedMatch.scorePlayerOne)}
              team2Score={parseInt(selectedMatch.scorePlayerTwo)}
              team1Players={[selectedMatch.playerOne.fullName || selectedMatch.playerOne.username]}
              team2Players={[selectedMatch.playerTwo.fullName || selectedMatch.playerTwo.username]}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              size="lg"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Individual Points Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            3. Individual {playerFriendlyMode ? 'Performance Results' : 'Pickle Points Breakdown'}
          </h2>
          {playerFriendlyMode && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Algorithm Protected
            </Badge>
          )}
        </div>
        {playerFriendlyMode ? (
          /* Player-Friendly Results */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player 1 - Simplified */}
            {(() => {
              const results = getSimplifiedPlayerResults(selectedMatch.playerOne.id, selectedMatch.winnerId === selectedMatch.playerOne.id);
              const isWinner = selectedMatch.winnerId === selectedMatch.playerOne.id;
              
              return (
                <Card className="w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isWinner ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Target className="h-5 w-5 text-blue-500" />
                        )}
                        <span>{selectedMatch.playerOne.fullName || selectedMatch.playerOne.username}</span>
                      </div>
                      <Badge className={
                        results.performanceLevel === "Outstanding" ? "bg-purple-100 text-purple-800" :
                        results.performanceLevel === "Excellent" ? "bg-green-100 text-green-800" :
                        results.performanceLevel === "Solid" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      }>
                        {results.performanceLevel}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Points Earned */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Progress</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">+{results.rankingProgress}</div>
                        <div className="text-xs text-blue-700">{results.currentRanking} → {results.newRanking}</div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Rewards</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">+{results.rewardsEarned}</div>
                        <div className="text-xs text-green-700">{results.currentRewards} → {results.newRewards}</div>
                      </div>
                    </div>
                    
                    {/* Bonuses */}
                    {results.bonusIndicators.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span>Bonuses Applied</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {results.bonusIndicators.map((bonus, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {bonus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Progress Visualization */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Match Impact</span>
                          <span className="text-blue-600">+{((results.rankingProgress / Math.max(results.currentRanking, 1)) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min((results.rankingProgress / 10) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    
                    {/* Motivational Message */}
                    <div className={`p-3 rounded text-sm font-medium text-center ${
                      isWinner ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {results.motivationalMessage}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            
            {/* Player 2 - Simplified */}
            {(() => {
              const results = getSimplifiedPlayerResults(selectedMatch.playerTwo.id, selectedMatch.winnerId === selectedMatch.playerTwo.id);
              const isWinner = selectedMatch.winnerId === selectedMatch.playerTwo.id;
              
              return (
                <Card className="w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isWinner ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Target className="h-5 w-5 text-blue-500" />
                        )}
                        <span>{selectedMatch.playerTwo.fullName || selectedMatch.playerTwo.username}</span>
                      </div>
                      <Badge className={
                        results.performanceLevel === "Outstanding" ? "bg-purple-100 text-purple-800" :
                        results.performanceLevel === "Excellent" ? "bg-green-100 text-green-800" :
                        results.performanceLevel === "Solid" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      }>
                        {results.performanceLevel}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Points Earned */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Progress</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">+{results.rankingProgress}</div>
                        <div className="text-xs text-blue-700">{results.currentRanking} → {results.newRanking}</div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Rewards</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">+{results.rewardsEarned}</div>
                        <div className="text-xs text-green-700">{results.currentRewards} → {results.newRewards}</div>
                      </div>
                    </div>
                    
                    {/* Bonuses */}
                    {results.bonusIndicators.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span>Bonuses Applied</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {results.bonusIndicators.map((bonus, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {bonus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Progress Visualization */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Match Impact</span>
                          <span className="text-blue-600">+{((results.rankingProgress / Math.max(results.currentRanking, 1)) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min((results.rankingProgress / 10) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    
                    {/* Motivational Message */}
                    <div className={`p-3 rounded text-sm font-medium text-center ${
                      isWinner ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {results.motivationalMessage}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        ) : (
          /* Technical Breakdown (original) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player 1 */}
            <PicklePointsBreakdown
              player={selectedMatch.playerOne}
              calculation={calculatePicklePoints(
                calculateRankingPoints(selectedMatch.playerOne.id, selectedMatch.winnerId === selectedMatch.playerOne.id).total,
                selectedMatch.winnerId === selectedMatch.playerOne.id
              )}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              isWinner={selectedMatch.winnerId === selectedMatch.playerOne.id}
              previousPoints={selectedMatch.playerOne.picklePoints || 0}
              detailed={true}
            />
            
            {/* Player 2 */}
            <PicklePointsBreakdown
              player={selectedMatch.playerTwo}
              calculation={calculatePicklePoints(
                calculateRankingPoints(selectedMatch.playerTwo.id, selectedMatch.winnerId === selectedMatch.playerTwo.id).total,
                selectedMatch.winnerId === selectedMatch.playerTwo.id
              )}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              isWinner={selectedMatch.winnerId === selectedMatch.playerTwo.id}
              previousPoints={selectedMatch.playerTwo.picklePoints || 0}
              detailed={true}
            />
          </div>
        )}
        
        {/* Compact versions for partners if doubles */}
        {selectedMatch.formatType === 'doubles' && selectedMatch.playerOnePartner && selectedMatch.playerTwoPartner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <PicklePointsBreakdown
              player={selectedMatch.playerOnePartner}
              calculation={calculatePicklePoints(
                calculateRankingPoints(selectedMatch.playerOnePartner.id, selectedMatch.winnerId === selectedMatch.playerOne.id).total,
                selectedMatch.winnerId === selectedMatch.playerOne.id
              )}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              isWinner={selectedMatch.winnerId === selectedMatch.playerOne.id}
              previousPoints={selectedMatch.playerOnePartner.picklePoints || 0}
              detailed={false}
            />
            
            <PicklePointsBreakdown
              player={selectedMatch.playerTwoPartner}
              calculation={calculatePicklePoints(
                calculateRankingPoints(selectedMatch.playerTwoPartner.id, selectedMatch.winnerId === selectedMatch.playerTwo.id).total,
                selectedMatch.winnerId === selectedMatch.playerTwo.id
              )}
              matchType={selectedMatch.matchType}
              formatType={selectedMatch.formatType}
              isWinner={selectedMatch.winnerId === selectedMatch.playerTwo.id}
              previousPoints={selectedMatch.playerTwoPartner.picklePoints || 0}
              detailed={false}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Dual System Algorithm Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Dual Points System Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Ranking Points (Competitive)</h4>
              <div className="text-sm space-y-1">
                <div><strong>Base:</strong> Win = 3 pts, Loss = 1 pt</div>
                <div><strong>Tournament:</strong> ×2.0 multiplier</div>
                <div><strong>Age Group:</strong> ×1.2-1.6 multiplier</div>
                <div><strong>Gender Balance:</strong> ×1.15 multiplier</div>
                <div><strong>Decay:</strong> 2% weekly with protection</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Pickle Points (Gamification)</h4>
              <div className="text-sm space-y-1">
                <div><strong>Conversion:</strong> Ranking points × 1.5</div>
                <div><strong>Bonuses:</strong> Training, community activities</div>
                <div><strong>Usage:</strong> Equipment discounts, premium access</div>
                <div><strong>Decay:</strong> No decay (maintains value)</div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="mt-2">
            Based on PICKLE_PLUS_ALGORITHM_DOCUMENT.md - Dual System Design
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}