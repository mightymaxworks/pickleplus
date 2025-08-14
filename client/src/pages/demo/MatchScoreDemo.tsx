import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

  const calculatePointsForDemo = (playerId: number, isWinner: boolean) => {
    const basePoints = isWinner ? 3 : 1;
    const tournamentBonus = selectedMatch.matchType === 'tournament' ? 2 : 0;
    const doublesBonus = selectedMatch.formatType === 'doubles' ? 0.5 : 0;
    
    return {
      basePoints,
      tournamentBonus,
      doublesBonus,
      total: basePoints + tournamentBonus + doublesBonus,
      reason: `${isWinner ? 'Win' : 'Loss'} in ${selectedMatch.matchType} ${selectedMatch.formatType}`
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
        <h2 className="text-2xl font-semibold">3. Individual Points Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player 1 */}
          <PicklePointsBreakdown
            player={selectedMatch.playerOne}
            calculation={calculatePointsForDemo(
              selectedMatch.playerOne.id, 
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
            calculation={calculatePointsForDemo(
              selectedMatch.playerTwo.id, 
              selectedMatch.winnerId === selectedMatch.playerTwo.id
            )}
            matchType={selectedMatch.matchType}
            formatType={selectedMatch.formatType}
            isWinner={selectedMatch.winnerId === selectedMatch.playerTwo.id}
            previousPoints={selectedMatch.playerTwo.picklePoints || 0}
            detailed={true}
          />
        </div>
        
        {/* Compact versions for partners if doubles */}
        {selectedMatch.formatType === 'doubles' && selectedMatch.playerOnePartner && selectedMatch.playerTwoPartner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <PicklePointsBreakdown
              player={selectedMatch.playerOnePartner}
              calculation={calculatePointsForDemo(
                selectedMatch.playerOnePartner.id, 
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
              calculation={calculatePointsForDemo(
                selectedMatch.playerTwoPartner.id, 
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

      {/* Algorithm Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Points Algorithm Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <div><strong>Base Points:</strong> Win = 3 points, Loss = 1 point</div>
            <div><strong>Tournament Bonus:</strong> +2 points for tournament matches</div>
            <div><strong>Doubles Bonus:</strong> +0.5 points for doubles matches</div>
            <div><strong>Age Group:</strong> Additional bonuses based on age category</div>
            <div><strong>Streak Bonus:</strong> Additional points for consecutive wins</div>
          </div>
          <Badge variant="outline" className="mt-2">
            Based on PICKLE_PLUS_ALGORITHM_DOCUMENT.md
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}