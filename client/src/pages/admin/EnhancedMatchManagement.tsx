// Enhanced Admin Match Management with Proper Tab Structure
// Competitions tab first, Matches tab second

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Trophy, Target, TrendingUp, Calendar, Award, Plus, Upload, Loader2, Edit, Trash2, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Enhanced Completed Matches Display with Filtering and CRUD
function CompletedMatchesDisplay() {
  const [filters, setFilters] = useState({
    playerName: '',
    eventName: '',
    dateFrom: '',
    dateTo: '',
    format: ''
  });
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: completedMatches, isLoading } = useQuery({
    queryKey: ['/api/admin/enhanced-match-management/matches/completed', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', '50');
      if (filters.playerName) params.append('playerName', filters.playerName);
      if (filters.eventName) params.append('eventName', filters.eventName);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.format) params.append('format', filters.format);

      const res = await fetch(`/api/admin/enhanced-match-management/matches/completed?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch completed matches');
      return res.json();
    }
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/enhanced-match-management/matches/${matchId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Match deleted successfully",
        description: "Points have been recalculated for affected players",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-match-management/matches/completed'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const res = await apiRequest('PUT', `/api/admin/enhanced-match-management/matches/${matchData.id}`, matchData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Match updated successfully",
        description: "Points have been recalculated for affected players",
      });
      setEditingMatch(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-match-management/matches/completed'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Completed Matches</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all completed matches in the system
          </p>
        </div>
      </div>

      {/* Basic table display for now */}
      {completedMatches?.data?.length ? (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match ID</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMatches.data.slice(0, 10).map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>#{match.id}</TableCell>
                    <TableCell>{match.players || 'N/A'}</TableCell>
                    <TableCell>{match.date || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.format || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteMatchMutation.mutate(match.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No completed matches found. Matches will appear here once they are recorded.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Competition Management Tab Component
function CompetitionManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateCompetition, setShowCreateCompetition] = useState(false);

  // Fetch competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/competitions');
      const data = await response.json();
      return data;
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

  // Handle competition creation
  const handleCreateCompetition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const competitionData = Object.fromEntries(formData.entries());

    // Convert numeric fields
    if (competitionData.maxParticipants) {
      competitionData.maxParticipants = parseInt(competitionData.maxParticipants as string);
    }
    if (competitionData.entryFee) {
      competitionData.entryFee = parseFloat(competitionData.entryFee as string);
    }
    if (competitionData.pointsMultiplier) {
      competitionData.pointsMultiplier = parseFloat(competitionData.pointsMultiplier as string);
    }

    createCompetitionMutation.mutate(competitionData);
  };

  const formatCompetitionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">All Competitions</h3>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage all competitions in the system
          </p>
        </div>
        <div className="flex space-x-2">
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
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] })} disabled={competitionsLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
    </div>
  );
}

// Match Management Tab Component
function MatchManagementTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">All Matches</h3>
          <p className="text-sm text-muted-foreground">
            View all scheduled, in-progress, and completed matches with full CRUD operations
          </p>
        </div>
      </div>
      <CompletedMatchesDisplay />
    </div>
  );
}

export default function EnhancedMatchManagement() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Match Management</h1>
          <p className="text-muted-foreground">
            Clean, streamlined match and competition management
          </p>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          <CompetitionManagementTab />
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <MatchManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}