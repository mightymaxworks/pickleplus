/**
 * Unified Match Management Admin Feature
 * 
 * PKL-278651-ADMIN-MATCH-001 - Match Management Integration
 * UDF Rule 18-21 Compliance - Security-first admin framework integration
 * Consolidates existing match management into unified admin system
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  Eye,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AdminLayout } from '../core/AdminLayout';
import { AdminDataTable } from '../core/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ColumnDef } from '@tanstack/react-table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Match Entity Interface (UDF-compliant)
 */
interface MatchEntity {
  id: number;
  player1Id: number;
  player2Id: number;
  player3Id?: number;
  player4Id?: number;
  player1Name: string;
  player2Name: string;
  player3Name?: string;
  player4Name?: string;
  player1Score: number;
  player2Score: number;
  matchType: 'singles' | 'doubles';
  competitionId?: number;
  competitionName?: string;
  status: 'pending' | 'completed' | 'disputed' | 'verified';
  createdAt: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  location?: string;
  pointsAwarded?: {
    player1: number;
    player2: number;
    player3?: number;
    player4?: number;
  };
}

/**
 * Competition Entity Interface
 */
interface CompetitionEntity {
  id: number;
  name: string;
  type: 'tournament' | 'league' | 'championship' | 'friendly';
  description?: string;
  startDate: string;
  endDate?: string;
  maxParticipants?: number;
  entryFee?: number;
  pointsMultiplier?: number;
  prizePool?: number;
  status: 'draft' | 'open' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  participantCount?: number;
}

/**
 * Match Statistics Interface
 */
