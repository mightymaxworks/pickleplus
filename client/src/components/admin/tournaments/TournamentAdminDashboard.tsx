/**
 * PKL-278651-TOURN-0015-ADMIN - Tournament Admin Dashboard
 * 
 * Comprehensive tournament creation and management interface for administrators
 * Supports multi-event tournaments, team tournaments, and individual tournaments
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  maxParticipants?: number;
  registrationOpen: boolean;
  registrationDeadline?: Date;
  venue?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Parent tournament info for multi-event tournaments
  parentTournamentId?: number;
  isSubEvent?: boolean;
  // Team tournament info
  isTeamTournament: boolean;
  teamSize?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  // Registration counts
  registeredPlayers?: number;
  registeredTeams?: number;
}

interface ParentTournament {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venue?: string;
  level: string;
  isActive: boolean;
  subTournaments: Tournament[];
}

export default function TournamentAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createTournamentType, setCreateTournamentType] = useState<'single' | 'multi-event' | 'team'>('single');
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    format: '',
    category: '',
    division: '',
    startDate: '',
    endDate: '',
    venue: '',
    maxParticipants: '',
    registrationDeadline: ''
  });
  
  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tournaments');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: any) => {
      const res = await apiRequest('POST', '/api/tournaments', tournamentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      setIsCreateFormOpen(false);
      setFormStep(1);
      setFormData({
        name: '', description: '', level: '', format: '', category: '', 
        division: '', startDate: '', endDate: '', venue: '', maxParticipants: '', registrationDeadline: ''
      });
      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message || "Failed to create tournament. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch parent tournaments for multi-event view
  const { data: parentTournaments = [], isLoading: parentTournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments/parent'],
    queryFn: async () => {
      // For now, filter tournaments that might be parent tournaments
      const response = await apiRequest('GET', '/api/tournaments');
      const data = await response.json();
      return Array.isArray(data) ? data.filter((t: any) => !t.parentTournamentId) : [];
    }
  });

  // Delete tournament mutation
  const deleteTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      await apiRequest('DELETE', `/api/enhanced-tournaments/${tournamentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-tournaments'] });
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

  // Toggle tournament status mutation
  const toggleTournamentMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest('PATCH', `/api/enhanced-tournaments/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-tournaments'] });
      toast({
        title: "Tournament Updated",
        description: "Tournament status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update tournament",
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
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{tournament.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {tournament.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={getTournamentLevelBadgeVariant(tournament.level)}>
              {tournament.level}
            </Badge>
            {tournament.isTeamTournament && (
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                Team
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Format</Label>
            <p className="font-medium">{tournament.format}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Division</Label>
            <p className="font-medium">{tournament.division}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <p className="font-medium">{tournament.category}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Participants</Label>
            <p className="font-medium">
              {tournament.isTeamTournament 
                ? `${tournament.registeredTeams || 0} teams`
                : `${tournament.registeredPlayers || 0} players`
              }
              {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
          </div>
          {tournament.venue && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span>{tournament.venue}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={tournament.isActive}
              onCheckedChange={(checked) => 
                toggleTournamentMutation.mutate({ id: tournament.id, isActive: checked })
              }
            />
            <Label className="text-sm">
              {tournament.isActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{tournament.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteTournamentMutation.mutate(tournament.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ParentTournamentCard = ({ parentTournament }: { parentTournament: ParentTournament }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{parentTournament.name}</CardTitle>
            <CardDescription className="mt-1">
              {parentTournament.description || 'Multi-event tournament'}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {parentTournament.subTournaments?.length || 0} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Dates</Label>
            <p className="font-medium">
              {formatDate(parentTournament.startDate)} - {formatDate(parentTournament.endDate)}
            </p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Level</Label>
            <p className="font-medium">{parentTournament.level}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Venue</Label>
            <p className="font-medium">{parentTournament.venue || 'TBD'}</p>
          </div>
        </div>

        {parentTournament.subTournaments && parentTournament.subTournaments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sub-Tournaments</Label>
            <div className="grid grid-cols-1 gap-2">
              {parentTournament.subTournaments.map((subTournament) => (
                <div key={subTournament.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{subTournament.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {subTournament.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {subTournament.division}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
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

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournament Administration</h1>
          <p className="text-muted-foreground">
            Create and manage tournaments, including multi-event and team tournaments
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Tournament Type</DialogTitle>
              <DialogDescription>
                Select the type of tournament you want to create
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3">
                <Button
                  variant={createTournamentType === 'single' ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => setCreateTournamentType('single')}
                >
                  <div className="text-left">
                    <div className="font-medium">Single Tournament</div>
                    <div className="text-sm text-muted-foreground">
                      Create a standard individual tournament
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={createTournamentType === 'multi-event' ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => setCreateTournamentType('multi-event')}
                >
                  <div className="text-left">
                    <div className="font-medium">Multi-Event Tournament</div>
                    <div className="text-sm text-muted-foreground">
                      Create a tournament with multiple divisions and categories
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={createTournamentType === 'team' ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => setCreateTournamentType('team')}
                >
                  <div className="text-left">
                    <div className="font-medium">Team Tournament</div>
                    <div className="text-sm text-muted-foreground">
                      Create a tournament for team-based competition
                    </div>
                  </div>
                </Button>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TooltipProvider>
          <TabsList className="grid w-full grid-cols-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="overview" className="flex items-center gap-2">
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
                <TabsTrigger value="individual" className="flex items-center gap-2">
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
                <TabsTrigger value="multi-event" className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Multi-Event</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Complex tournaments with multiple divisions and categories</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Team-based tournament management</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tournaments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active and inactive tournaments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tournaments.filter(t => t.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently accepting registrations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tournaments.reduce((total, t) => 
                    total + (t.registeredPlayers || 0) + (t.registeredTeams || 0), 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Players and teams registered
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Tournaments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.slice(0, 6).map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Individual Tournaments</h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Individual Tournament
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments
              .filter(t => !t.isTeamTournament && !t.isSubEvent)
              .map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="multi-event" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Multi-Event Tournaments</h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Multi-Event Tournament
            </Button>
          </div>
          <div className="space-y-4">
            {parentTournaments.map(parentTournament => (
              <ParentTournamentCard key={parentTournament.id} parentTournament={parentTournament} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Tournaments</h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Team Tournament
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments
              .filter(t => t.isTeamTournament)
              .map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tournament Creation Form Dialog */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create {createTournamentType === 'single' ? 'Single' : 
                     createTournamentType === 'multi-event' ? 'Multi-Event' : 'Team'} Tournament
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to create your tournament
            </DialogDescription>
          </DialogHeader>
          
          {createTournamentType === 'single' && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      formStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {step === 1 ? 'Basic Info' : step === 2 ? 'Tournament Details' : 'Schedule & Settings'}
                    </span>
                    {step < 3 && <div className="w-12 h-px bg-muted mx-4" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tournament Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter tournament name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Tournament description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Tournament Level</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="club">Club (1.2x)</SelectItem>
                          <SelectItem value="district">District (1.5x)</SelectItem>
                          <SelectItem value="city">City (1.8x)</SelectItem>
                          <SelectItem value="provincial">Provincial (2.0x)</SelectItem>
                          <SelectItem value="national">National (2.5x)</SelectItem>
                          <SelectItem value="regional">Regional (3.0x)</SelectItem>
                          <SelectItem value="international">International (4.0x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input 
                        id="venue" 
                        placeholder="Tournament venue"
                        value={formData.venue}
                        onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Tournament Details */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Tournament Format</Label>
                      <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elimination">Single Elimination</SelectItem>
                          <SelectItem value="double-elimination">Double Elimination</SelectItem>
                          <SelectItem value="round-robin">Round Robin</SelectItem>
                          <SelectItem value="swiss">Swiss System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="singles">Singles</SelectItem>
                          <SelectItem value="doubles">Doubles</SelectItem>
                          <SelectItem value="mixed">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="division">Age Division</Label>
                      <Select value={formData.division} onValueChange={(value) => setFormData({...formData, division: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open (19+)</SelectItem>
                          <SelectItem value="35plus">35+</SelectItem>
                          <SelectItem value="50plus">50+</SelectItem>
                          <SelectItem value="65plus">65+</SelectItem>
                          <SelectItem value="junior">Junior (18 & Under)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input 
                        id="maxParticipants" 
                        type="number"
                        placeholder="32"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule & Settings */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" 
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input 
                      id="registrationDeadline" 
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                    />
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Tournament Summary</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Name:</span> {formData.name || 'Not specified'}</p>
                      <p><span className="font-medium">Level:</span> {formData.level || 'Not specified'}</p>
                      <p><span className="font-medium">Format:</span> {formData.format || 'Not specified'}</p>
                      <p><span className="font-medium">Category:</span> {formData.category || 'Not specified'}</p>
                      <p><span className="font-medium">Division:</span> {formData.division || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div>
                  {formStep > 1 && (
                    <Button variant="outline" onClick={() => setFormStep(formStep - 1)}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateFormOpen(false);
                    setFormStep(1);
                    setFormData({
                      name: '', description: '', level: '', format: '', category: '', 
                      division: '', startDate: '', endDate: '', venue: '', maxParticipants: '', registrationDeadline: ''
                    });
                  }}>
                    Cancel
                  </Button>
                  {formStep < 3 ? (
                    <Button onClick={() => setFormStep(formStep + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        // Prepare tournament data for database
                        const tournamentData = {
                          name: formData.name,
                          description: formData.description,
                          location: formData.venue,
                          level: formData.level,
                          format: formData.format,
                          category: formData.category,
                          division: formData.division,
                          startDate: new Date(formData.startDate).toISOString(),
                          endDate: new Date(formData.endDate).toISOString(),
                          registrationEndDate: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
                          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                          status: 'upcoming'
                        };
                        
                        // Submit to database
                        createTournamentMutation.mutate(tournamentData);
                      }}
                      disabled={createTournamentMutation.isPending}
                    >
                      {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {createTournamentType === 'multi-event' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Multi-event tournament creation wizard coming soon!</p>
            </div>
          )}
          
          {createTournamentType === 'team' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Team tournament creation wizard coming soon!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}