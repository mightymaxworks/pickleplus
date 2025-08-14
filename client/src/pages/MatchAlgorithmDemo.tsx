import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Calculator, 
  Sparkles, 
  Users, 
  Target,
  TrendingUp,
  Award,
  Info
} from "lucide-react";
import { MatchScoreCard } from "@/components/match/MatchScoreCard";
import StreamlinedMatchRecorderDemo from "@/components/match/StreamlinedMatchRecorderDemo";

// Test match data based on ALGORITHM_TEST_CASES.md
const TEST_MATCHES = [
  {
    id: 1,
    title: "Case 1: Basic Singles Match",
    description: "19+ Male vs 19+ Male, Casual Singles, Traditional Scoring",
    match: {
      id: 1,
      matchDate: "2025-08-14",
      matchType: "casual" as const,
      formatType: "singles" as const,
      scorePlayerOne: "2", // Games won
      scorePlayerTwo: "1", // Games won
      winnerId: 1,
      location: "Local Court",
      notes: "[Game Scores: 11-8, 9-11, 11-6]",
      playerOne: {
        id: 1,
        username: "alex_m",
        fullName: "Alex Martinez",
        picklePoints: 850,
        rankingPoints: 1200,
        ageGroup: "19+",
        gender: "M",
        level: "4.0",
        rankings: {
          overall: 45,
          singles: 23,
          ageGroup: 12
        }
      },
      playerTwo: {
        id: 2,
        username: "jake_w",
        fullName: "Jake Wilson",
        picklePoints: 920,
        rankingPoints: 1180,
        ageGroup: "19+",
        gender: "M",
        level: "4.0",
        rankings: {
          overall: 52,
          singles: 28,
          ageGroup: 15
        }
      },
      pointsAllocated: [
        {
          playerId: 1,
          points: 3,
          category: "Ranking Points",
          reason: "Win (3 base × 1.0 age × 1.0 gender × 1.0 tournament)"
        },
        {
          playerId: 2,
          points: 1,
          category: "Ranking Points", 
          reason: "Loss (1 base × 1.0 age × 1.0 gender × 1.0 tournament)"
        }
      ]
    }
  },
  {
    id: 2,
    title: "Case 2: Cross-Gender with Bonus",
    description: "Development Female vs Male, Gender Balance Bonus Applied",
    match: {
      id: 2,
      matchDate: "2025-08-14",
      matchType: "tournament" as const,
      formatType: "singles" as const,
      scorePlayerOne: "2",
      scorePlayerTwo: "0",
      winnerId: 3,
      location: "Tournament Center",
      notes: "[Game Scores: 11-7, 11-9]",
      playerOne: {
        id: 3,
        username: "emma_r",
        fullName: "Emma Rodriguez",
        picklePoints: 680,
        rankingPoints: 800,
        ageGroup: "19+",
        gender: "F",
        level: "3.5",
        rankings: {
          overall: 78,
          singles: 42,
          ageGroup: 25
        }
      },
      playerTwo: {
        id: 4,
        username: "tom_a",
        fullName: "Tom Anderson",
        picklePoints: 750,
        rankingPoints: 950,
        ageGroup: "19+",
        gender: "M",
        level: "3.8",
        rankings: {
          overall: 65,
          singles: 35,
          ageGroup: 20
        }
      },
      pointsAllocated: [
        {
          playerId: 3,
          points: 7, // 3 × 2.0 tournament × 1.15 gender bonus
          category: "Ranking Points",
          reason: "Win (3 base × 2.0 tournament × 1.15 gender bonus)"
        },
        {
          playerId: 4,
          points: 2, // 1 × 2.0 tournament
          category: "Ranking Points",
          reason: "Loss (1 base × 2.0 tournament × 1.0 no bonus)"
        }
      ]
    }
  },
  {
    id: 3,
    title: "Case 3: Senior Age Group Enhancement",
    description: "60+ Player vs 50+ Player, Age Multipliers Applied",
    match: {
      id: 3,
      matchDate: "2025-08-14",
      matchType: "casual" as const,
      formatType: "singles" as const,
      scorePlayerOne: "1",
      scorePlayerTwo: "2",
      winnerId: 6,
      location: "Senior Center",
      notes: "[Game Scores: 11-9, 8-11, 9-11]",
      playerOne: {
        id: 5,
        username: "frank_s",
        fullName: "Frank Smith",
        picklePoints: 1200,
        rankingPoints: 1600,
        ageGroup: "60+",
        gender: "M",
        level: "4.5",
        rankings: {
          overall: 15,
          singles: 8,
          ageGroup: 3
        }
      },
      playerTwo: {
        id: 6,
        username: "diane_l",
        fullName: "Diane Lewis",
        picklePoints: 980,
        rankingPoints: 1350,
        ageGroup: "50+",
        gender: "F",
        level: "4.2",
        rankings: {
          overall: 28,
          singles: 15,
          ageGroup: 7
        }
      },
      pointsAllocated: [
        {
          playerId: 5,
          points: 2, // 1 × 1.5 age multiplier
          category: "Ranking Points",
          reason: "Loss (1 base × 1.5 age multiplier)"
        },
        {
          playerId: 6,
          points: 4, // 3 × 1.3 age multiplier
          category: "Ranking Points",
          reason: "Win (3 base × 1.3 age multiplier)"
        }
      ]
    }
  },
  {
    id: 4,
    title: "Case 4: Complex Doubles Tournament",
    description: "Elite Mixed Doubles, Maximum Complexity Scenario",
    match: {
      id: 4,
      matchDate: "2025-08-14",
      matchType: "tournament" as const,
      formatType: "doubles" as const,
      scorePlayerOne: "2",
      scorePlayerTwo: "1",
      winnerId: 7,
      location: "Championship Court",
      notes: "[Game Scores: 11-6, 9-11, 11-8]",
      playerOne: {
        id: 7,
        username: "sarah_c",
        fullName: "Sarah Chen",
        picklePoints: 1420,
        rankingPoints: 2100,
        ageGroup: "35+",
        gender: "F",
        level: "5.0",
        rankings: {
          overall: 8,
          doubles: 4,
          ageGroup: 2
        }
      },
      playerOnePartner: {
        id: 8,
        username: "mike_j",
        fullName: "Mike Johnson",
        picklePoints: 1380,
        rankingPoints: 2050,
        ageGroup: "35+",
        gender: "M",
        level: "5.0",
        rankings: {
          overall: 12,
          doubles: 6,
          ageGroup: 4
        }
      },
      playerTwo: {
        id: 9,
        username: "lisa_w",
        fullName: "Lisa Wang",
        picklePoints: 1350,
        rankingPoints: 1980,
        ageGroup: "35+",
        gender: "F",
        level: "4.8",
        rankings: {
          overall: 18,
          doubles: 9,
          ageGroup: 6
        }
      },
      playerTwoPartner: {
        id: 10,
        username: "mark_d",
        fullName: "Mark Davis",
        picklePoints: 1290,
        rankingPoints: 1850,
        ageGroup: "35+",
        gender: "M",
        level: "4.7",
        rankings: {
          overall: 25,
          doubles: 12,
          ageGroup: 8
        }
      },
      pointsAllocated: [
        {
          playerId: 7,
          points: 7, // 3 × 2.0 tournament × 1.2 age
          category: "Ranking Points",
          reason: "Win (3 base × 2.0 tournament × 1.2 age)"
        },
        {
          playerId: 8,
          points: 7, // 3 × 2.0 tournament × 1.2 age
          category: "Ranking Points",
          reason: "Win (3 base × 2.0 tournament × 1.2 age)"
        },
        {
          playerId: 9,
          points: 2, // 1 × 2.0 tournament × 1.2 age
          category: "Ranking Points",
          reason: "Loss (1 base × 2.0 tournament × 1.2 age)"
        },
        {
          playerId: 10,
          points: 2, // 1 × 2.0 tournament × 1.2 age
          category: "Ranking Points",
          reason: "Loss (1 base × 2.0 tournament × 1.2 age)"
        }
      ]
    }
  }
];

