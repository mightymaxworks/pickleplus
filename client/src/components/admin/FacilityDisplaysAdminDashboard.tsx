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

  // Generate 4K display export - PROFESSIONAL CANVAS IMPLEMENTATION
  const generate4KDisplay = async () => {
    setIsGenerating(true);
    try {
      // Create 4K canvas (3840x2160)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');

      // 4K UHD dimensions
      const width = 3840;
      const height = 2160;
      canvas.width = width;
      canvas.height = height;

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // BACKGROUND: Pickle+ signature gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#fff7ed'); // Orange-50
      gradient.addColorStop(0.3, '#ffedd5'); // Orange-100  
      gradient.addColorStop(0.7, '#fed7aa'); // Orange-200
      gradient.addColorStop(1, '#fdba74'); // Orange-300
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // HEADER SECTION
      const headerHeight = 400;
      
      // Header background - Pickle+ orange gradient
      const headerGradient = ctx.createLinearGradient(0, 0, width, headerHeight);
      headerGradient.addColorStop(0, '#FF5722'); // Pickle+ Primary Orange
      headerGradient.addColorStop(0.6, '#f97316'); // Orange-500
      headerGradient.addColorStop(1, '#ea580c'); // Orange-600
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, width, headerHeight);

      // Main title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const formatLabel = formats.find(f => f.value === selectedFormat)?.label || 'Rankings';
      const divisionLabel = divisions.find(d => d.value === selectedDivision)?.label || 'Open';
      const genderLabel = genders.find(g => g.value === selectedGender)?.label || 'All';
      
      // Trophy icon (text-based for reliability)
      ctx.font = 'bold 150px "Arial", sans-serif';
      ctx.fillText('🏆', width / 2, 200);
      
      // Title text
      ctx.font = 'bold 110px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`${formatLabel} Rankings`, width / 2, 320);
      
      // Subtitle
      ctx.font = 'bold 65px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${divisionLabel} • ${genderLabel}`, width / 2, 370);

      // RANKINGS TABLE
      const tableStartY = headerHeight + 60;
      const rowHeight = 120;
      const maxVisiblePlayers = Math.min(12, leaderboardData.length); // Show top 12 for 4K display
      
      // Table header background - Pickle+ orange accent
      ctx.fillStyle = 'rgba(255, 87, 34, 0.15)'; // Pickle+ orange with transparency
      ctx.fillRect(120, tableStartY, width - 240, 100);
      
      // Table headers
      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.font = 'bold 55px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      
      const headers = [
        { text: 'Rank', x: 200 },
        { text: 'Player', x: 400 },
        { text: 'Points', x: width - 800 },
        { text: 'Matches', x: width - 500 },
        { text: 'Win Rate', x: width - 280 }
      ];
      
      headers.forEach(header => {
        ctx.fillText(header.text, header.x, tableStartY + 65);
      });

      // Player rows
      for (let i = 0; i < maxVisiblePlayers; i++) {
        const player = leaderboardData[i];
        if (!player) continue;
        
        const y = tableStartY + 100 + (i * rowHeight);
        
        // Alternate row background
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
          ctx.fillRect(120, y, width - 240, rowHeight);
        }
        
        // Ranking highlight for top 3 - Enhanced with Pickle+ styling
        if (i < 3) {
          const rankColors = ['#fbbf24', '#e5e7eb', '#cd7c2f']; // Gold, Silver, Bronze
          ctx.fillStyle = rankColors[i];
          ctx.fillRect(120, y, 15, rowHeight);
          
          // Add Pickle+ orange accent border for top 3
          ctx.fillStyle = '#FF5722';
          ctx.fillRect(135, y, 3, rowHeight);
        }

        // Text styling based on rank
        const textColor = i < 3 ? '#1f2937' : '#374151';
        ctx.fillStyle = textColor;
        ctx.font = i < 3 ? 'bold 50px "Inter", sans-serif' : '48px "Inter", sans-serif';
        
        // Rank with medal for top 3
        const medals = ['🥇', '🥈', '🥉'];
        const rankText = i < 3 ? `${medals[i]} #${player.ranking}` : `#${player.ranking}`;
        ctx.textAlign = 'center';
        ctx.fillText(rankText, 300, y + 65);
        
        // Player name
        ctx.textAlign = 'left';
        ctx.fillText(player.displayName, 400, y + 65);
        
        // Points (highlighted) - Pickle+ orange
        ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
        ctx.font = 'bold 50px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.points.toString(), width - 700, y + 65);
        
        // Matches played
        ctx.fillStyle = textColor;
        ctx.font = '48px "Inter", sans-serif';
        ctx.fillText(player.matchesPlayed.toString(), width - 400, y + 65);
        
        // Win rate
        const winRate = player.matchesPlayed > 0 ? Math.round(player.winRate) : 0;
        ctx.fillText(`${winRate}%`, width - 180, y + 65);
      }

      // FOOTER
      const footerY = height - 150;
      
      // Footer background - Pickle+ subtle orange
      ctx.fillStyle = 'rgba(255, 87, 34, 0.08)';
      ctx.fillRect(0, footerY, width, 150);
      
      // Pickle+ branding with signature orange
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 45px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥒 Powered by Pickle+ Platform', width / 2, footerY + 60);
      
      // Timestamp
      ctx.fillStyle = '#9a3412'; // Orange-800
      ctx.font = '35px "Inter", sans-serif';
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, width / 2, footerY + 110);

      // DATA QUALITY INDICATOR - Pickle+ green accent
      const dataQualityY = height - 300;
      ctx.fillStyle = '#4CAF50'; // Pickle+ Secondary Green
      ctx.font = 'bold 40px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`✓ Live Data • ${leaderboardData.length} Players`, width - 120, dataQualityY);

      // Convert canvas to blob and download
      return new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate canvas blob'));
            return;
          }
          
          // Create download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pickle-plus-${selectedFormat}-${selectedDivision}-${selectedGender}-4k-display.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log(`✅ 4K Display Export Complete: ${a.download}`);
          resolve();
        }, 'image/png', 1.0); // Maximum quality
      });
      
    } catch (error) {
      console.error('Error generating 4K display:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate League Table Export - COMPACT FORMAT
  const generateLeagueTable = async () => {
    setIsGenerating(true);
    try {
      // Create landscape canvas for printing (11x8.5 inches at 300 DPI)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');

      // High-quality print dimensions
      const width = 3300;
      const height = 2550;
      canvas.width = width;
      canvas.height = height;

      // High-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Pickle+ branded background for printing
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#ffffff');
      bgGradient.addColorStop(0.9, '#fff7ed'); // Orange-50
      bgGradient.addColorStop(1, '#ffedd5'); // Orange-100
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // HEADER - Pickle+ orange
      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.font = 'bold 80px "Inter", sans-serif';
      ctx.textAlign = 'center';
      
      const formatLabel = formats.find(f => f.value === selectedFormat)?.label || 'Rankings';
      const divisionLabel = divisions.find(d => d.value === selectedDivision)?.label || 'Open';
      const genderLabel = genders.find(g => g.value === selectedGender)?.label || 'All';
      
      ctx.fillText(`${formatLabel} League Table - ${divisionLabel} ${genderLabel}`, width / 2, 120);

      // Table structure - more compact for printing
      const tableStartY = 220;
      const rowHeight = 80;
      const maxPlayers = Math.min(25, leaderboardData.length); // Show more players for league table
      
      // Column definitions with better spacing
      const columns = [
        { header: 'Rank', x: 200, width: 150 },
        { header: 'Player Name', x: 350, width: 800 },
        { header: 'Points', x: 1150, width: 200 },
        { header: 'Matches', x: 1350, width: 180 },
        { header: 'Wins', x: 1530, width: 150 },
        { header: 'Losses', x: 1680, width: 150 },
        { header: 'Win %', x: 1830, width: 180 }
      ];

      // Table headers - Pickle+ styling
      ctx.fillStyle = '#fff7ed'; // Orange-50
      ctx.fillRect(150, tableStartY, width - 300, 60);
      ctx.strokeStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.lineWidth = 3;
      ctx.strokeRect(150, tableStartY, width - 300, 60);

      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.font = 'bold 40px "Inter", sans-serif';
      ctx.textAlign = 'center';
      
      columns.forEach(col => {
        ctx.fillText(col.header, col.x, tableStartY + 45);
      });

      // Player rows with alternating colors
      for (let i = 0; i < maxPlayers; i++) {
        const player = leaderboardData[i];
        if (!player) continue;
        
        const y = tableStartY + 60 + (i * rowHeight);
        
        // Row background - Pickle+ alternating colors
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#fff7ed'; // White / Orange-50
        ctx.fillRect(150, y, width - 300, rowHeight);
        
        // Row border
        ctx.strokeStyle = '#fed7aa'; // Orange-200
        ctx.lineWidth = 1;
        ctx.strokeRect(150, y, width - 300, rowHeight);

        // Text color and font
        ctx.fillStyle = '#1f2937';
        ctx.font = i < 3 ? 'bold 36px "Inter", sans-serif' : '34px "Inter", sans-serif';
        
        // Rank - Special styling for top 3
        ctx.textAlign = 'center';
        if (i < 3) {
          const medals = ['🥇', '🥈', '🥉'];
          ctx.fillText(`${medals[i]} #${player.ranking}`, columns[0].x, y + 50);
        } else {
          ctx.fillText(player.ranking.toString(), columns[0].x, y + 50);
        }
        
        // Player name
        ctx.textAlign = 'left';
        ctx.fillText(player.displayName, columns[1].x - 100, y + 50);
        
        // Points (highlighted) - Pickle+ orange
        ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.points.toString(), columns[2].x, y + 50);
        
        // Stats
        ctx.fillStyle = '#1f2937';
        ctx.font = '34px "Inter", sans-serif';
        ctx.fillText(player.matchesPlayed.toString(), columns[3].x, y + 50);
        
        // Calculate wins/losses
        const wins = Math.round(player.matchesPlayed * (player.winRate / 100));
        const losses = player.matchesPlayed - wins;
        
        ctx.fillText(wins.toString(), columns[4].x, y + 50);
        ctx.fillText(losses.toString(), columns[5].x, y + 50);
        
        // Win percentage
        const winRate = player.matchesPlayed > 0 ? Math.round(player.winRate) : 0;
        ctx.fillText(`${winRate}%`, columns[6].x, y + 50);
      }

      // Footer with timestamp and stats - Pickle+ branding
      const footerY = height - 150;
      
      // Footer background
      ctx.fillStyle = 'rgba(255, 87, 34, 0.08)'; // Pickle+ orange tint
      ctx.fillRect(0, footerY - 20, width, 120);
      
      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.font = 'bold 32px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🥒 Generated: ${new Date().toLocaleDateString()} • Pickle+ Platform`, width / 2, footerY);
      
      ctx.fillStyle = '#9a3412'; // Orange-800
      ctx.font = '28px "Inter", sans-serif';
      ctx.fillText(`Total Players: ${leaderboardData.length} • Live Rankings System`, width / 2, footerY + 40);

      // Convert and download
      return new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate league table blob'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pickle-plus-league-table-${selectedFormat}-${selectedDivision}-${selectedGender}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log(`✅ League Table Export Complete: ${a.download}`);
          resolve();
        }, 'image/png', 1.0);
      });
      
    } catch (error) {
      console.error('Error generating league table:', error);
      throw error;
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
                          {leaderboardData.filter(p => p.points > 0).length}
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
                  <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                    {/* Facility Display Header */}
                    <div className="mb-6 text-center">
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        🏆 {formats.find(f => f.value === selectedFormat)?.label} Rankings
                      </h2>
                      <div className="text-lg text-slate-600">
                        {divisions.find(d => d.value === selectedDivision)?.label} • {genders.find(g => g.value === selectedGender)?.label}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        Last Updated: {lastUpdated?.toLocaleString() || 'Never'}
                      </div>
                    </div>

                    {/* Professional Ranking Table */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <th className="text-left p-4 font-bold text-lg">Rank</th>
                            <th className="text-left p-4 font-bold text-lg">Player</th>
                            <th className="text-right p-4 font-bold text-lg">Points</th>
                            <th className="text-center p-4 font-bold text-lg">Matches</th>
                            <th className="text-center p-4 font-bold text-lg">Win Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardData.slice(0, 20).map((player, index) => (
                            <tr 
                              key={player.id} 
                              className={`border-b transition-colors ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              } hover:bg-blue-50`}
                            >
                              <td className="p-4">
                                <div className="flex items-center">
                                  {index < 3 && (
                                    <Trophy className={`w-6 h-6 mr-3 ${
                                      index === 0 ? 'text-yellow-500' :
                                      index === 1 ? 'text-gray-400' :
                                      'text-orange-500'
                                    }`} />
                                  )}
                                  <span className={`text-2xl font-bold ${
                                    index < 3 ? 'text-orange-600' : 'text-slate-700'
                                  }`}>
                                    #{player.ranking}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    {player.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-slate-800">
                                      {player.displayName}
                                    </div>
                                    <div className="text-sm text-slate-500 font-medium">
                                      @{player.username}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className="text-2xl font-bold text-orange-600">
                                  {player.points.toFixed(2)}
                                </span>
                                <div className="text-sm text-slate-500">pts</div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-lg font-semibold text-slate-700">
                                  {player.matchesPlayed}
                                </span>
                                <div className="text-sm text-slate-500">games</div>
                              </td>
                              <td className="p-4 text-center">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                  player.winRate >= 70 ? 'bg-green-100 text-green-800' :
                                  player.winRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {player.winRate.toFixed(1)}%
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer for 4K Display */}
                    <div className="mt-6 text-center text-slate-500 text-sm">
                      <div className="flex items-center justify-center gap-4">
                        <span>🏓 Pickle+ Ranking System</span>
                        <span>•</span>
                        <span>Powered by PCP Algorithm</span>
                        <span>•</span>
                        <span>Real-time Updates</span>
                      </div>
                    </div>
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
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">4K Facility Display</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Resolution: 3840 x 2160 (4K UHD)</li>
                          <li>• Top 12 players with medals</li>
                          <li>• Professional gradient styling</li>
                          <li>• Large fonts for TV displays</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">League Table (Print)</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Resolution: 3300 x 2550 (11x8.5")</li>
                          <li>• Up to 25 players in compact format</li>
                          <li>• Clean white background for printing</li>
                          <li>• Detailed statistics table</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                          Generate 4K Facility Display
                        </>
                      )}
                    </Button>

                    <Button 
                      onClick={generateLeagueTable}
                      disabled={isGenerating || leaderboardData.length === 0}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating League Table...
                        </>
                      ) : (
                        <>
                          <Layout className="w-4 h-4 mr-2" />
                          Generate League Table (Print)
                        </>
                      )}
                    </Button>
                  </div>
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