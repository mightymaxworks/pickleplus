import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Download, 
  Settings, 
  Eye, 
  Trophy, 
  Users, 
  Play,
  RefreshCw,
  Palette,
  Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

interface LeaderboardEntry {
  id: number;
  displayName: string;
  username: string;
  points: number;
  matchesPlayed: number;
  winRate: number;
  gender: 'male' | 'female';
  age: number;
  division: string;
  ranking: number;
}

interface LeaderboardResponse {
  players: LeaderboardEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function FacilityDisplaysAdminDashboard() {
  const [selectedFormat, setSelectedFormat] = useState('singles');
  const [selectedDivision, setSelectedDivision] = useState('open');
  const [selectedGender, setSelectedGender] = useState('male');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Available options for facility displays
  const formats = [
    { value: 'singles', label: 'Singles' },
    { value: 'doubles', label: 'Doubles' }
  ];

  const divisions = [
    { value: 'open', label: 'Open (19+)' },
    { value: '35+', label: '35+' },
    { value: '50+', label: '50+' },
    { value: '60+', label: '60+' },
    { value: '70+', label: '70+' },
    { value: 'u18', label: 'U18' },
    { value: 'u16', label: 'U16' },
    { value: 'u14', label: 'U14' },
    { value: 'u12', label: 'U12' }
  ];

  const genders = [
    { value: 'male', label: 'Men' },
    { value: 'female', label: 'Women' }
  ];

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    try {
      // Use debug endpoint to show ALL data without production filtering
      const response = await apiRequest('GET', 
        `/api/enhanced-leaderboard/facility-debug?format=${selectedFormat}&division=${selectedDivision}&gender=${selectedGender}`
      );
      const data = await response.json();
      setLeaderboardData(data.players || []);
      setLastUpdated(new Date());
      
      // Log debug info
      console.log(`[FACILITY DISPLAYS] Debug data: ${data.rawUsers} raw users, ${data.withPoints} with points, ${data.finalPlayers} final players`);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Fallback to regular endpoint
      try {
        const response = await apiRequest('GET', 
          `/api/enhanced-leaderboard?format=${selectedFormat}&division=${selectedDivision}&gender=${selectedGender}&limit=50`
        );
        const data: LeaderboardResponse = await response.json();
        setLeaderboardData(data.players);
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate 4K display export (placeholder for now)
  const generate4KDisplay = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement actual 4K canvas export
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation
      
      // Create download link for now
      const blob = new Blob(['4K Display Generated'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFormat}-${selectedDivision}-${selectedGender}-4k-display.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating 4K display:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-fetch data when selections change
  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedFormat, selectedDivision, selectedGender]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Facility Display Generator
                </h1>
                <p className="text-gray-600">
                  Create high-resolution ranking displays for facility screens
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Step 2: Basic Admin Interface ✅
            </Badge>
          </div>
        </motion.div>

        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
            <TabsTrigger value="export">Export & Download</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Display Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Format
                    </label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Age Division
                    </label>
                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map(division => (
                          <SelectItem key={division.value} value={division.value}>
                            {division.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Gender Category
                    </label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map(gender => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={fetchLeaderboardData} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Data Status Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Data Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {leaderboardData.length}
                        </div>
                        <div className="text-sm text-blue-800">Players</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {leaderboardData.filter(p => p.matchesPlayed >= 10).length}
                        </div>
                        <div className="text-sm text-green-800">Ranked</div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Current Selection:</div>
                      <div className="font-medium">
                        {formats.find(f => f.value === selectedFormat)?.label} • {' '}
                        {divisions.find(d => d.value === selectedDivision)?.label} • {' '}
                        {genders.find(g => g.value === selectedGender)?.label}
                      </div>
                    </div>

                    {lastUpdated && (
                      <div className="text-xs text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview - {formats.find(f => f.value === selectedFormat)?.label} Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    Loading ranking data...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-semibold">Rank</th>
                          <th className="text-left p-3 font-semibold">Player</th>
                          <th className="text-left p-3 font-semibold">Points</th>
                          <th className="text-left p-3 font-semibold">Matches</th>
                          <th className="text-left p-3 font-semibold">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.slice(0, 20).map((player, index) => (
                          <tr key={player.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center">
                                {index < 3 && (
                                  <Trophy className={`w-4 h-4 mr-2 ${
                                    index === 0 ? 'text-yellow-500' :
                                    index === 1 ? 'text-gray-400' :
                                    'text-orange-500'
                                  }`} />
                                )}
                                <span className="font-semibold">{player.ranking}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{player.displayName}</div>
                                <div className="text-sm text-gray-500">@{player.username}</div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold">{player.points.toFixed(2)}</td>
                            <td className="p-3">{player.matchesPlayed}</td>
                            <td className="p-3">{player.winRate.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    4K Display Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Export Specifications</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Resolution: 3840 x 2160 (4K UHD)</li>
                      <li>• Format: PNG with transparency</li>
                      <li>• Optimized for facility displays</li>
                      <li>• High contrast, readable fonts</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={generate4KDisplay}
                    disabled={isGenerating || leaderboardData.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating 4K Display...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate & Download 4K Display
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Display Options (Coming Soon)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 opacity-60">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-700">Branding Customization</div>
                      <div className="text-sm text-gray-500">Logo, colors, facility name</div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-700">Layout Templates</div>
                      <div className="text-sm text-gray-500">Multiple display formats</div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-700">Auto-Refresh</div>
                      <div className="text-sm text-gray-500">Scheduled updates</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-4">
                    Step 6: Polish & Features
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}