export default function MatchAlgorithmDemo() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getHighestRanking = (player: any) => {
    if (!player.rankings) return null;
    
    const rankings = player.rankings;
    const validRankings = Object.entries(rankings)
      .filter(([_, value]) => typeof value === 'number' && value > 0)
      .map(([category, value]) => ({ category, value: value as number }));
    
    if (validRankings.length === 0) return null;
    
    // Find the best (lowest number) ranking
    const bestRanking = validRankings.reduce((best, current) => 
      current.value < best.value ? current : best
    );
    
    const categoryLabels: Record<string, string> = {
      overall: 'Overall',
      singles: 'Singles',
      doubles: 'Doubles',
      ageGroup: `${player.ageGroup} Age Group`
    };
    
    return {
      value: bestRanking.value,
      category: categoryLabels[bestRanking.category] || bestRanking.category
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Calculator className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold">Match Algorithm Demo</h1>
          <Badge variant="secondary">Production Algorithm</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive demonstration of the Pickle+ ranking algorithm with real test cases 
          from ALGORITHM_TEST_CASES.md and PICKLE_PLUS_ALGORITHM_DOCUMENT.md
        </p>
      </div>

      {/* Algorithm Summary */}
      <Card className="mb-8 border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Sparkles className="h-5 w-5" />
            Algorithm Overview - System B Standardized
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-800 mb-2">Base Point Structure</h4>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• <strong>Win:</strong> 3 points (conservative scoring)</li>
                <li>• <strong>Loss:</strong> 1 point (participation reward)</li>
                <li>• <strong>System:</strong> No doubles bonuses, no streak bonuses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-800 mb-2">Multiplier Systems</h4>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• <strong>Age Groups:</strong> 19+ (1.0x), 35+ (1.2x), 50+ (1.3x), 60+ (1.5x), 70+ (1.6x)</li>
                <li>• <strong>Tournament:</strong> 2.0x multiplier for competitive play</li>
                <li>• <strong>Gender Balance:</strong> 1.15x for women &lt;1000 points cross-gender</li>
              </ul>
            </div>
          </div>
          <div className="bg-white/70 p-3 rounded border border-emerald-300">
            <p className="text-sm text-emerald-800">
              <strong>Elite Threshold:</strong> Players ≥1000 ranking points get no gender bonuses. 
              Development players (&lt;1000 points) receive appropriate bonuses for cross-gender matches.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Algorithm Test Cases</TabsTrigger>
          <TabsTrigger value="recorder">Match Recorder Demo</TabsTrigger>
          <TabsTrigger value="documentation">Technical Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {TEST_MATCHES.map((testCase, index) => (
              <Card key={testCase.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{testCase.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {testCase.description}
                      </p>
                    </div>
                    <Badge variant="outline">Test Case {index + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <MatchScoreCard 
                    match={testCase.match} 
                    showPointsBreakdown={true}
                    className="border-0 rounded-none"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recorder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Interactive Match Recorder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test the match recording system with algorithm integration
              </p>
            </CardHeader>
            <CardContent>
              <StreamlinedMatchRecorderDemo userRole="player" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Ranking Points System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Base Formula</h4>
                  <code className="text-xs bg-slate-100 p-2 rounded block">
                    Final Points = Base Points × Age Multiplier × Tournament Multiplier × Gender Multiplier
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Age Multipliers</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>19+ (Standard)</span>
                      <Badge variant="outline">1.0x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>35+ (Career Professionals)</span>
                      <Badge variant="outline">1.2x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>50+ (Masters)</span>
                      <Badge variant="outline">1.3x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>60+ (Seniors)</span>
                      <Badge variant="outline">1.5x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>70+ (Super Seniors)</span>
                      <Badge variant="outline">1.6x</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Gender Balance System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Elite Threshold (1000+ Points)</h4>
                  <p className="text-sm text-muted-foreground">
                    Elite players receive no gender bonuses to maintain competitive integrity
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Development Players (&lt;1000 Points)</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Women vs Men</span>
                      <Badge variant="secondary">1.15x bonus</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mixed Doubles Teams</span>
                      <Badge variant="secondary">1.075x bonus</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded border">
                  <p className="text-xs text-purple-800">
                    <strong>Note:</strong> Points are allocated to respective singles/age group rankings. 
                    No separate cross-gender rankings are created.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Match Card Display Logic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ranking Display Priority</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The system shows each player's highest (best) ranking with emerald badges:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium">Display Format</h5>
                      <code className="text-xs bg-slate-100 p-2 rounded block">
                        #{`{value}`} {`{category}`}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Example: "#23 Singles" or "#12 35+ Age Group"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">Priority Order</h5>
                      <ol className="text-sm space-y-1">
                        <li>1. Overall ranking</li>
                        <li>2. Format-specific (Singles/Doubles)</li>
                        <li>3. Age group ranking</li>
                        <li>4. Other categories</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}