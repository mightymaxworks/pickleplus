import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Match {
  id: number;
  competitionId: number;
  competitionName: string;
  player1Score: number;
  player2Score: number;
  team1Score: number;
  team2Score: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PlayerResult {
  id: number;
  playerId: number;
  playerName: string;
  username: string;
  pointsAwarded: number;
  isWinner: boolean;
}

interface MatchDetails {
  match: Match;
  playerResults: PlayerResult[];
}

export default function AdminMatchCRUD() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [updateData, setUpdateData] = useState({
    player1Score: '',
    player2Score: '',
    team1Score: '',
    team2Score: '',
    winnerId: '',
    notes: ''
  });
  const { toast } = useToast();

  // Load completed matches
  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/admin/enhanced-match-management/matches/completed?page=${page}&limit=10`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      toast({
        title: 'Error Loading Matches',
        description: 'Failed to load completed matches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load match details
  const loadMatchDetails = async (matchId: number) => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/admin/enhanced-match-management/matches/${matchId}/details`);
      const data = await response.json();
      setSelectedMatch(data);
      
      // Pre-populate edit form
      if (data.match) {
        setUpdateData({
          player1Score: data.match.player1Score?.toString() || '',
          player2Score: data.match.player2Score?.toString() || '',
          team1Score: data.match.team1Score?.toString() || '',
          team2Score: data.match.team2Score?.toString() || '',
          winnerId: '',
          notes: data.match.notes || ''
        });
      }
    } catch (error) {
      toast({
        title: 'Error Loading Match Details',
        description: 'Failed to load match details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update match
  const updateMatch = async () => {
    if (!selectedMatch) return;
    
    try {
      setLoading(true);
      const payload = {
        ...Object.fromEntries(
          Object.entries(updateData).filter(([_, v]) => v !== '')
        )
      };
      
      // Convert string numbers to integers
      if (payload.player1Score) payload.player1Score = parseInt(payload.player1Score);
      if (payload.player2Score) payload.player2Score = parseInt(payload.player2Score);
      if (payload.team1Score) payload.team1Score = parseInt(payload.team1Score);
      if (payload.team2Score) payload.team2Score = parseInt(payload.team2Score);
      if (payload.winnerId) payload.winnerId = parseInt(payload.winnerId);
      
      const response = await apiRequest('PATCH', `/api/admin/enhanced-match-management/matches/${selectedMatch.match.id}/update`, payload);
      const data = await response.json();
      
      toast({
        title: 'Match Updated Successfully',
        description: data.message || 'Match has been updated with new scores and points recalculated'
      });
      
      setEditMode(false);
      await loadMatchDetails(selectedMatch.match.id);
      await loadMatches();
      
    } catch (error) {
      toast({
        title: 'Error Updating Match',
        description: 'Failed to update match',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete match
  const deleteMatch = async (matchId: number, reason: string = '') => {
    if (!confirm('Are you sure you want to delete this match? This will reverse all points.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiRequest('DELETE', `/api/admin/enhanced-match-management/matches/${matchId}`, { reason });
      const data = await response.json();
      
      toast({
        title: 'Match Deleted Successfully',
        description: `${data.message} - ${data.pointsReversed} player results removed`
      });
      
      setSelectedMatch(null);
      await loadMatches();
      
    } catch (error) {
      toast({
        title: 'Error Deleting Match',
        description: 'Failed to delete match',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [page]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Match CRUD Testing</h1>
        <Button onClick={loadMatches} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Completed Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading && <div className="text-center text-gray-500">Loading matches...</div>}
              
              {matches.length === 0 && !loading && (
                <div className="text-center text-gray-500 py-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  No completed matches found
                </div>
              )}
              
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Match #{match.id}</div>
                    <Badge variant="secondary">{match.status}</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>Competition: {match.competitionName}</div>
                    <div>Score: {match.player1Score}-{match.player2Score}</div>
                    <div>Updated: {new Date(match.updatedAt).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => loadMatchDetails(match.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Match Details & Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Match Details & Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedMatch && (
              <div className="text-center text-gray-500 py-8">
                Select a match to view details and perform operations
              </div>
            )}
            
            {selectedMatch && (
              <div className="space-y-4">
                {/* Match Info */}
                <div className="border rounded-lg p-3">
                  <h3 className="font-medium mb-2">Match Information</h3>
                  <div className="text-sm space-y-1">
                    <div>ID: {selectedMatch.match.id}</div>
                    <div>Competition: {selectedMatch.match.competitionName}</div>
                    <div>Status: <Badge>{selectedMatch.match.status}</Badge></div>
                    <div>Created: {new Date(selectedMatch.match.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {/* Player Results */}
                <div className="border rounded-lg p-3">
                  <h3 className="font-medium mb-2">Player Results ({selectedMatch.playerResults.length})</h3>
                  <div className="space-y-2">
                    {selectedMatch.playerResults.map((result) => (
                      <div key={result.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{result.playerName}</span>
                          {result.isWinner && <Badge variant="default" className="ml-2">Winner</Badge>}
                        </div>
                        <div className="text-right">
                          <div>{result.pointsAwarded} points</div>
                          <div className="text-xs text-gray-500">ID: {result.playerId}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Controls */}
                {!editMode && (
                  <div className="flex gap-2">
                    <Button onClick={() => setEditMode(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Match
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => deleteMatch(selectedMatch.match.id, 'Testing deletion via admin interface')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Match
                    </Button>
                  </div>
                )}

                {/* Edit Form */}
                {editMode && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-medium">Update Match</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Player 1 Score</Label>
                        <Input 
                          type="number"
                          value={updateData.player1Score}
                          onChange={(e) => setUpdateData(prev => ({...prev, player1Score: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Player 2 Score</Label>
                        <Input 
                          type="number"
                          value={updateData.player2Score}
                          onChange={(e) => setUpdateData(prev => ({...prev, player2Score: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Team 1 Score</Label>
                        <Input 
                          type="number"
                          value={updateData.team1Score}
                          onChange={(e) => setUpdateData(prev => ({...prev, team1Score: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Team 2 Score</Label>
                        <Input 
                          type="number"
                          value={updateData.team2Score}
                          onChange={(e) => setUpdateData(prev => ({...prev, team2Score: e.target.value}))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Winner Player ID</Label>
                      <Input 
                        type="number"
                        placeholder="Enter player ID of winner"
                        value={updateData.winnerId}
                        onChange={(e) => setUpdateData(prev => ({...prev, winnerId: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Add notes about this match update"
                        value={updateData.notes}
                        onChange={(e) => setUpdateData(prev => ({...prev, notes: e.target.value}))}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={updateMatch} disabled={loading}>
                        {loading ? 'Updating...' : 'Update & Recalculate Points'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Testing Info */}
      <Card>
        <CardHeader>
          <CardTitle>CRUD API Endpoints Being Tested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <div><strong>GET</strong> /api/admin/enhanced-match-management/matches/completed - List matches</div>
            <div><strong>GET</strong> /api/admin/enhanced-match-management/matches/:id/details - Match details</div>
            <div><strong>PATCH</strong> /api/admin/enhanced-match-management/matches/:id/update - Update match</div>
            <div><strong>DELETE</strong> /api/admin/enhanced-match-management/matches/:id - Delete match</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}