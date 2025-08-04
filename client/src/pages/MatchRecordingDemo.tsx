import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, User, Clock, MapPin, Award, TrendingUp, Target, Zap } from "lucide-react";

type MatchType = 'singles' | 'doubles';
type EventType = 'recreational' | 'competitive' | 'tournament';

const PICKLE_POINTS_LOGIC = {
  recreational: { singles: { win: 50, loss: 20 }, doubles: { win: 45, loss: 20 } },
  competitive: { singles: { win: 75, loss: 25 }, doubles: { win: 70, loss: 25 } },
  tournament: { singles: { win: 150, loss: 30 }, doubles: { win: 140, loss: 30 } }
};

const RANKING_POINTS_LOGIC = {
  recreational: { singles: { win: 10, loss: 2 }, doubles: { win: 8, loss: 2 } },
  competitive: { singles: { win: 25, loss: 5 }, doubles: { win: 20, loss: 5 } },
  tournament: { singles: { win: 50, loss: 10 }, doubles: { win: 40, loss: 10 } }
};

const AGE_MULTIPLIERS = {
  '18-29': 1.0,
  '30-39': 1.1,
  '40-49': 1.2,
  '50-59': 1.3,
  '60+': 1.5
};

export default function MatchRecordingDemo() {
  const [matchType, setMatchType] = useState<MatchType>('singles');
  const [eventType, setEventType] = useState<EventType>('recreational');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('30-39');
  const [team1Score, setTeam1Score] = useState([11, 8, 11]);
  const [team2Score, setTeam2Score] = useState([9, 11, 6]);
  const [winner, setWinner] = useState<'team1' | 'team2'>('team1');

  const calculatePoints = () => {
    const basePicklePoints = PICKLE_POINTS_LOGIC[eventType][matchType];
    const baseRankingPoints = RANKING_POINTS_LOGIC[eventType][matchType];
    const ageMultiplier = AGE_MULTIPLIERS[selectedAgeGroup as keyof typeof AGE_MULTIPLIERS];

    const winnerPicklePoints = Math.round(basePicklePoints.win * ageMultiplier);
    const loserPicklePoints = Math.round(basePicklePoints.loss * ageMultiplier);
    const winnerRankingPoints = Math.round(baseRankingPoints.win * ageMultiplier);
    const loserRankingPoints = Math.round(baseRankingPoints.loss * ageMultiplier);

    return {
      winnerPicklePoints,
      loserPicklePoints,
      winnerRankingPoints,
      loserRankingPoints
    };
  };

  const points = calculatePoints();

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Match Recording System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Modern match recording with automatic ranking points calculation based on age groups and event types
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="recording" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recording">Match Recording</TabsTrigger>
            <TabsTrigger value="ranking">Ranking System</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          {/* Match Recording Tab */}
          <TabsContent value="recording" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Match Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Match Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Match Type */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Match Type</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={matchType === 'singles' ? 'default' : 'outline'}
                        onClick={() => setMatchType('singles')}
                        className="flex-1"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Singles
                      </Button>
                      <Button
                        variant={matchType === 'doubles' ? 'default' : 'outline'}
                        onClick={() => setMatchType('doubles')}
                        className="flex-1"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Doubles
                      </Button>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Event Type</Label>
                    <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recreational">Recreational</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age Group */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Age Group (for multiplier)</Label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-29">18-29 (1.0x)</SelectItem>
                        <SelectItem value="30-39">30-39 (1.1x)</SelectItem>
                        <SelectItem value="40-49">40-49 (1.2x)</SelectItem>
                        <SelectItem value="50-59">50-59 (1.3x)</SelectItem>
                        <SelectItem value="60+">60+ (1.5x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Players */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Team 1</Label>
                      <Input placeholder="Player 1" defaultValue="Alex Jordan" />
                      {matchType === 'doubles' && (
                        <Input placeholder="Player 2" className="mt-2" defaultValue="Sarah Chen" />
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Team 2</Label>
                      <Input placeholder="Player 3" defaultValue="Mike Wilson" />
                      {matchType === 'doubles' && (
                        <Input placeholder="Player 4" className="mt-2" defaultValue="Lisa Park" />
                      )}
                    </div>
                  </div>

                  {/* Score Entry */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Match Score</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Team 1 Score</Label>
                        <div className="flex gap-1 mt-1">
                          {team1Score.map((score, i) => (
                            <Input
                              key={i}
                              type="number"
                              value={score}
                              onChange={(e) => {
                                const newScore = [...team1Score];
                                newScore[i] = parseInt(e.target.value) || 0;
                                setTeam1Score(newScore);
                              }}
                              className="w-16 text-center"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Team 2 Score</Label>
                        <div className="flex gap-1 mt-1">
                          {team2Score.map((score, i) => (
                            <Input
                              key={i}
                              type="number"
                              value={score}
                              onChange={(e) => {
                                const newScore = [...team2Score];
                                newScore[i] = parseInt(e.target.value) || 0;
                                setTeam2Score(newScore);
                              }}
                              className="w-16 text-center"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winner Selection */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Winner</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={winner === 'team1' ? 'default' : 'outline'}
                        onClick={() => setWinner('team1')}
                        className="flex-1"
                      >
                        Team 1
                      </Button>
                      <Button
                        variant={winner === 'team2' ? 'default' : 'outline'}
                        onClick={() => setWinner('team2')}
                        className="flex-1"
                      >
                        Team 2
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Record Match
                  </Button>
                </CardContent>
              </Card>

              {/* Points Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Automatic Points Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Match Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Match Summary</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Type:</span> {matchType} {eventType}</p>
                      <p><span className="font-medium">Age Group:</span> {selectedAgeGroup} (×{AGE_MULTIPLIERS[selectedAgeGroup as keyof typeof AGE_MULTIPLIERS]})</p>
                      <p><span className="font-medium">Score:</span> {team1Score.join('-')} vs {team2Score.join('-')}</p>
                      <p><span className="font-medium">Winner:</span> Team {winner === 'team1' ? '1' : '2'}</p>
                    </div>
                  </div>

                  {/* Pickle Points */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold">Pickle Points Awarded</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-green-600 font-medium">Winner</p>
                        <p className="text-2xl font-bold text-green-700">+{points.winnerPicklePoints}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-blue-600 font-medium">Loser</p>
                        <p className="text-2xl font-bold text-blue-700">+{points.loserPicklePoints}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ranking Points */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Ranking Points Awarded</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-purple-600 font-medium">Winner</p>
                        <p className="text-2xl font-bold text-purple-700">+{points.winnerRankingPoints}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600 font-medium">Loser</p>
                        <p className="text-2xl font-bold text-gray-700">+{points.loserRankingPoints}</p>
                      </div>
                    </div>
                  </div>

                  {/* Points Logic Explanation */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Points Logic</h5>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>Base {eventType} {matchType}: Win {PICKLE_POINTS_LOGIC[eventType][matchType].win}PP, Loss {PICKLE_POINTS_LOGIC[eventType][matchType].loss}PP</p>
                      <p>Age multiplier ({selectedAgeGroup}): ×{AGE_MULTIPLIERS[selectedAgeGroup as keyof typeof AGE_MULTIPLIERS]}</p>
                      <p>Ranking points follow same logic with different base values</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ranking System Tab */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle>Ranking Points System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(RANKING_POINTS_LOGIC).map(([event, types]) => (
                    <div key={event} className="space-y-4">
                      <h3 className="font-bold capitalize text-lg">{event}</h3>
                      {Object.entries(types).map(([type, points]) => (
                        <div key={type} className="border rounded-lg p-4">
                          <h4 className="font-semibold capitalize mb-2">{type}</h4>
                          <div className="flex justify-between text-sm">
                            <span>Win: <strong>{points.win} pts</strong></span>
                            <span>Loss: <strong>{points.loss} pts</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Rank</th>
                        <th className="text-left p-2">Player</th>
                        <th className="text-left p-2">Ranking Points</th>
                        <th className="text-left p-2">Pickle Points</th>
                        <th className="text-left p-2">Win %</th>
                        <th className="text-left p-2">Age Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: 1, name: 'Alex Jordan', rankingPts: 1247, picklePts: 3420, winPct: 73, age: '30-39' },
                        { rank: 2, name: 'Sarah Chen', rankingPts: 1156, picklePts: 3201, winPct: 68, age: '30-39' },
                        { rank: 3, name: 'Mike Wilson', rankingPts: 1089, picklePts: 2987, winPct: 71, age: '40-49' },
                        { rank: 4, name: 'Lisa Park', rankingPts: 967, picklePts: 2743, winPct: 65, age: '30-39' },
                        { rank: 5, name: 'David Kim', rankingPts: 923, picklePts: 2612, winPct: 62, age: '50-59' },
                      ].map((player) => (
                        <tr key={player.rank} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-bold">#{player.rank}</td>
                          <td className="p-2">{player.name}</td>
                          <td className="p-2 font-semibold text-purple-600">{player.rankingPts}</td>
                          <td className="p-2 font-semibold text-yellow-600">{player.picklePts}</td>
                          <td className="p-2">{player.winPct}%</td>
                          <td className="p-2">
                            <Badge variant="outline">{player.age}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Dashboard Tab */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Admin Results Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Quick Match Entry</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Player 1" />
                          <Input placeholder="Player 2" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="Score 1" type="number" />
                          <Input placeholder="Score 2" type="number" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Event" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rec_singles">Rec Singles</SelectItem>
                              <SelectItem value="comp_doubles">Comp Doubles</SelectItem>
                              <SelectItem value="tournament">Tournament</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full">Record Match</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Recent Matches</h3>
                    <div className="space-y-2">
                      {[
                        { p1: 'Alex J.', p2: 'Mike W.', score: '11-9, 11-7', winner: 'Alex J.' },
                        { p1: 'Sarah C.', p2: 'Lisa P.', score: '11-5, 8-11, 11-6', winner: 'Sarah C.' },
                        { p1: 'David K.', p2: 'Alex J.', score: '9-11, 11-8, 11-9', winner: 'David K.' },
                      ].map((match, i) => (
                        <div key={i} className="bg-white border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{match.p1} vs {match.p2}</span>
                            <Badge variant="outline">{match.score}</Badge>
                          </div>
                          <p className="text-xs text-green-600 mt-1">Winner: {match.winner}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}