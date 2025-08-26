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

  // Chinese translation helpers for bilingual facility displays
  const getChineseLabel = (format: string): string => {
    const translations: Record<string, string> = {
      'Singles': '单打',
      'Doubles': '双打'
    };
    return translations[format] || format;
  };

  const getChineseDivision = (division: string): string => {
    const translations: Record<string, string> = {
      'Open (19+)': '公开 (19+)',
      '35+': '35岁以上',
      '50+': '50岁以上', 
      '60+': '60岁以上',
      '70+': '70岁以上',
      'U18': '18岁以下',
      'U16': '16岁以下',
      'U14': '14岁以下',
      'U12': '12岁以下'
    };
    return translations[division] || division;
  };

  const getChineseGender = (gender: string): string => {
    const translations: Record<string, string> = {
      'Men': '男子',
      'Women': '女子',
      'Mixed Doubles': '混合双打'
    };
    return translations[gender] || gender;
  };

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
    { value: 'female', label: 'Women' },
    { value: 'mixed', label: 'Mixed Doubles' }
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

      // HEADER SECTION - Bilingual compact design
      const headerHeight = 320;
      
      // Header background - Pickle+ orange gradient
      const headerGradient = ctx.createLinearGradient(0, 0, width, headerHeight);
      headerGradient.addColorStop(0, '#FF5722'); // Pickle+ Primary Orange
      headerGradient.addColorStop(0.6, '#f97316'); // Orange-500
      headerGradient.addColorStop(1, '#ea580c'); // Orange-600
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, width, headerHeight);

      // Clean title layout - no overlapping
      const formatLabel = formats.find(f => f.value === selectedFormat)?.label || 'Rankings';
      const divisionLabel = divisions.find(d => d.value === selectedDivision)?.label || 'Open';
      const genderLabel = genders.find(g => g.value === selectedGender)?.label || 'All';
      
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      
      // Main title - clean and spaced
      ctx.font = 'bold 80px "Inter", sans-serif';
      ctx.fillText(`${formatLabel} Rankings`, width / 2, 100);
      
      // Chinese subtitle - proper spacing
      ctx.font = 'bold 50px "Microsoft YaHei", "SimHei", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`${getChineseLabel(formatLabel)} 排行榜`, width / 2, 170);
      
      // Division info - single line
      ctx.font = '45px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${divisionLabel} Division`, width / 2, 230);

      // ELEGANT RANKINGS TABLE - Sleek design
      const tableStartY = 280;
      const rowHeight = 85;
      const maxVisiblePlayers = Math.min(20, leaderboardData.length);
      
      // Subtle table header background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(180, tableStartY, width - 360, 70);
      
      // Clean single-language headers  
      ctx.fillStyle = '#2d3748';
      ctx.font = '48px "Inter", sans-serif';
      
      // Better column positioning
      const col1X = 400;  // Rank - centered
      const col2X = 700;  // Player Name - left aligned
      const col3X = width - 400;  // Points - centered
      
      ctx.textAlign = 'center';
      ctx.fillText('RANK', col1X, tableStartY + 45);
      
      ctx.textAlign = 'left';
      ctx.fillText('PLAYER NAME', col2X, tableStartY + 45);
      
      ctx.textAlign = 'center';
      ctx.fillText('POINTS', col3X, tableStartY + 45);

      // Elegant player rows - refined typography
      for (let i = 0; i < maxVisiblePlayers; i++) {
        const player = leaderboardData[i];
        if (!player) continue;
        
        const y = tableStartY + 70 + (i * rowHeight);
        
        // Subtle alternating backgrounds
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(180, y, width - 360, rowHeight);
        }
        
        // Refined podium highlighting
        if (i < 3) {
          ctx.fillStyle = 'rgba(255, 193, 7, 0.12)';  // Subtle gold tint
          ctx.fillRect(180, y, width - 360, rowHeight);
          
          // Elegant left accent
          ctx.fillStyle = '#f59e0b';  // Gold accent
          ctx.fillRect(180, y, 5, rowHeight);
        }

        // Refined text styling - much lighter
        const textColor = '#374151';  // Softer gray
        ctx.fillStyle = textColor;
        
        // RANK - Centered, lighter typography
        ctx.textAlign = 'center';
        ctx.font = i < 3 ? 'bold 46px "Inter", sans-serif' : '42px "Inter", sans-serif';
        
        if (i < 3) {
          const medals = ['🥇', '🥈', '🥉'];
          ctx.fillText(`${medals[i]} ${player.ranking}`, col1X, y + 55);
        } else {
          ctx.fillText(`${player.ranking}`, col1X, y + 55);
        }
        
        // PLAYER NAME - Left aligned, elegant
        ctx.textAlign = 'left';
        ctx.font = i < 3 ? 'bold 46px "Inter", sans-serif' : '42px "Inter", sans-serif';
        ctx.fillText(player.displayName, col2X, y + 55);
        
        // POINTS - Highlighted but refined
        ctx.textAlign = 'center';
        ctx.fillStyle = '#dc2626';  // Refined red instead of harsh orange
        ctx.font = 'bold 50px "Inter", sans-serif';
        
        // Subtle point background
        ctx.save();
        ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
        ctx.fillRect(col3X - 70, y + 25, 140, 40);
        ctx.restore();
        
        ctx.fillStyle = '#dc2626';
        ctx.fillText(player.points.toString(), col3X, y + 55);
      }

      // CLEAN FOOTER
      const footerY = height - 180;
      
      // Elegant footer background
      const footerGrad = ctx.createLinearGradient(0, footerY, 0, height);
      footerGrad.addColorStop(0, 'rgba(255, 87, 34, 0.1)');
      footerGrad.addColorStop(1, 'rgba(255, 87, 34, 0.2)');
      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, footerY, width, 180);
      
      // Pickle+ branding - main
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 50px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥒 Pickle+ Tournament Platform', width / 2, footerY + 60);
      
      // Timestamp and player count
      ctx.fillStyle = '#6b7280';
      ctx.font = '38px "Inter", sans-serif';
      ctx.fillText(`Generated ${new Date().toLocaleDateString()} • ${leaderboardData.length} Players`, width / 2, footerY + 120);
      
      // Bilingual note
      ctx.fillStyle = '#9ca3af';
      ctx.font = '28px "Microsoft YaHei", "SimHei", sans-serif';
      ctx.fillText('实时排行榜 • Live Rankings • Pickle+ 平台', width / 2, footerY + 160);

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

      // HEADER - Clean bilingual design
      const formatLabel = formats.find(f => f.value === selectedFormat)?.label || 'Rankings';
      const divisionLabel = divisions.find(d => d.value === selectedDivision)?.label || 'Open';
      const genderLabel = genders.find(g => g.value === selectedGender)?.label || 'All';
      
      // Main title with enhanced styling
      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px "Inter", sans-serif';
      ctx.fillText(`${formatLabel} Rankings`, width / 2, 90);
      
      // Chinese subtitle - smaller and elegant
      ctx.fillStyle = '#9a3412'; // Orange-800 for secondary text
      ctx.font = '42px "Microsoft YaHei", "SimHei", sans-serif';
      ctx.fillText(`${getChineseLabel(formatLabel)} 排行榜`, width / 2, 140);
      
      // Division info - side by side layout
      ctx.fillStyle = '#374151'; // Gray-700
      ctx.font = 'bold 48px "Inter", sans-serif';
      ctx.fillText(`${divisionLabel} Division`, width / 2, 200);
      
      // Gender category - cleaner layout
      ctx.fillStyle = '#6b7280'; // Gray-500
      ctx.font = '36px "Inter", sans-serif';
      ctx.fillText(`${genderLabel} Category`, width / 2, 240);

      // Table structure - more compact for printing
      const tableStartY = 280;
      const rowHeight = 80;
      const maxPlayers = Math.min(25, leaderboardData.length); // Show more players for league table
      
      // Simplified column definitions - cleaner layout
      const columns = [
        { header: 'RANK', chinese: '排名', x: 300, width: 200 },
        { header: 'PLAYER NAME', chinese: '球员姓名', x: 500, width: 1000 },
        { header: 'POINTS', chinese: '积分', x: 1500, width: 300 }
      ];

      // Enhanced table headers with bilingual support
      const headerHeight = 100;
      
      // Header background with gradient
      const headerGrad = ctx.createLinearGradient(0, tableStartY, 0, tableStartY + headerHeight);
      headerGrad.addColorStop(0, '#FF5722'); // Pickle+ Orange
      headerGrad.addColorStop(1, '#E64A19'); // Darker orange
      ctx.fillStyle = headerGrad;
      ctx.fillRect(200, tableStartY, width - 400, headerHeight);
      
      // Header border
      ctx.strokeStyle = '#BF360C'; // Deep orange
      ctx.lineWidth = 4;
      ctx.strokeRect(200, tableStartY, width - 400, headerHeight);

      // Header text - English
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.textAlign = 'center';
      
      columns.forEach(col => {
        ctx.fillText(col.header, col.x, tableStartY + 35);
      });
      
      // Header text - Chinese
      ctx.font = 'bold 32px "Microsoft YaHei", "SimHei", sans-serif';
      columns.forEach(col => {
        ctx.fillText(col.chinese, col.x, tableStartY + 75);
      });

      // Player rows with clean modern styling (simplified layout)
      for (let i = 0; i < maxPlayers; i++) {
        const player = leaderboardData[i];
        if (!player) continue;
        
        const y = tableStartY + headerHeight + (i * rowHeight);
        
        // Elegant row background with subtle alternating pattern
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(200, y, width - 400, rowHeight);
        }
        
        // Special highlighting for podium positions
        if (i < 3) {
          const podiumGrad = ctx.createLinearGradient(200, y, width - 200, y);
          podiumGrad.addColorStop(0, 'rgba(255, 215, 0, 0.2)'); // Gold tint
          podiumGrad.addColorStop(1, 'rgba(255, 87, 34, 0.1)'); // Orange tint
          ctx.fillStyle = podiumGrad;
          ctx.fillRect(200, y, width - 400, rowHeight);
          
          // Elegant left accent stripe for podium
          ctx.fillStyle = '#FF5722';
          ctx.fillRect(200, y, 10, rowHeight);
        }
        
        // Subtle row border
        ctx.strokeStyle = 'rgba(255, 87, 34, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(200, y, width - 400, rowHeight);

        // Enhanced text styling - more readable and elegant
        const textColor = '#1a202c';
        ctx.fillStyle = textColor;
        
        // Rank - Enhanced styling for top 3
        ctx.textAlign = 'center';
        ctx.font = i < 3 ? 'bold 50px "Inter", sans-serif' : 'bold 46px "Inter", sans-serif';
        
        if (i < 3) {
          const medals = ['🥇', '🥈', '🥉'];
          ctx.fillText(`${medals[i]} #${player.ranking}`, columns[0].x, y + 55);
        } else {
          ctx.fillText(`#${player.ranking}`, columns[0].x, y + 55);
        }
        
        // Player name - more prominent
        ctx.textAlign = 'left';
        ctx.font = i < 3 ? 'bold 48px "Inter", sans-serif' : '44px "Inter", sans-serif';
        ctx.fillText(player.displayName, columns[1].x - 120, y + 55);
        
        // Points (highlighted) - Pickle+ orange with background accent
        ctx.save();
        ctx.fillStyle = 'rgba(255, 87, 34, 0.15)';
        ctx.fillRect(columns[2].x - 120, y + 15, 240, 50);
        ctx.restore();
        
        ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
        ctx.font = 'bold 52px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.points.toString(), columns[2].x, y + 55);
      }

      // Professional footer with enhanced Pickle+ branding
      const footerY = height - 180;
      
      // Elegant footer background with gradient
      const footerGrad = ctx.createLinearGradient(0, footerY, 0, height);
      footerGrad.addColorStop(0, 'rgba(255, 87, 34, 0.08)');
      footerGrad.addColorStop(1, 'rgba(255, 87, 34, 0.18)');
      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, footerY, width, 180);
      
      // Top border for footer separation
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, footerY);
      ctx.lineTo(width - 200, footerY);
      ctx.stroke();
      
      // Pickle+ branding - enhanced layout
      ctx.fillStyle = '#FF5722'; // Pickle+ Primary Orange
      ctx.font = 'bold 46px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥒 Pickle+ Tournament Rankings', width / 2, footerY + 55);
      
      // Timestamp and player count - elegant styling
      ctx.fillStyle = '#6b7280'; // Gray-500
      ctx.font = '34px "Inter", sans-serif';
      ctx.fillText(`Generated ${new Date().toLocaleDateString()} • ${leaderboardData.length} Active Players`, width / 2, footerY + 100);
      
      // Bilingual footer note
      ctx.fillStyle = '#9ca3af'; // Gray-400
      ctx.font = '26px "Microsoft YaHei", "SimHei", sans-serif';
      ctx.fillText('实时比赛数据 • Live Tournament Data • Pickle+ 平台', width / 2, footerY + 140);

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

                    {/* Simplified Professional Ranking Table */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <th className="text-center p-4 font-bold text-lg">
                              Rank<br/>
                              <span className="text-sm font-normal opacity-90">排名</span>
                            </th>
                            <th className="text-left p-6 font-bold text-lg">
                              Player Name<br/>
                              <span className="text-sm font-normal opacity-90">球员姓名</span>
                            </th>
                            <th className="text-center p-4 font-bold text-lg">
                              Points<br/>
                              <span className="text-sm font-normal opacity-90">积分</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardData.slice(0, 15).map((player, index) => (
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
                  <Badge variant="default" className="mt-4 bg-green-500 text-white">
                    ✅ Step 6: Complete - Bilingual Mixed Doubles Support
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