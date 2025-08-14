import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Trophy, Users, Target, Edit, Trash2, RefreshCw, Loader2, AlertCircle, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Link } from 'wouter';
import { QuickMatchRecorderStreamlined } from '@/components/match/QuickMatchRecorderStreamlined';
import DUPRStyleMatchHistory from '@/components/match/DUPRStyleMatchHistory';

interface Competition {
  id: number;
  name: string;
  type: string;
  description?: string;
  startDate: string;
  endDate?: string;
  maxParticipants?: number;
  entryFee?: number;
  pointsMultiplier?: number;
  prizePool?: number;
  status?: string;
  createdAt: string;
}

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  gender?: string;
  birthDate?: string;
  currentRating?: string;
  ageGroup?: string;
}

// Bulk Upload Tab Component
const BulkUploadTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [matchType, setMatchType] = useState<'casual' | 'tournament' | 'league'>('casual');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResults(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('matchType', matchType);

      const response = await fetch('/api/admin/bulk-upload/matches', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result);
        toast({
          title: "Upload Successful",
          description: `Successfully processed ${result.successCount} matches.`,
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload matches.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload/template', {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-match-template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Template Downloaded",
          description: "Excel template downloaded successfully.",
        });
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download template.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Bulk Match Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload multiple matches at once using Excel files with proper date formatting (YYYY-MM-DD)
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Match Data
          </CardTitle>
          <CardDescription>
            Select match type and upload an Excel file with match results. All dates must be in YYYY-MM-DD format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="matchType">Match Type</Label>
            <Select value={matchType} onValueChange={(value: 'casual' | 'tournament' | 'league') => setMatchType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select match type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Match</SelectItem>
                <SelectItem value="tournament">Tournament Match</SelectItem>
                <SelectItem value="league">League Match</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Matches...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Matches Processed:</span>
                <span className="font-medium">{uploadResults.totalProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span>Successful:</span>
                <span className="font-medium text-green-600">{uploadResults.successCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="font-medium text-red-600">{uploadResults.errorCount}</span>
              </div>
              
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {uploadResults.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-500">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MatchManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateCompetition, setShowCreateCompetition] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<any>(null);
  const [editMatchData, setEditMatchData] = useState({
    player1Score: '',
    player2Score: '',
    team1Score: '',
    team2Score: '',
    winnerId: '',
    notes: ''
  });

  // Fetch competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/competitions');
      const data = await response.json();
      return data;
    }
  });

  // Search and filter states
  const [searchFilters, setSearchFilters] = useState({
    playerName: '',
    eventName: '',
    format: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch completed matches for CRUD operations with filtering
  const { data: completedMatches, isLoading: completedMatchesLoading, refetch: refetchCompletedMatches } = useQuery({
    queryKey: ['/api/admin/enhanced-match-management/matches/completed', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (searchFilters.playerName.trim()) {
        params.append('playerName', searchFilters.playerName.trim());
      }
      if (searchFilters.eventName.trim()) {
        params.append('eventName', searchFilters.eventName.trim());
      }
      if (searchFilters.format !== 'all') {
        params.append('format', searchFilters.format);
      }
      if (searchFilters.dateFrom) {
        params.append('dateFrom', searchFilters.dateFrom);
      }
      if (searchFilters.dateTo) {
        params.append('dateTo', searchFilters.dateTo);
      }
      
      const response = await apiRequest('GET', `/api/admin/enhanced-match-management/matches/completed?${params.toString()}`);
      return response.json();
    }
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: any) => {
      const response = await apiRequest('POST', '/api/admin/match-management/competitions', competitionData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      setShowCreateCompetition(false);
      toast({
        title: "Competition Created",
        description: `Competition "${data.data?.name || 'New Competition'}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update match mutation (CRUD)
  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, updateData }: { matchId: number; updateData: any }) => {
      const response = await apiRequest('PUT', `/api/admin/enhanced-match-management/matches/${matchId}`, updateData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Match Updated Successfully",
        description: `Match #${data.matchId} has been updated and ranking points recalculated.`,
      });
      refetchCompletedMatches();
      setSelectedMatchForEdit(null);
      setEditMatchData({
        player1Score: '',
        player2Score: '',
        team1Score: '',
        team2Score: '',
        winnerId: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete match mutation (CRUD)
  const deleteMatchMutation = useMutation({
    mutationFn: async ({ matchId, reason }: { matchId: number; reason: string }) => {
      const response = await apiRequest('DELETE', `/api/admin/enhanced-match-management/matches/${matchId}`, { reason });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Match Deleted",
        description: `Match #${data.matchId} deleted and ranking points reversed.`,
      });
      refetchCompletedMatches();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed", 
        description: "Failed to delete match. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle competition creation
  const handleCreateCompetition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const competitionData = Object.fromEntries(formData.entries());

    // Convert numeric fields
    const processedData: any = { ...competitionData };
    if (processedData.maxParticipants) {
      processedData.maxParticipants = parseInt(processedData.maxParticipants as string);
    }
    if (processedData.entryFee) {
      processedData.entryFee = parseFloat(processedData.entryFee as string);
    }
    if (processedData.pointsMultiplier) {
      processedData.pointsMultiplier = parseFloat(processedData.pointsMultiplier as string);
    }

    createCompetitionMutation.mutate(processedData);
  };

  // Handle match update
  const handleUpdateMatch = () => {
    if (!selectedMatchForEdit?.id) return;
    
    const payload: any = Object.fromEntries(
      Object.entries(editMatchData).filter(([_, v]) => v !== '')
    );
    
    // Convert string numbers to integers  
    if (payload.player1Score) payload.player1Score = parseInt(payload.player1Score as string);
    if (payload.player2Score) payload.player2Score = parseInt(payload.player2Score as string);
    if (payload.team1Score) payload.team1Score = parseInt(payload.team1Score as string);
    if (payload.team2Score) payload.team2Score = parseInt(payload.team2Score as string);
    if (payload.winnerId) payload.winnerId = parseInt(payload.winnerId as string);
    
    updateMatchMutation.mutate({ matchId: selectedMatchForEdit.id, updateData: payload });
  };

  // Handle match deletion (CRUD)
  const handleDeleteMatch = (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match? This will reverse all ranking points.')) {
      return;
    }
    
    deleteMatchMutation.mutate({ 
      matchId, 
      reason: 'Deleted via admin match management interface' 
    });
  };

  // Load match details for editing
  const loadMatchForEdit = async (match: any) => {
    try {
      const response = await apiRequest('GET', `/api/admin/enhanced-match-management/matches/${match.id}/details`);
      const data = await response.json();
      
      setSelectedMatchForEdit(data);
      setEditMatchData({
        player1Score: data.match?.player1Score?.toString() || '',
        player2Score: data.match?.player2Score?.toString() || '',
        team1Score: data.match?.team1Score?.toString() || '',
        team2Score: data.match?.team2Score?.toString() || '',
        winnerId: '',
        notes: data.match?.notes || ''
      });
    } catch (error) {
      toast({
        title: "Error Loading Match",
        description: "Failed to load match details for editing.",
        variant: "destructive",
      });
    }
  };

  const formatCompetitionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatMatchFormat = (format: string) => {
    return format.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatAgeGroup = (ageGroup: string) => {
    return ageGroup.replace('_', '-');
  };

  if (competitionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
          <p className="text-muted-foreground">
            Manage competitions, leagues, tournaments, and ranking point allocation
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/admin/bulk-upload">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Dialog open={showCreateCompetition} onOpenChange={setShowCreateCompetition}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Competition</DialogTitle>
                <DialogDescription>
                  Set up a new league, tournament, or casual match series
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCompetition} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Competition Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league">League</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input id="maxParticipants" name="maxParticipants" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee</Label>
                    <Input id="entryFee" name="entryFee" type="number" step="0.01" defaultValue="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsMultiplier">Points Multiplier</Label>
                    <Input id="pointsMultiplier" name="pointsMultiplier" type="number" step="0.01" defaultValue="1.00" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateCompetition(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCompetitionMutation.isPending}>
                    {createCompetitionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Competition
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="record-match">Record Match</TabsTrigger>
          <TabsTrigger value="matches">View Matches</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">All Competitions</h3>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage all competitions in the system
              </p>
            </div>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] })} disabled={competitionsLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {competitionsLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!competitionsLoading && (!competitions?.data || competitions.data.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitions Found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  No competitions have been created yet. Create your first competition to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {!competitionsLoading && competitions?.data && competitions.data.length > 0 && (
            <div className="grid gap-4">
              {competitions.data.map((competition: any) => (
                <Card key={competition.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{competition.name}</CardTitle>
                        <CardDescription>
                          {formatCompetitionType(competition.type)} • Created: {new Date(competition.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={competition.status === 'active' ? 'default' : 'secondary'}>
                          {competition.status || 'draft'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Start: {competition.startDate ? new Date(competition.startDate).toLocaleDateString() : 'Not set'}</div>
                        <div>End: {competition.endDate ? new Date(competition.endDate).toLocaleDateString() : 'Not set'}</div>
                        <div>Participants: {competition.maxParticipants || 'Unlimited'}</div>
                        <div>Entry Fee: ${competition.entryFee || '0.00'}</div>
                        <div>Points Multiplier: {competition.pointsMultiplier || '1.0'}x</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('Edit competition:', competition.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => console.log('View matches for competition:', competition.id)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View Matches
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => console.log('Delete competition:', competition.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="record-match" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Record New Match</h3>
              <p className="text-sm text-muted-foreground">
                Use the same match recorder that players use, with enhanced admin capabilities for tournament linking and manual point overrides
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <QuickMatchRecorderStreamlined 
                isAdminMode={true}
                onSuccess={(matchData) => {
                  toast({
                    title: "Match Recorded Successfully", 
                    description: "The match has been recorded and points have been allocated.",
                  });
                  // Refresh the matches list
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-match-management/matches/completed'] });
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">All Matches</h3>
              <p className="text-sm text-muted-foreground">
                View all completed matches with detailed player information, competition context, and algorithm-based points breakdown
              </p>
            </div>
            <Button onClick={() => refetchCompletedMatches()} disabled={completedMatchesLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Enhanced Filtering Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search & Filter Matches</CardTitle>
              <CardDescription>Filter matches by player names, competitions, formats, and dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Search by player name..."
                    value={searchFilters.playerName}
                    onChange={(e) => setSearchFilters(prev => ({...prev, playerName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventName">Competition/Event</Label>
                  <Input
                    id="eventName"
                    placeholder="Search by event name..."
                    value={searchFilters.eventName}
                    onChange={(e) => setSearchFilters(prev => ({...prev, eventName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Match Format</Label>
                  <Select value={searchFilters.format} onValueChange={(value) => setSearchFilters(prev => ({...prev, format: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All formats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                      <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={searchFilters.dateFrom}
                    onChange={(e) => setSearchFilters(prev => ({...prev, dateFrom: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={searchFilters.dateTo}
                    onChange={(e) => setSearchFilters(prev => ({...prev, dateTo: e.target.value}))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSearchFilters({
                    playerName: '',
                    eventName: '',
                    format: 'all',
                    dateFrom: '',
                    dateTo: ''
                  })}
                >
                  Clear Filters
                </Button>
                <Button onClick={() => refetchCompletedMatches()}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {completedMatchesLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!completedMatchesLoading && (!completedMatches?.matches || completedMatches.matches.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  No matches found. Matches will appear here after they are created and scheduled.
                </p>
              </CardContent>
            </Card>
          )}

          {!completedMatchesLoading && completedMatches?.matches && completedMatches.matches.length > 0 && (
            <div className="grid gap-6">
              {completedMatches.matches.map((match: any) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-blue-600" />
                          Match #{match.id} - {match.eventName || 'Unknown Event'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {formatMatchFormat(match.format)} • {new Date(match.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold text-xl text-blue-600">
                            {match.scorePlayerOne || 0}-{match.scorePlayerTwo || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Team-Based Player Results with Enhanced Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Match Teams & Points Allocation (Algorithm: System B - 3 points win, 1 point loss)
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team 1 */}
                        {match.team1 && match.team1.length > 0 && (
                          <div className={`p-4 rounded-lg border-2 ${
                            match.team1[0]?.isWinner ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-lg">Team 1</h5>
                              {match.team1[0]?.isWinner && (
                                <Badge className="bg-green-600 text-white">Winners</Badge>
                              )}
                            </div>
                            <div className="space-y-3">
                              {match.team1.map((player: any, index: number) => (
                                <div key={`team1-${player.playerId}-${index}`} className="bg-white p-3 rounded-md border">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-blue-700">{player.playerName}</div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div>Gender: {player.gender} • Age: {player.age}</div>
                                        <div>Category: {player.genderCategory} {player.ageCategory}</div>
                                        <div className="text-xs text-blue-600">{player.teamPosition}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg text-green-600">
                                        +{player.pointsAwarded} pts
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Base: {player.basePoints}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Team 2 */}
                        {match.team2 && match.team2.length > 0 && (
                          <div className={`p-4 rounded-lg border-2 ${
                            match.team2[0]?.isWinner ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-lg">Team 2</h5>
                              {match.team2[0]?.isWinner && (
                                <Badge className="bg-green-600 text-white">Winners</Badge>
                              )}
                            </div>
                            <div className="space-y-3">
                              {match.team2.map((player: any, index: number) => (
                                <div key={`team2-${player.playerId}-${index}`} className="bg-white p-3 rounded-md border">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-purple-700">{player.playerName}</div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div>Gender: {player.gender} • Age: {player.age}</div>
                                        <div>Category: {player.genderCategory} {player.ageCategory}</div>
                                        <div className="text-xs text-purple-600">{player.teamPosition}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg text-green-600">
                                        +{player.pointsAwarded} pts
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Base: {player.basePoints}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Details Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Match Info</div>
                        <div>Format: {formatMatchFormat(match.format)}</div>
                        <div>Players: {match.playerResults?.length || 0}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Competition</div>
                        <div>Event: {match.eventName || 'Unknown Event'}</div>
                        <div>Date: {new Date(match.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Points Summary</div>
                        <div>Total Awarded: {match.playerResults?.reduce((sum: number, p: any) => sum + p.pointsAwarded, 0) || 0} points</div>
                        <div>Algorithm: System B (3/1)</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadMatchForEdit(match)}
                        disabled={updateMatchMutation.isPending}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Match
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteMatch(match.id)}
                        disabled={deleteMatchMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulk-upload" className="space-y-4">
          <BulkUploadTab />
        </TabsContent>

        {/* Edit Match Dialog */}
        <Dialog open={!!selectedMatchForEdit} onOpenChange={() => setSelectedMatchForEdit(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Match #{selectedMatchForEdit?.match?.id}</DialogTitle>
              <DialogDescription>
                Update match scores and details. Points will be automatically recalculated.
              </DialogDescription>
            </DialogHeader>
            
            {selectedMatchForEdit && (
              <div className="space-y-6">
                {/* Match Info Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Match Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Competition: {selectedMatchForEdit.match?.competitionName}</div>
                    <div>Status: <Badge>{selectedMatchForEdit.match?.status}</Badge></div>
                    <div>Format: {formatMatchFormat(selectedMatchForEdit.match?.format || 'singles')}</div>
                    <div>Age Group: {formatAgeGroup(selectedMatchForEdit.match?.ageGroup || '30_39')}</div>
                  </div>
                </div>

                {/* Player Results Display */}
                {selectedMatchForEdit.playerResults && selectedMatchForEdit.playerResults.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Player Results ({selectedMatchForEdit.playerResults.length})</h4>
                    <div className="space-y-1">
                      {selectedMatchForEdit.playerResults.map((result: any) => (
                        <div key={result.id} className="flex justify-between text-sm">
                          <span>
                            {result.playerName}
                            {result.isWinner && <Badge className="ml-2" variant="default">Winner</Badge>}
                          </span>
                          <span className="font-medium">{result.pointsAwarded} points</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                <div className="space-y-4">
                  <h4 className="font-medium">Update Match Scores</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Player 1 Score</Label>
                      <Input
                        type="number"
                        placeholder="Enter score"
                        value={editMatchData.player1Score}
                        onChange={(e) => setEditMatchData(prev => ({...prev, player1Score: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Player 2 Score</Label>
                      <Input
                        type="number"
                        placeholder="Enter score"
                        value={editMatchData.player2Score}
                        onChange={(e) => setEditMatchData(prev => ({...prev, player2Score: e.target.value}))}
                      />
                    </div>
                  </div>

                  {selectedMatchForEdit.match?.format?.includes('doubles') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Team 1 Score</Label>
                        <Input
                          type="number"
                          placeholder="Enter team score"
                          value={editMatchData.team1Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, team1Score: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Team 2 Score</Label>
                        <Input
                          type="number"
                          placeholder="Enter team score"
                          value={editMatchData.team2Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, team2Score: e.target.value}))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any notes about the match update..."
                      value={editMatchData.notes}
                      onChange={(e) => setEditMatchData(prev => ({...prev, notes: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMatchForEdit(null)}
                    disabled={updateMatchMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateMatch}
                    disabled={updateMatchMutation.isPending}
                  >
                    {updateMatchMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating & Recalculating...
                      </>
                    ) : (
                      'Update Match & Recalculate Points'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default MatchManagement;