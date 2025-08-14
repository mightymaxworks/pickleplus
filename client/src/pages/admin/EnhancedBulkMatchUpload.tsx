import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Plus, Calendar, Users, Trophy, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BulkUploadResult {
  successful: number;
  failed: number;
  errors: string[];
}

interface QuickMatchData {
  matchDate: string;
  matchType: 'casual' | 'tournament' | 'league';
  player1PassportCode: string;
  player2PassportCode: string;
  player3PassportCode?: string;
  player4PassportCode?: string;
  isDoubles: boolean;
  team1Score: number;
  team2Score: number;
  game1Team1Score?: number;
  game1Team2Score?: number;
  game2Team1Score?: number;
  game2Team2Score?: number;
  game3Team1Score?: number;
  game3Team2Score?: number;
  location?: string;
  notes?: string;
}

export function EnhancedBulkMatchUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [quickMatch, setQuickMatch] = useState<QuickMatchData>({
    matchDate: new Date().toISOString().split('T')[0],
    matchType: 'casual',
    player1PassportCode: '',
    player2PassportCode: '',
    isDoubles: false,
    team1Score: 0,
    team2Score: 0,
    location: '',
    notes: ''
  });

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Admin access required to view this page.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await apiRequest('POST', '/api/admin/bulk-upload/matches', formData);
      const result = await response.json();

      setUploadResult(result);
      
      if (result.successful > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${result.successful} matches${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
          variant: result.failed > 0 ? "default" : "default"
        });
      } else {
        toast({
          title: "Upload Failed",
          description: `All ${result.failed} matches failed to upload`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload Excel file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/bulk-upload/template');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pickle-plus-bulk-match-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Template Downloaded",
        description: "Excel template has been downloaded successfully"
      });
    } catch (error) {
      console.error('Template download error:', error);
      toast({
        title: "Download Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuickMatchSubmit = async () => {
    try {
      // Validate required fields
      if (!quickMatch.player1PassportCode || !quickMatch.player2PassportCode) {
        toast({
          title: "Validation Error",
          description: "Player passport codes are required",
          variant: "destructive"
        });
        return;
      }

      if (quickMatch.isDoubles && (!quickMatch.player3PassportCode || !quickMatch.player4PassportCode)) {
        toast({
          title: "Validation Error", 
          description: "All four player passport codes are required for doubles matches",
          variant: "destructive"
        });
        return;
      }

      // Create Excel data format for single match
      const excelData = [{
        'Match Date (YYYY-MM-DD)': quickMatch.matchDate,
        'Match Type (casual/tournament/league)': quickMatch.matchType,
        'Player 1 Passport Code': quickMatch.player1PassportCode.toUpperCase(),
        'Player 1 Gender (male/female)': 'male', // Default - will be ignored if user exists
        'Player 1 Date of Birth (YYYY-MM-DD)': '',
        'Player 2 Passport Code': quickMatch.player2PassportCode.toUpperCase(),
        'Player 2 Gender (male/female)': 'female', // Default - will be ignored if user exists
        'Player 2 Date of Birth (YYYY-MM-DD)': '',
        'Player 3 Passport Code (doubles only)': quickMatch.player3PassportCode?.toUpperCase() || '',
        'Player 3 Gender (doubles only)': '',
        'Player 3 Date of Birth (doubles only)': '',
        'Player 4 Passport Code (doubles only)': quickMatch.player4PassportCode?.toUpperCase() || '',
        'Player 4 Gender (doubles only)': '',
        'Player 4 Date of Birth (doubles only)': '',
        'Is Doubles Match (TRUE/FALSE)': quickMatch.isDoubles ? 'TRUE' : 'FALSE',
        'Team 1 Score': quickMatch.team1Score,
        'Team 2 Score': quickMatch.team2Score,
        'Game 1 Team 1 Score': quickMatch.game1Team1Score || '',
        'Game 1 Team 2 Score': quickMatch.game1Team2Score || '',
        'Game 2 Team 1 Score': quickMatch.game2Team1Score || '',
        'Game 2 Team 2 Score': quickMatch.game2Team2Score || '',
        'Game 3 Team 1 Score': quickMatch.game3Team1Score || '',
        'Game 3 Team 2 Score': quickMatch.game3Team2Score || '',
        'Location (optional)': quickMatch.location || '',
        'Notes (optional)': quickMatch.notes || ''
      }];

      // Create temporary Excel file
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Quick Match');
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      
      // Create FormData and upload
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      formData.append('excelFile', blob, 'quick-match.xlsx');

      setIsUploading(true);
      const response = await apiRequest('POST', '/api/admin/bulk-upload/matches', formData);
      const result = await response.json();

      if (result.successful > 0) {
        toast({
          title: "Match Created",
          description: "Quick match has been successfully created"
        });
        
        // Reset form
        setQuickMatch({
          matchDate: new Date().toISOString().split('T')[0],
          matchType: 'casual',
          player1PassportCode: '',
          player2PassportCode: '',
          isDoubles: false,
          team1Score: 0,
          team2Score: 0,
          location: '',
          notes: ''
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.errors?.[0] || "Failed to create match",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Quick match creation error:', error);
      toast({
        title: "Creation Error",
        description: "Failed to create quick match. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Trophy className="h-4 w-4" />;
      case 'league': return <Target className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Enhanced Bulk Match Upload</h1>
      </div>

      {/* Quick Match Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Match Creation
          </CardTitle>
          <CardDescription>
            Create a single match quickly with dropdown selections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchDate">Match Date</Label>
              <Input
                id="matchDate"
                type="date"
                value={quickMatch.matchDate}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, matchDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type</Label>
              <Select value={quickMatch.matchType} onValueChange={(value: 'casual' | 'tournament' | 'league') => 
                setQuickMatch(prev => ({ ...prev, matchType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Casual
                    </div>
                  </SelectItem>
                  <SelectItem value="tournament">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Tournament
                    </div>
                  </SelectItem>
                  <SelectItem value="league">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      League
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Match Format</Label>
              <Select value={quickMatch.isDoubles ? "doubles" : "singles"} onValueChange={(value) => 
                setQuickMatch(prev => ({ ...prev, isDoubles: value === "doubles" }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles">Doubles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1">Player 1 Passport Code</Label>
              <Input
                id="player1"
                placeholder="e.g., HVGN0BW0"
                value={quickMatch.player1PassportCode}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, player1PassportCode: e.target.value.toUpperCase() }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="player2">Player 2 Passport Code</Label>
              <Input
                id="player2"
                placeholder="e.g., KGLE38K4"
                value={quickMatch.player2PassportCode}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, player2PassportCode: e.target.value.toUpperCase() }))}
              />
            </div>

            {quickMatch.isDoubles && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="player3">Player 3 Passport Code</Label>
                  <Input
                    id="player3"
                    placeholder="e.g., 1IUOYCZY"
                    value={quickMatch.player3PassportCode || ''}
                    onChange={(e) => setQuickMatch(prev => ({ ...prev, player3PassportCode: e.target.value.toUpperCase() }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player4">Player 4 Passport Code</Label>
                  <Input
                    id="player4"
                    placeholder="e.g., N002VJJR"
                    value={quickMatch.player4PassportCode || ''}
                    onChange={(e) => setQuickMatch(prev => ({ ...prev, player4PassportCode: e.target.value.toUpperCase() }))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1Score">Team 1 Score</Label>
              <Input
                id="team1Score"
                type="number"
                min="0"
                max="3"
                value={quickMatch.team1Score}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, team1Score: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team2Score">Team 2 Score</Label>
              <Input
                id="team2Score"
                type="number"
                min="0"
                max="3"
                value={quickMatch.team2Score}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, team2Score: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Court 1"
                value={quickMatch.location || ''}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional match notes"
                value={quickMatch.notes || ''}
                onChange={(e) => setQuickMatch(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            onClick={handleQuickMatchSubmit} 
            disabled={isUploading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isUploading ? 'Creating Match...' : 'Create Match'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Bulk Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>
              Download the Excel template with proper YYYY-MM-DD date format and league option
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Template includes:</p>
              <ul className="space-y-1">
                <li>• YYYY-MM-DD date format validation</li>
                <li>• Match type dropdown (casual/tournament/league)</li>
                <li>• Singles and doubles match examples</li>
                <li>• Proper scoring format with game breakdowns</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Matches
            </CardTitle>
            <CardDescription>
              Upload your completed Excel file with match data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose Excel File'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                ✓ {uploadResult.successful} Successful
              </Badge>
              {uploadResult.failed > 0 && (
                <Badge variant="destructive">
                  ✗ {uploadResult.failed} Failed
                </Badge>
              )}
            </div>
            
            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600">Errors:</Label>
                <div className="text-sm space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedBulkMatchUpload;