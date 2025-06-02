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
    // Basic Information
    name: '',
    description: '',
    level: '',
    status: 'upcoming',
    
    // Venue Details
    location: '',
    venueAddress: '',
    numberOfCourts: 4,
    courtSurface: 'indoor',
    parkingInfo: '',
    
    // Date & Time
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    checkInTime: '08:00',
    
    // Participants & Registration
    maxParticipants: 32,
    minParticipants: 8,
    waitlistCapacity: 16,
    allowLateRegistration: false,
    lateRegistrationFee: 0,
    earlyBirdFee: 0,
    
    // Tournament Structure
    format: '',
    category: '',
    division: '',
    seedingMethod: 'ranking',
    scoringFormat: 'best_of_3',
    consolationBracket: false,
    
    // Eligibility & Requirements
    minRating: '',
    maxRating: '',
    ageRestrictions: '',
    skillLevelReq: '',
    equipmentReq: '',
    dressCode: '',
    
    // Financial
    entryFee: 0,
    prizePool: 0,
    prizeDistribution: '',
    refundPolicy: '',
    refundDeadline: '',
    
    // Rules & Policies
    withdrawalPolicy: '',
    codeOfConduct: '',
    weatherPolicy: '',
    
    // Tournament Management
    organizer: '',
    tournamentDirector: '',
    contactEmail: '',
    contactPhone: '',
    
    // Match Settings
    warmupTime: 5,
    breakTimeBetweenMatches: 10,
    timeLimit: '',
    
    // Event Details
    awards: '',
    ceremonytTime: '',
    liveStreaming: false,
    featuredMatches: false
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
        // Basic Information
        name: '', description: '', level: '', status: 'upcoming',
        // Venue Details
        location: '', venueAddress: '', numberOfCourts: 4, courtSurface: 'indoor', parkingInfo: '',
        // Date & Time
        startDate: '', endDate: '', registrationStartDate: '', registrationEndDate: '', checkInTime: '08:00',
        // Participants & Registration
        maxParticipants: 32, minParticipants: 8, waitlistCapacity: 16, allowLateRegistration: false, lateRegistrationFee: undefined,
        // Tournament Structure
        format: '', category: '', division: '', seedingMethod: 'ranking', scoringFormat: 'best_of_3', consolationBracket: false,
        // Eligibility & Requirements
        minRating: '', maxRating: '', ageRestrictions: '', skillLevelReq: '', equipmentReq: '', dressCode: '',
        // Financial
        entryFee: undefined, prizePool: undefined, earlyBirdFee: undefined, prizeDistribution: '', refundPolicy: '', refundDeadline: '',
        // Rules & Policies
        withdrawalPolicy: '', codeOfConduct: '', weatherPolicy: '',
        // Tournament Management
        organizer: '', tournamentDirector: '', contactEmail: '', contactPhone: '',
        // Match Settings
        warmupTime: 5, breakTimeBetweenMatches: 10, timeLimit: '',
        // Event Details
        awards: '', ceremonytTime: '', liveStreaming: false, featuredMatches: false
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

  // Fetch all tournaments with increased limit to show recent test tournaments
  const { data: allTournaments = [], isLoading: allTournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      // Fetch with increased limit to see all tournaments including recent test ones
      const response = await apiRequest('GET', '/api/tournaments?limit=100');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch parent tournaments for multi-event view
  const { data: parentTournaments = [], isLoading: parentTournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments/parent'],
    queryFn: async () => {
      // Filter tournaments that might be parent tournaments from all tournaments
      return allTournaments.filter((t: any) => t.isParent || (!t.parentTournamentId && !t.isSubEvent));
    },
    enabled: allTournaments.length > 0
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
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto p-4">
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
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      formStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {step === 1 ? 'Basic Info' : 
                       step === 2 ? 'Venue & Dates' : 
                       step === 3 ? 'Tournament Structure' : 
                       step === 4 ? 'Financial & Rules' : 'Management & Details'}
                    </span>
                    {step < 5 && <div className="w-8 h-px bg-muted mx-2" />}
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
                          <SelectItem value="club">Club (1.0x)</SelectItem>
                          <SelectItem value="district">District (1.1x)</SelectItem>
                          <SelectItem value="city">City (1.2x)</SelectItem>
                          <SelectItem value="provincial">Provincial (1.5x)</SelectItem>
                          <SelectItem value="national">National (1.8x)</SelectItem>
                          <SelectItem value="regional">Regional (2.2x)</SelectItem>
                          <SelectItem value="international">International (3.0x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="City, State/Province"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Venue & Dates */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Venue & Schedule Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="venueAddress">Venue Address</Label>
                      <Input 
                        id="venueAddress" 
                        placeholder="Full venue address"
                        value={formData.venueAddress}
                        onChange={(e) => setFormData({...formData, venueAddress: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfCourts">Number of Courts</Label>
                      <Input 
                        id="numberOfCourts" 
                        type="number"
                        placeholder="4"
                        value={formData.numberOfCourts}
                        onChange={(e) => setFormData({...formData, numberOfCourts: parseInt(e.target.value) || 4})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courtSurface">Court Surface</Label>
                      <Select value={formData.courtSurface} onValueChange={(value) => setFormData({...formData, courtSurface: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select surface" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indoor">Indoor</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="covered">Covered Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">Check-in Time</Label>
                      <Input 
                        id="checkInTime" 
                        type="time"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" 
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationStartDate">Registration Opens</Label>
                      <Input 
                        id="registrationStartDate" 
                        type="date"
                        value={formData.registrationStartDate}
                        onChange={(e) => setFormData({...formData, registrationStartDate: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationEndDate">Registration Closes</Label>
                      <Input 
                        id="registrationEndDate" 
                        type="date"
                        value={formData.registrationEndDate}
                        onChange={(e) => setFormData({...formData, registrationEndDate: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parkingInfo">Parking Information</Label>
                    <Input 
                      id="parkingInfo" 
                      placeholder="Parking details and instructions"
                      value={formData.parkingInfo}
                      onChange={(e) => setFormData({...formData, parkingInfo: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Tournament Structure */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tournament Structure</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Format</Label>
                      <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_elimination">Single Elimination</SelectItem>
                          <SelectItem value="double_elimination">Double Elimination</SelectItem>
                          <SelectItem value="round_robin">Round Robin</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
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
                          <SelectItem value="mens_singles">Men's Singles</SelectItem>
                          <SelectItem value="womens_singles">Women's Singles</SelectItem>
                          <SelectItem value="mens_doubles">Men's Doubles</SelectItem>
                          <SelectItem value="womens_doubles">Women's Doubles</SelectItem>
                          <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="division">Division</Label>
                      <Select value={formData.division} onValueChange={(value) => setFormData({...formData, division: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="35+">35+</SelectItem>
                          <SelectItem value="50+">50+</SelectItem>
                          <SelectItem value="65+">65+</SelectItem>
                          <SelectItem value="junior">Junior (19 & Under)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seedingMethod">Seeding Method</Label>
                      <Select value={formData.seedingMethod} onValueChange={(value) => setFormData({...formData, seedingMethod: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seeding method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ranking">Ranking Points</SelectItem>
                          <SelectItem value="rating">DUPR Rating</SelectItem>
                          <SelectItem value="random">Random</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input 
                        id="maxParticipants" 
                        type="number"
                        placeholder="32"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 32})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minParticipants">Min Participants</Label>
                      <Input 
                        id="minParticipants" 
                        type="number"
                        placeholder="8"
                        value={formData.minParticipants}
                        onChange={(e) => setFormData({...formData, minParticipants: parseInt(e.target.value) || 8})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waitlistCapacity">Waitlist Capacity</Label>
                      <Input 
                        id="waitlistCapacity" 
                        type="number"
                        placeholder="16"
                        value={formData.waitlistCapacity}
                        onChange={(e) => setFormData({...formData, waitlistCapacity: parseInt(e.target.value) || 16})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scoringFormat">Scoring Format</Label>
                      <Select value={formData.scoringFormat} onValueChange={(value) => setFormData({...formData, scoringFormat: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scoring format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="best_of_3_rally_15">Best of 3 Games (15 Rally)</SelectItem>
                          <SelectItem value="best_of_3_rally_21">Best of 3 Games (21 Rally)</SelectItem>
                          <SelectItem value="best_of_3_traditional_11">Best of 3 Games (11 Traditional)</SelectItem>
                          <SelectItem value="best_of_5_rally_15">Best of 5 Games (15 Rally)</SelectItem>
                          <SelectItem value="best_of_5_rally_21">Best of 5 Games (21 Rally)</SelectItem>
                          <SelectItem value="best_of_5_traditional_11">Best of 5 Games (11 Traditional)</SelectItem>
                          <SelectItem value="single_game_11_traditional">Single Game to 11 (Traditional)</SelectItem>
                          <SelectItem value="single_game_15_traditional">Single Game to 15 (Traditional)</SelectItem>
                          <SelectItem value="single_game_15_rally">Single Game to 15 (Rally)</SelectItem>
                          <SelectItem value="single_game_21_rally">Single Game to 21 (Rally)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input 
                        type="checkbox" 
                        id="consolationBracket"
                        checked={formData.consolationBracket}
                        onChange={(e) => setFormData({...formData, consolationBracket: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="consolationBracket">Include Consolation Bracket</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Financial & Rules */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial & Policies</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entryFee">Entry Fee ($)</Label>
                      <Input 
                        id="entryFee" 
                        type="number"
                        step="0.01"
                        placeholder="75.00"
                        value={formData.entryFee || ''}
                        onChange={(e) => setFormData({...formData, entryFee: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prizePool">Prize Pool ($)</Label>
                      <Input 
                        id="prizePool" 
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        value={formData.prizePool || ''}
                        onChange={(e) => setFormData({...formData, prizePool: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="earlyBirdFee">Early Bird Fee ($)</Label>
                      <Input 
                        id="earlyBirdFee" 
                        type="number"
                        step="0.01"
                        placeholder="65.00"
                        value={formData.earlyBirdFee || ''}
                        onChange={(e) => setFormData({...formData, earlyBirdFee: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lateRegistrationFee">Late Registration Fee ($)</Label>
                      <Input 
                        id="lateRegistrationFee" 
                        type="number"
                        step="0.01"
                        placeholder="10.00"
                        value={formData.lateRegistrationFee || ''}
                        onChange={(e) => setFormData({...formData, lateRegistrationFee: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input 
                        type="checkbox" 
                        id="allowLateRegistration"
                        checked={formData.allowLateRegistration}
                        onChange={(e) => setFormData({...formData, allowLateRegistration: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="allowLateRegistration">Allow Late Registration</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refundPolicy">Refund Policy</Label>
                    <textarea 
                      id="refundPolicy" 
                      placeholder="Full refund until 7 days before tournament..."
                      value={formData.refundPolicy}
                      onChange={(e) => setFormData({...formData, refundPolicy: e.target.value})}
                      className="w-full p-2 border rounded-md h-20 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipmentReq">Equipment Requirements</Label>
                    <Input 
                      id="equipmentReq" 
                      placeholder="Approved paddle list, dress code, etc."
                      value={formData.equipmentReq}
                      onChange={(e) => setFormData({...formData, equipmentReq: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weatherPolicy">Weather Policy</Label>
                    <Input 
                      id="weatherPolicy" 
                      placeholder="Rain delay procedures, cancellation policy"
                      value={formData.weatherPolicy}
                      onChange={(e) => setFormData({...formData, weatherPolicy: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Management & Details */}
              {formStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tournament Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizer">Tournament Organizer</Label>
                      <Input 
                        id="organizer" 
                        placeholder="Organization or individual name"
                        value={formData.organizer}
                        onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tournamentDirector">Tournament Director</Label>
                      <Input 
                        id="tournamentDirector" 
                        placeholder="Director name"
                        value={formData.tournamentDirector}
                        onChange={(e) => setFormData({...formData, tournamentDirector: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input 
                        id="contactEmail" 
                        type="email"
                        placeholder="tournament@example.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input 
                        id="contactPhone" 
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warmupTime">Warmup Time (min)</Label>
                      <Input 
                        id="warmupTime" 
                        type="number"
                        placeholder="5"
                        value={formData.warmupTime}
                        onChange={(e) => setFormData({...formData, warmupTime: parseInt(e.target.value) || 5})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breakTimeBetweenMatches">Break Between Matches (min)</Label>
                      <Input 
                        id="breakTimeBetweenMatches" 
                        type="number"
                        placeholder="10"
                        value={formData.breakTimeBetweenMatches}
                        onChange={(e) => setFormData({...formData, breakTimeBetweenMatches: parseInt(e.target.value) || 10})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (min, optional)</Label>
                      <Input 
                        id="timeLimit" 
                        type="number"
                        placeholder="60"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awards">Awards & Recognition</Label>
                    <Input 
                      id="awards" 
                      placeholder="Trophies, medals, prizes description"
                      value={formData.awards}
                      onChange={(e) => setFormData({...formData, awards: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="liveStreaming"
                        checked={formData.liveStreaming}
                        onChange={(e) => setFormData({...formData, liveStreaming: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="liveStreaming">Live Streaming Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="featuredMatches"
                        checked={formData.featuredMatches}
                        onChange={(e) => setFormData({...formData, featuredMatches: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="featuredMatches">Featured Match Coverage</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Tournament Summary - Testing Mode */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-3 text-blue-900 flex items-center">
                  📊 Complete Tournament Data Preview (Testing Mode)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {/* Basic Information */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2">Basic Information</div>
                  <div><strong>Name:</strong> {formData.name || 'Not set'}</div>
                  <div><strong>Description:</strong> {formData.description || 'Not set'}</div>
                  <div><strong>Level:</strong> {formData.level || 'Not set'}</div>
                  <div><strong>Status:</strong> {formData.status || 'Not set'}</div>
                  <div><strong>Format:</strong> {formData.format || 'Not set'}</div>
                  <div><strong>Category:</strong> {formData.category || 'Not set'}</div>
                  <div><strong>Division:</strong> {formData.division || 'Not set'}</div>
                  
                  {/* Venue & Location */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Venue & Location</div>
                  <div><strong>Location:</strong> {formData.location || 'Not set'}</div>
                  <div><strong>Venue Address:</strong> {formData.venueAddress || 'Not set'}</div>
                  <div><strong>Courts:</strong> {formData.numberOfCourts || 'Not set'}</div>
                  <div><strong>Surface:</strong> {formData.courtSurface || 'Not set'}</div>
                  <div><strong>Parking:</strong> {formData.parkingInfo || 'Not set'}</div>
                  
                  {/* Dates & Times */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Dates & Times</div>
                  <div><strong>Start Date:</strong> {formData.startDate || 'Not set'}</div>
                  <div><strong>End Date:</strong> {formData.endDate || 'Not set'}</div>
                  <div><strong>Registration Opens:</strong> {formData.registrationStartDate || 'Not set'}</div>
                  <div><strong>Registration Closes:</strong> {formData.registrationEndDate || 'Not set'}</div>
                  <div><strong>Check-in Time:</strong> {formData.checkInTime || 'Not set'}</div>
                  
                  {/* Participants & Structure */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Tournament Structure</div>
                  <div><strong>Max Participants:</strong> {formData.maxParticipants || 'Not set'}</div>
                  <div><strong>Min Participants:</strong> {formData.minParticipants || 'Not set'}</div>
                  <div><strong>Seeding Method:</strong> {formData.seedingMethod || 'Not set'}</div>
                  <div><strong>Scoring Format:</strong> {formData.scoringFormat || 'Not set'}</div>
                  <div><strong>Consolation Bracket:</strong> {formData.consolationBracket ? 'Yes' : 'No'}</div>
                  
                  {/* Financial */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Financial</div>
                  <div><strong>Entry Fee:</strong> ${formData.entryFee || '0'}</div>
                  <div><strong>Prize Pool:</strong> ${formData.prizePool || '0'}</div>
                  <div><strong>Late Reg Fee:</strong> ${formData.lateRegistrationFee || '0'}</div>
                  <div><strong>Prize Distribution:</strong> {formData.prizeDistribution || 'Not set'}</div>
                  <div><strong>Refund Policy:</strong> {formData.refundPolicy || 'Not set'}</div>
                  
                  {/* Management */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Tournament Management</div>
                  <div><strong>Organizer:</strong> {formData.organizer || 'Not set'}</div>
                  <div><strong>Tournament Director:</strong> {formData.tournamentDirector || 'Not set'}</div>
                  <div><strong>Contact Email:</strong> {formData.contactEmail || 'Not set'}</div>
                  <div><strong>Contact Phone:</strong> {formData.contactPhone || 'Not set'}</div>
                  
                  {/* Match Settings */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Match Settings</div>
                  <div><strong>Warmup Time:</strong> {formData.warmupTime || 'Not set'} min</div>
                  <div><strong>Break Between Matches:</strong> {formData.breakTimeBetweenMatches || 'Not set'} min</div>
                  <div><strong>Time Limit:</strong> {formData.timeLimit || 'Not set'}</div>
                  
                  {/* Eligibility & Requirements */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Eligibility & Requirements</div>
                  <div><strong>Min Rating:</strong> {formData.minRating || 'Not set'}</div>
                  <div><strong>Max Rating:</strong> {formData.maxRating || 'Not set'}</div>
                  <div><strong>Age Restrictions:</strong> {formData.ageRestrictions || 'Not set'}</div>
                  <div><strong>Skill Level Requirement:</strong> {formData.skillLevelReq || 'Not set'}</div>
                  <div><strong>Equipment Requirements:</strong> {formData.equipmentReq || 'Not set'}</div>
                  <div><strong>Dress Code:</strong> {formData.dressCode || 'Not set'}</div>
                  
                  {/* Rules & Policies */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Rules & Policies</div>
                  <div><strong>Withdrawal Policy:</strong> {formData.withdrawalPolicy || 'Not set'}</div>
                  <div><strong>Code of Conduct:</strong> {formData.codeOfConduct || 'Not set'}</div>
                  <div><strong>Weather Policy:</strong> {formData.weatherPolicy || 'Not set'}</div>
                  <div><strong>Refund Deadline:</strong> {formData.refundDeadline || 'Not set'}</div>
                  <div><strong>Withdrawal Deadline:</strong> {formData.withdrawalDeadline || 'Not set'}</div>
                  
                  {/* Special Features */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Special Features</div>
                  <div><strong>Live Streaming:</strong> {formData.liveStreaming ? 'Yes' : 'No'}</div>
                  <div><strong>Featured Matches:</strong> {formData.featuredMatches ? 'Yes' : 'No'}</div>
                  <div><strong>Awards:</strong> {formData.awards || 'Not set'}</div>
                  <div><strong>Ceremony Time:</strong> {formData.ceremonytTime || 'Not set'}</div>
                  
                  {/* Advanced Registration */}
                  <div className="font-medium text-blue-800 col-span-full border-b border-blue-200 pb-1 mb-2 mt-3">Registration Options</div>
                  <div><strong>Waitlist Capacity:</strong> {formData.waitlistCapacity || 'Not set'}</div>
                  <div><strong>Allow Late Registration:</strong> {formData.allowLateRegistration ? 'Yes' : 'No'}</div>
                  <div><strong>Consolation Bracket:</strong> {formData.consolationBracket ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
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
                      // Basic Information
                      name: '', description: '', level: '', status: 'upcoming',
                      // Venue Details
                      location: '', venueAddress: '', numberOfCourts: 4, courtSurface: 'indoor', parkingInfo: '',
                      // Date & Time
                      startDate: '', endDate: '', registrationStartDate: '', registrationEndDate: '', checkInTime: '08:00',
                      // Participants & Registration
                      maxParticipants: 32, minParticipants: 8, waitlistCapacity: 16, allowLateRegistration: false, lateRegistrationFee: 0,
                      // Tournament Structure
                      format: '', category: '', division: '', seedingMethod: 'ranking', scoringFormat: 'best_of_3', consolationBracket: false,
                      // Eligibility & Requirements
                      minRating: '', maxRating: '', ageRestrictions: '', skillLevelReq: '', equipmentReq: '', dressCode: '',
                      // Financial
                      entryFee: 0, prizePool: 0, prizeDistribution: '', refundPolicy: '', refundDeadline: '',
                      // Rules & Policies
                      withdrawalPolicy: '', codeOfConduct: '', weatherPolicy: '',
                      // Tournament Management
                      organizer: '', tournamentDirector: '', contactEmail: '', contactPhone: '',
                      // Match Settings
                      warmupTime: 5, breakTimeBetweenMatches: 10, timeLimit: '',
                      // Event Details
                      awards: '', ceremonytTime: '', liveStreaming: false, featuredMatches: false
                    });
                  }}>
                    Cancel
                  </Button>
                  {formStep < 5 ? (
                    <Button onClick={() => setFormStep(formStep + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        // Prepare comprehensive tournament data for database
                        const tournamentData = {
                          name: formData.name,
                          description: formData.description || '',
                          location: formData.location || '',
                          level: formData.level,
                          format: formData.format,
                          category: formData.category,
                          division: formData.division,
                          startDate: new Date(formData.startDate),
                          endDate: new Date(formData.endDate),
                          registrationEndDate: formData.registrationEndDate ? new Date(formData.registrationEndDate) : null,
                          maxParticipants: formData.maxParticipants || 32,
                          status: 'upcoming',
                          // Additional comprehensive fields
                          venueAddress: formData.venueAddress || '',
                          numberOfCourts: formData.numberOfCourts || 4,
                          courtSurface: formData.courtSurface || 'indoor',
                          entryFee: formData.entryFee || 0,
                          prizePool: formData.prizePool || 0,
                          organizer: formData.organizer || '',
                          contactEmail: formData.contactEmail || '',
                          contactPhone: formData.contactPhone || ''
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
            <CreateMultiEventTournamentForm
              onSuccess={() => setIsCreateFormOpen(false)}
              onCancel={() => setIsCreateFormOpen(false)}
            />
          )}

          {createTournamentType === 'team' && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      formStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {step === 1 ? 'Basic Info' : 
                       step === 2 ? 'Team Structure' : 
                       step === 3 ? 'Match Format' : 
                       step === 4 ? 'Eligibility' : 'Tournament Rules'}
                    </span>
                    {step < 5 && <div className="w-8 h-px bg-muted mx-2" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamTournamentName">Team Tournament Name</Label>
                    <Input 
                      id="teamTournamentName" 
                      placeholder="e.g., Elite Club Team Championship"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Description</Label>
                    <Textarea 
                      id="teamDescription" 
                      placeholder="Describe the team tournament format and objectives"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamLevel">Tournament Level</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="club">Club</SelectItem>
                          <SelectItem value="district">District</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                          <SelectItem value="provincial">Provincial</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTeams">Maximum Teams</Label>
                      <Input 
                        id="maxTeams" 
                        type="number"
                        placeholder="16"
                        value={formData.maxTeams}
                        onChange={(e) => setFormData({...formData, maxTeams: parseInt(e.target.value) || 16})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamLocation">Location</Label>
                      <Input 
                        id="teamLocation" 
                        placeholder="Tournament location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teamEntryFee">Entry Fee per Team</Label>
                      <Input 
                        id="teamEntryFee" 
                        type="number"
                        placeholder="400"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({...formData, entryFee: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team Structure */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minPlayers">Minimum Players per Team</Label>
                      <Input 
                        id="minPlayers" 
                        type="number"
                        placeholder="4"
                        value={formData.minPlayers}
                        onChange={(e) => setFormData({...formData, minPlayers: parseInt(e.target.value) || 4})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxPlayers">Maximum Players per Team</Label>
                      <Input 
                        id="maxPlayers" 
                        type="number"
                        placeholder="6"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value) || 6})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requiredMales">Required Male Players (optional)</Label>
                      <Input 
                        id="requiredMales" 
                        type="number"
                        placeholder="2"
                        value={formData.requiredMales}
                        onChange={(e) => setFormData({...formData, requiredMales: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requiredFemales">Required Female Players (optional)</Label>
                      <Input 
                        id="requiredFemales" 
                        type="number"
                        placeholder="2"
                        value={formData.requiredFemales}
                        onChange={(e) => setFormData({...formData, requiredFemales: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="allowSubstitutes"
                      checked={formData.allowSubstitutes}
                      onChange={(e) => setFormData({...formData, allowSubstitutes: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="allowSubstitutes">Allow Substitute Players</Label>
                  </div>

                  {formData.allowSubstitutes && (
                    <div className="space-y-2">
                      <Label htmlFor="maxSubstitutes">Maximum Substitutes per Team</Label>
                      <Input 
                        id="maxSubstitutes" 
                        type="number"
                        placeholder="2"
                        value={formData.maxSubstitutes}
                        onChange={(e) => setFormData({...formData, maxSubstitutes: parseInt(e.target.value) || 2})}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Match Format */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Match Structure</Label>
                    <p className="text-sm text-muted-foreground">
                      Define the individual matches that make up each team vs team competition
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="singlesMatches">Singles Matches</Label>
                        <Input 
                          id="singlesMatches" 
                          type="number"
                          placeholder="1"
                          value={formData.singlesMatches}
                          onChange={(e) => setFormData({...formData, singlesMatches: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="doublesMatches">Doubles Matches</Label>
                        <Input 
                          id="doublesMatches" 
                          type="number"
                          placeholder="2"
                          value={formData.doublesMatches}
                          onChange={(e) => setFormData({...formData, doublesMatches: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mixedDoublesMatches">Mixed Doubles</Label>
                        <Input 
                          id="mixedDoublesMatches" 
                          type="number"
                          placeholder="2"
                          value={formData.mixedDoublesMatches}
                          onChange={(e) => setFormData({...formData, mixedDoublesMatches: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Total Matches</Label>
                        <div className="w-full h-10 border rounded px-3 flex items-center bg-muted text-muted-foreground">
                          {(formData.singlesMatches || 0) + (formData.doublesMatches || 0) + (formData.mixedDoublesMatches || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scoringSystem">Scoring System</Label>
                      <Select value={formData.scoringSystem} onValueChange={(value) => setFormData({...formData, scoringSystem: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scoring system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="match_wins">Match Wins (each match worth 1 point)</SelectItem>
                          <SelectItem value="weighted_points">Weighted Points (different point values)</SelectItem>
                          <SelectItem value="total_points">Total Points (cumulative game scores)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tournamentFormat">Tournament Format</Label>
                      <Select value={formData.tournamentFormat} onValueChange={(value) => setFormData({...formData, tournamentFormat: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tournament format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round_robin">Round Robin</SelectItem>
                          <SelectItem value="single_elimination">Single Elimination</SelectItem>
                          <SelectItem value="double_elimination">Double Elimination</SelectItem>
                          <SelectItem value="pool_play_playoff">Pool Play + Playoffs</SelectItem>
                          <SelectItem value="swiss">Swiss System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scoringFormat">Individual Match Scoring</Label>
                      <Select value={formData.scoringFormat} onValueChange={(value) => setFormData({...formData, scoringFormat: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scoring format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="best_of_3">Best of 3</SelectItem>
                          <SelectItem value="best_of_5">Best of 5</SelectItem>
                          <SelectItem value="single_game">Single Game</SelectItem>
                          <SelectItem value="rally_scoring">Rally Scoring</SelectItem>
                          <SelectItem value="timed_matches">Timed Matches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Eligibility Criteria */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Team Rating Limits</Label>
                    <p className="text-sm text-muted-foreground">
                      Control team composition using DUPR ratings
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxTotalDUPR">Maximum Total Team DUPR</Label>
                      <Input 
                        id="maxTotalDUPR" 
                        type="number"
                        step="0.1"
                        placeholder="20.0"
                        value={formData.maxTotalDUPR}
                        onChange={(e) => setFormData({...formData, maxTotalDUPR: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxAverageDUPR">Maximum Average DUPR</Label>
                      <Input 
                        id="maxAverageDUPR" 
                        type="number"
                        step="0.1"
                        placeholder="5.0"
                        value={formData.maxAverageDUPR}
                        onChange={(e) => setFormData({...formData, maxAverageDUPR: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Ranking Points Limits</Label>
                    <p className="text-sm text-muted-foreground">
                      Control team composition using ranking points
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxTotalRankingPoints">Maximum Total Ranking Points</Label>
                      <Input 
                        id="maxTotalRankingPoints" 
                        type="number"
                        placeholder="10000"
                        value={formData.maxTotalRankingPoints}
                        onChange={(e) => setFormData({...formData, maxTotalRankingPoints: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minTotalRankingPoints">Minimum Total Ranking Points</Label>
                      <Input 
                        id="minTotalRankingPoints" 
                        type="number"
                        placeholder="2000"
                        value={formData.minTotalRankingPoints}
                        onChange={(e) => setFormData({...formData, minTotalRankingPoints: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Individual Player Requirements</Label>
                    <p className="text-sm text-muted-foreground">
                      Set requirements for individual team members
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minPlayerDUPR">Minimum Player DUPR</Label>
                      <Input 
                        id="minPlayerDUPR" 
                        type="number"
                        step="0.1"
                        placeholder="3.5"
                        value={formData.minPlayerDUPR}
                        onChange={(e) => setFormData({...formData, minPlayerDUPR: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxPlayerDUPR">Maximum Player DUPR</Label>
                      <Input 
                        id="maxPlayerDUPR" 
                        type="number"
                        step="0.1"
                        placeholder="5.5"
                        value={formData.maxPlayerDUPR}
                        onChange={(e) => setFormData({...formData, maxPlayerDUPR: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minPlayerRankingPoints">Minimum Player Ranking Points</Label>
                      <Input 
                        id="minPlayerRankingPoints" 
                        type="number"
                        placeholder="300"
                        value={formData.minPlayerRankingPoints}
                        onChange={(e) => setFormData({...formData, minPlayerRankingPoints: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minTournamentsPlayed">Minimum Tournaments Played</Label>
                      <Input 
                        id="minTournamentsPlayed" 
                        type="number"
                        placeholder="3"
                        value={formData.minTournamentsPlayed}
                        onChange={(e) => setFormData({...formData, minTournamentsPlayed: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Advanced Restrictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Additional eligibility requirements
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="professionalStatus">Professional Status</Label>
                      <Select value={formData.professionalStatus} onValueChange={(value) => setFormData({...formData, professionalStatus: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status requirement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amateur_only">Amateur Only</SelectItem>
                          <SelectItem value="semi_pro_allowed">Semi-Pro Allowed</SelectItem>
                          <SelectItem value="professional_allowed">Professional Allowed</SelectItem>
                          <SelectItem value="mixed">Mixed (Any Status)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="genderRequirements">Gender Requirements</Label>
                      <Select value={formData.genderRequirements} onValueChange={(value) => setFormData({...formData, genderRequirements: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender requirements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open (Any Gender)</SelectItem>
                          <SelectItem value="mixed_required">Mixed Required</SelectItem>
                          <SelectItem value="men_only">Men Only</SelectItem>
                          <SelectItem value="women_only">Women Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="requireVerifiedRating"
                      checked={formData.requireVerifiedRating}
                      onChange={(e) => setFormData({...formData, requireVerifiedRating: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="requireVerifiedRating">Require Verified DUPR Ratings</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="allowUnratedPlayers"
                      checked={formData.allowUnratedPlayers}
                      onChange={(e) => setFormData({...formData, allowUnratedPlayers: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="allowUnratedPlayers">Allow Unrated Players</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="requireMedicalClearance"
                      checked={formData.requireMedicalClearance}
                      onChange={(e) => setFormData({...formData, requireMedicalClearance: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="requireMedicalClearance">Require Medical Clearance</Label>
                  </div>
                </div>
              )}

              {/* Step 5: Financial & Rules (using existing fields) */}
              {formStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Financial Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Tournament entry fees and prize information
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entryFee">Entry Fee per Team ($)</Label>
                      <Input 
                        id="entryFee" 
                        type="number"
                        placeholder="150"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({...formData, entryFee: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prizePool">Prize Pool ($)</Label>
                      <Input 
                        id="prizePool" 
                        type="number"
                        placeholder="5000"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({...formData, prizePool: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prizeDistribution">Prize Distribution</Label>
                    <Textarea 
                      id="prizeDistribution" 
                      placeholder="1st: 40%, 2nd: 30%, 3rd: 20%, 4th: 10%"
                      value={formData.prizeDistribution}
                      onChange={(e) => setFormData({...formData, prizeDistribution: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refundPolicy">Refund Policy</Label>
                    <Textarea 
                      id="refundPolicy" 
                      placeholder="Full refund before registration deadline, 50% refund within 48 hours..."
                      value={formData.refundPolicy}
                      onChange={(e) => setFormData({...formData, refundPolicy: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tournament Rules & Policies</Label>
                    <p className="text-sm text-muted-foreground">
                      Set tournament rules and conduct policies
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdrawalPolicy">Withdrawal Policy</Label>
                    <Textarea 
                      id="withdrawalPolicy" 
                      placeholder="Teams may withdraw with penalty fees..."
                      value={formData.withdrawalPolicy}
                      onChange={(e) => setFormData({...formData, withdrawalPolicy: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codeOfConduct">Code of Conduct</Label>
                    <Textarea 
                      id="codeOfConduct" 
                      placeholder="All players must maintain sportsmanlike conduct..."
                      value={formData.codeOfConduct}
                      onChange={(e) => setFormData({...formData, codeOfConduct: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weatherPolicy">Weather Policy</Label>
                    <Textarea 
                      id="weatherPolicy" 
                      placeholder="In case of rain or extreme weather..."
                      value={formData.weatherPolicy}
                      onChange={(e) => setFormData({...formData, weatherPolicy: e.target.value})}
                    />
                  </div>

                  {/* Team Tournament Summary */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-3 text-green-900">Team Tournament Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><strong>Tournament:</strong> {formData.name || 'Not set'}</div>
                      <div><strong>Level:</strong> {formData.level || 'Not set'}</div>
                      <div><strong>Location:</strong> {formData.location || 'Not set'}</div>
                      <div><strong>Format:</strong> {formData.format || 'Not set'}</div>
                      <div><strong>Scoring:</strong> {formData.scoringFormat || 'Not set'}</div>
                      <div><strong>Category:</strong> {formData.category || 'Not set'}</div>
                      <div><strong>Division:</strong> {formData.division || 'Not set'}</div>
                      <div><strong>Entry Fee:</strong> ${formData.entryFee || 0} per team</div>
                      <div><strong>Prize Pool:</strong> ${formData.prizePool || 0}</div>
                      <div><strong>Start Date:</strong> {formData.startDate || 'Not set'}</div>
                      <div><strong>End Date:</strong> {formData.endDate || 'Not set'}</div>
                      <div><strong>Registration Deadline:</strong> {formData.registrationEndDate || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => formStep > 1 ? setFormStep(formStep - 1) : setIsCreateFormOpen(false)}
                >
                  {formStep === 1 ? 'Cancel' : 'Previous'}
                </Button>
                
                <Button
                  onClick={() => {
                    if (formStep < 5) {
                      setFormStep(formStep + 1);
                    } else {
                      // Create team tournament - will implement backend
                      toast({
                        title: "Team Tournament Creation",
                        description: "Team tournament creation will be implemented with backend API",
                      });
                      setIsCreateFormOpen(false);
                    }
                  }}
                >
                  {formStep === 5 ? 'Create Team Tournament' : 'Next'}
                </Button>
              </div>
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