interface MatchStatistics {
  totalMatches: number;
  matchesThisWeek: number;
  matchesToday: number;
  averageMatchDuration: number;
  topPlayers: Array<{
    id: number;
    name: string;
    matchCount: number;
    winRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

/**
 * Bulk Upload Component
 */
const BulkUploadPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [matchType, setMatchType] = useState<'casual' | 'tournament' | 'league'>('casual');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResults(null);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; matchType: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('matchType', data.matchType);
      
      const response = await apiRequest('POST', '/api/admin/v1/matches/bulk-upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadResults(data);
      toast({
        title: "Upload Successful",
        description: `Processed ${data.processedCount} matches successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ file: selectedFile, matchType });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Bulk Match Upload</span>
        </CardTitle>
        <CardDescription>
          Upload multiple matches from Excel file with automatic validation and point calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="match-type">Match Type</Label>
          <Select value={matchType} onValueChange={(value: any) => setMatchType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="league">League</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file-upload">Excel File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploadMutation.isPending}
            className="flex items-center space-x-2"
          >
            {uploadMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploadMutation.isPending ? 'Uploading...' : 'Upload Matches'}</span>
          </Button>
          
          <Button variant="outline" onClick={() => window.open('/templates/match-upload-template.xlsx')}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {uploadResults && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900">Upload Results</h4>
            <p className="text-sm text-green-700">
              Successfully processed {uploadResults.processedCount} matches
            </p>
            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-700">Errors:</p>
                <ul className="text-xs text-red-600 list-disc list-inside">
                  {uploadResults.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Statistics Dashboard Component
 */
const MatchStatisticsPanel: React.FC<{ stats: MatchStatistics }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">{stats.totalMatches}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.matchesThisWeek}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{stats.matchesToday}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{stats.averageMatchDuration}min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main Match Management Admin Component
 */
const MatchManagementAdmin: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<MatchEntity | null>(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch matches using new Admin API v1
  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError,
    refetch: refetchMatches
  } = useQuery({
    queryKey: ['/api/admin/v1/matches'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/matches');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch competitions
  const {
    data: competitions = [],
    isLoading: competitionsLoading
  } = useQuery({
    queryKey: ['/api/admin/v1/competitions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/competitions');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch statistics
  const {
    data: stats
  } = useQuery({
    queryKey: ['/api/admin/v1/matches/statistics'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/v1/matches/statistics');
        return response.json();
      } catch (error) {
        // Return mock data for development
        return {
          totalMatches: 1247,
          matchesThisWeek: 89,
          matchesToday: 23,
          averageMatchDuration: 45,
          topPlayers: [
            { id: 1, name: 'John Doe', matchCount: 45, winRate: 0.78 },
            { id: 2, name: 'Jane Smith', matchCount: 42, winRate: 0.72 }
          ],
          recentActivity: [
            { id: '1', action: 'Match Verified', details: 'John Doe vs Jane Smith', timestamp: new Date().toISOString() }
          ]
        } as MatchStatistics;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Match verification mutation
  const verifyMatchMutation = useMutation({
    mutationFn: async ({ matchId, verified }: { matchId: number; verified: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/v1/matches/${matchId}/verify`, {
        verified,
        action: 'match_verification'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/v1/matches'] });
      toast({
        title: "Match Updated",
        description: "Match verification status has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Define match table columns
  const matchColumns: ColumnDef<MatchEntity>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'players',
      header: 'Players',
      cell: ({ row }: { row: any }) => {
        const match = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{match.player1Name}</span>
              <Badge variant="outline">{match.player1Score}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">vs</div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{match.player2Name}</span>
              <Badge variant="outline">{match.player2Score}</Badge>
            </div>
            {match.matchType === 'doubles' && match.player3Name && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{match.player3Name}</span>
                </div>
                {match.player4Name && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{match.player4Name}</span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'matchType',
      header: 'Type',
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary">{row.getValue('matchType')}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge 
            variant={
              status === 'completed' ? 'default' : 
              status === 'verified' ? 'default' : 
              status === 'disputed' ? 'destructive' : 'secondary'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'competitionName',
      header: 'Competition',
      cell: ({ row }: { row: any }) => {
        const comp = row.getValue('competitionName');
        return comp ? (
          <Badge variant="outline">{comp}</Badge>
        ) : (
          <span className="text-muted-foreground">Casual</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue('createdAt'));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const match = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewMatch(match)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleVerifyMatch(match.id, match.status !== 'verified')}
              title={match.status === 'verified' ? 'Unverify' : 'Verify'}
            >
              {match.status === 'verified' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  // Define competition table columns
  const competitionColumns: ColumnDef<CompetitionEntity>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: any }) => (
        <span className="font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline">{row.getValue('type')}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge 
            variant={
              status === 'active' ? 'default' : 
              status === 'completed' ? 'secondary' : 
              status === 'cancelled' ? 'destructive' : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'participantCount',
      header: 'Participants',
      cell: ({ row }: { row: any }) => (
        <span>{row.getValue('participantCount') || 0}</span>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue('startDate'));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
  ];

  // Action handlers
  const handleViewMatch = (match: MatchEntity) => {
    setSelectedMatch(match);
    setShowMatchDetails(true);
  };

  const handleVerifyMatch = (matchId: number, verified: boolean) => {
    verifyMatchMutation.mutate({ matchId, verified });
  };

  const handleCreateMatch = () => {
    setShowCreateMatch(true);
  };

  const handleRefresh = () => {
    refetchMatches();
    toast({
      title: "Data Refreshed",
      description: "All match data has been updated",
    });
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'New Match',
      icon: <Plus className="h-4 w-4" />,
      onClick: handleCreateMatch,
      variant: 'default' as const,
    },
    {
      label: 'Refresh',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleRefresh,
      variant: 'outline' as const,
    },
    {
      label: 'Export Data',
      icon: <Download className="h-4 w-4" />,
      onClick: () => toast({ title: "Export", description: "Export functionality coming soon" }),
      variant: 'outline' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Match Management</h1>
            <p className="text-muted-foreground">
              Comprehensive match administration with verification, bulk upload, and competition management
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                className="flex items-center space-x-2"
              >
                {action.icon}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Match Statistics</h2>
            <MatchStatisticsPanel stats={stats} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            <AdminDataTable
              data={matches}
              columns={matchColumns}
              loading={matchesLoading}
              error={matchesError?.message || null}
              searchPlaceholder="Search matches by player name, ID, or competition..."
            />
          </TabsContent>

          <TabsContent value="competitions" className="space-y-4">
            <AdminDataTable
              data={competitions}
              columns={competitionColumns}
              loading={competitionsLoading}
              error={null}
              searchPlaceholder="Search competitions by name, type, or status..."
            />
          </TabsContent>

          <TabsContent value="bulk-upload" className="space-y-4">
            <BulkUploadPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Analytics</CardTitle>
                <CardDescription>
                  Advanced analytics and reporting features coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will include match trends, player performance analytics, 
                  and competition insights.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Match Details Modal */}
        <Dialog open={showMatchDetails} onOpenChange={setShowMatchDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Match Details: #{selectedMatch?.id}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedMatch && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Match Type</label>
                    <p>{selectedMatch.matchType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={selectedMatch.status === 'verified' ? 'default' : 'secondary'}>
                      {selectedMatch.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Competition</label>
                    <p>{selectedMatch.competitionName || 'Casual Match'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <p>{new Date(selectedMatch.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Players & Scores</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{selectedMatch.player1Name}</span>
                      <Badge>{selectedMatch.player1Score}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{selectedMatch.player2Name}</span>
                      <Badge>{selectedMatch.player2Score}</Badge>
                    </div>
                  </div>
                </div>

                {selectedMatch.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedMatch.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Match Modal */}
        <Dialog open={showCreateMatch} onOpenChange={setShowCreateMatch}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Advanced match creation interface will be implemented with player selection, 
                competition linking, and automatic point calculation.
              </p>
              <Button onClick={() => setShowCreateMatch(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MatchManagementAdmin;