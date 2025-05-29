/**
 * PKL-278651-TOURN-0015-ADMIN - Tournament Admin Dashboard
 * 
 * Optimized tournament administration interface for desktop viewing
 * with improved spacing and column organization
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar as CalendarIcon, Users, Trophy, Settings, Trash2, Edit, Copy, Eye, BarChart3, Target, GitBranch, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import tournament creation forms
import CreateTournamentForm from './CreateTournamentForm';
import CreateMultiEventTournamentForm from './CreateMultiEventTournamentForm';

// Tournament interfaces
interface Tournament {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  level: 'club' | 'district' | 'city' | 'provincial' | 'national' | 'regional' | 'international';
  format: string;
  division: string;
  category: string;
  venue?: string;
  registeredPlayers?: number;
  maxPlayers?: number;
  entryFee?: number;
  status?: string;
  isActive?: boolean;
  isTeamTournament?: boolean;
  registeredTeams?: number;
}

interface ParentTournament {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  level: string;
  venue?: string;
  subTournaments?: Tournament[];
}

export default function TournamentAdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTournamentType, setCreateTournamentType] = useState<'single' | 'multi-event' | 'team'>('single');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tournaments');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch parent tournaments for multi-event view
  const { data: parentTournaments = [], isLoading: parentTournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments/parent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tournaments');
      const data = await response.json();
      return Array.isArray(data) ? data.filter((t: any) => !t.parentTournamentId) : [];
    }
  });

  // Delete tournament mutation
  const deleteTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      await apiRequest('DELETE', `/api/tournaments/${tournamentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament Deleted",
        description: "The tournament has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete tournament",
        variant: "destructive",
      });
    }
  });

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getTournamentLevelBadgeVariant = (level: string) => {
    const variants: Record<string, any> = {
      club: 'secondary',
      district: 'outline',
      city: 'default',
      provincial: 'secondary',
      national: 'destructive',
      regional: 'destructive',
      international: 'destructive'
    };
    return variants[level] || 'default';
  };

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <Card className="relative hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl font-semibold">{tournament.name}</CardTitle>
            {tournament.description && (
              <CardDescription className="text-sm line-clamp-2">
                {tournament.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={getTournamentLevelBadgeVariant(tournament.level)} className="text-xs">
              {tournament.level.charAt(0).toUpperCase() + tournament.level.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tournament
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => deleteTournamentMutation.mutate(tournament.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dates</div>
            <div className="font-medium">
              {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Format</div>
            <div className="font-medium">{tournament.format}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Division</div>
            <div className="font-medium">{tournament.division}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</div>
            <div className="font-medium">{tournament.category}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Venue</div>
            <div className="font-medium">{tournament.venue || 'TBD'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Players</div>
            <div className="font-medium">
              {tournament.isTeamTournament 
                ? `${tournament.registeredTeams || 0} teams`
                : `${tournament.registeredPlayers || 0}/${tournament.maxPlayers || '∞'} players`
              }
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entry Fee</div>
            <div className="font-medium">
              {tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              tournament.status === 'active' ? 'bg-green-500' : 
              tournament.status === 'upcoming' ? 'bg-blue-500' : 
              tournament.status === 'completed' ? 'bg-gray-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium capitalize">
              {tournament.status || 'Draft'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ParentTournamentCard = ({ parentTournament }: { parentTournament: ParentTournament }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">{parentTournament.name}</CardTitle>
            <CardDescription className="text-base">
              {parentTournament.description || 'Multi-event tournament'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {parentTournament.subTournaments?.length || 0} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dates</div>
            <div className="font-medium text-base">
              {formatDate(parentTournament.startDate)} - {formatDate(parentTournament.endDate)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Level</div>
            <div className="font-medium text-base capitalize">{parentTournament.level}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Venue</div>
            <div className="font-medium text-base">{parentTournament.venue || 'TBD'}</div>
          </div>
        </div>

        {parentTournament.subTournaments && parentTournament.subTournaments.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sub-Tournaments</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {parentTournament.subTournaments.map((subTournament) => (
                <div key={subTournament.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{subTournament.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {subTournament.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {subTournament.division}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {subTournament.isTeamTournament 
                      ? `${subTournament.registeredTeams || 0} teams`
                      : `${subTournament.registeredPlayers || 0} players`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" className="px-4">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="px-4">
            <Edit className="w-4 h-4 mr-2" />
            Edit Tournament
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (tournamentsLoading || parentTournamentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-8 py-8 max-w-[1600px]">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Tournament Administration</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create and manage tournaments, including multi-event and team tournaments with comprehensive tracking and analytics
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-6">
                <Plus className="w-5 h-5 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Choose Tournament Type</DialogTitle>
                <DialogDescription className="text-base">
                  Select the type of tournament you want to create
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4">
                  <Button
                    variant={createTournamentType === 'single' ? 'default' : 'outline'}
                    className="justify-start h-auto p-6 text-left"
                    onClick={() => setCreateTournamentType('single')}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-base">Single Tournament</div>
                      <div className="text-sm text-muted-foreground">
                        Create a standard individual tournament with one format
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={createTournamentType === 'multi-event' ? 'default' : 'outline'}
                    className="justify-start h-auto p-6 text-left"
                    onClick={() => setCreateTournamentType('multi-event')}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-base">Multi-Event Tournament</div>
                      <div className="text-sm text-muted-foreground">
                        Create a tournament with multiple divisions and categories
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={createTournamentType === 'team' ? 'default' : 'outline'}
                    className="justify-start h-auto p-6 text-left"
                    onClick={() => setCreateTournamentType('team')}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-base">Team Tournament</div>
                      <div className="text-sm text-muted-foreground">
                        Create a tournament for team-based competition
                      </div>
                    </div>
                  </Button>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsCreateFormOpen(true);
                  }}>
                    Continue
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-6">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-4 h-12">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="overview" className="flex items-center gap-2 px-6">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tournament statistics and overview</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="individual" className="flex items-center gap-2 px-6">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Individual</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Single tournament management</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="multi-event" className="flex items-center gap-2 px-6">
                    <GitBranch className="w-4 h-4" />
                    <span className="hidden sm:inline">Multi-Event</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Multi-event tournament management</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="team" className="flex items-center gap-2 px-6">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Team</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Team tournament management</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tournaments.length}</div>
                  <p className="text-xs text-muted-foreground">Active tournaments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tournaments.reduce((acc, t) => acc + (t.registeredPlayers || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Registered players</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tournaments.filter(t => t.status === 'upcoming').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Starting soon</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${tournaments.reduce((acc, t) => acc + ((t.entryFee || 0) * (t.registeredPlayers || 0)), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Total entry fees</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Tournaments</CardTitle>
                <CardDescription>Overview of all tournament activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {tournaments.slice(0, 6).map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {tournaments.filter(t => !t.isTeamTournament).map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="multi-event" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {parentTournaments.map((parentTournament) => (
                <ParentTournamentCard key={parentTournament.id} parentTournament={parentTournament} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {tournaments.filter(t => t.isTeamTournament).map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tournament Creation Form Dialog */}
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Create {createTournamentType === 'single' ? 'Individual' : 
                        createTournamentType === 'multi-event' ? 'Multi-Event' : 'Team'} Tournament
              </DialogTitle>
              <DialogDescription>
                Fill out the form below to create your tournament
              </DialogDescription>
            </DialogHeader>
            
            {createTournamentType === 'single' && (
              <CreateTournamentForm 
                onSuccess={() => {
                  setIsCreateFormOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
                }}
                onCancel={() => setIsCreateFormOpen(false)}
              />
            )}
            
            {createTournamentType === 'multi-event' && (
              <CreateMultiEventTournamentForm 
                onSuccess={() => {
                  setIsCreateFormOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
                }}
                onCancel={() => setIsCreateFormOpen(false)}
              />
            )}
            
            {createTournamentType === 'team' && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Team tournament creation wizard coming soon!</p>
                <Button variant="outline" onClick={() => setIsCreateFormOpen(false)} className="mt-4">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}