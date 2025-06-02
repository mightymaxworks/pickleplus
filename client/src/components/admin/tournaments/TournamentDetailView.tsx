/**
 * PKL-278651-TOURN-0015-DETAIL - Tournament Detail View for Admins
 * 
 * Comprehensive tournament detail view that supports all tournament types:
 * - Single Tournaments
 * - Multi-Event Tournaments (Parent and Sub-Events)
 * - Team Tournaments
 * 
 * Shows complete tournament information, registrations, and management actions.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  DollarSign,
  Settings,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  Target,
  GitBranch,
  Users as Team,
  Globe,
  Clock,
  Star,
  Award,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

// Tournament type based on our unified schema
interface Tournament {
  id: number;
  name: string;
  description: string;
  level: string;
  format: string;
  location: string;
  venueAddress?: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  numberOfCourts?: number;
  courtSurface?: string;
  entryFee: number;
  prizePool: number;
  prizeDistribution?: string;
  maxParticipants: number;
  currentParticipants?: number;
  status: string;
  category: string;
  division: string;
  organizer: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Multi-event tournament fields
  isParent?: boolean;
  isSubEvent?: boolean;
  parentTournamentId?: number;
  
  // Team tournament fields
  isTeamTournament?: boolean;
  teamSize?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  maxTeams?: number;
  teamMatchFormat?: any;
  teamEligibilityRules?: any;
  teamLineupRules?: any;
  
  // Additional fields
  eligibilityRules?: any;
  matchFormat?: any;
  scheduleConfig?: any;
}

interface TournamentRegistration {
  id: number;
  tournamentId: number;
  userId: number;
  playerName: string;
  registrationDate: string;
  status: string;
  isTeamRegistration?: boolean;
  teamName?: string;
  teamPlayers?: any;
  teamCaptain?: string;
}

export default function TournamentDetailView() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch tournament details
  const { data: tournament, isLoading, error } = useQuery({
    queryKey: [`/api/tournaments/${id}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tournaments/${id}`);
      return await response.json() as Tournament;
    },
    enabled: !!id
  });

  // Fetch tournament registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: [`/api/tournaments/${id}/registrations`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tournaments/${id}/registrations`);
      return await response.json() as TournamentRegistration[];
    },
    enabled: !!id
  });

  // Fetch sub-events for multi-event tournaments
  const { data: subEvents = [] } = useQuery({
    queryKey: [`/api/tournaments/${id}/sub-events`],
    queryFn: async () => {
      if (!tournament?.isParent) return [];
      const response = await apiRequest('GET', `/api/tournaments?parentTournamentId=${id}&limit=50`);
      return await response.json() as Tournament[];
    },
    enabled: !!tournament?.isParent
  });

  // Fetch parent tournament for sub-events
  const { data: parentTournament } = useQuery({
    queryKey: [`/api/tournaments/${tournament?.parentTournamentId}`],
    queryFn: async () => {
      if (!tournament?.parentTournamentId) return null;
      const response = await apiRequest('GET', `/api/tournaments/${tournament.parentTournamentId}`);
      return await response.json() as Tournament;
    },
    enabled: !!tournament?.parentTournamentId
  });

  // Update tournament status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest('PATCH', `/api/tournaments/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${id}`] });
      toast({
        title: "Status Updated",
        description: "Tournament status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update tournament status",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Tournament Not Found</h3>
              <p className="text-muted-foreground">
                The tournament you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/admin/tournaments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tournaments
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine tournament type for display
  const getTournamentType = () => {
    if (tournament.isTeamTournament) return { type: 'Team Tournament', icon: Team, color: 'bg-purple-500' };
    if (tournament.isParent) return { type: 'Multi-Event Parent', icon: GitBranch, color: 'bg-blue-500' };
    if (tournament.isSubEvent) return { type: 'Sub-Event', icon: Target, color: 'bg-green-500' };
    return { type: 'Single Tournament', icon: Trophy, color: 'bg-orange-500' };
  };

  const tournamentType = getTournamentType();
  const TypeIcon = tournamentType.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPp');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/tournaments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${tournamentType.color}`}>
                <TypeIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{tournament.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">{tournamentType.type}</Badge>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{tournament.level}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateStatusMutation.mutate(tournament.status === 'active' ? 'upcoming' : 'active')}
          >
            {tournament.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Tournament</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this tournament? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Delete Tournament</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Parent/Sub-Event Navigation */}
      {tournament.isSubEvent && parentTournament && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>Part of</span>
              <Link href={`/admin/tournaments/${parentTournament.id}`} className="text-primary hover:underline">
                {parentTournament.name}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">
            Registrations ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {tournament.isParent && (
            <TabsTrigger value="sub-events">
              Sub-Events ({subEvents.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Tournament Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{tournament.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(tournament.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(tournament.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{tournament.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Participants</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.currentParticipants || 0} / {tournament.maxParticipants}
                        </p>
                      </div>
                    </div>
                  </div>

                  {tournament.venueAddress && (
                    <div>
                      <p className="text-sm font-medium mb-1">Venue Address</p>
                      <p className="text-sm text-muted-foreground">{tournament.venueAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Tournament Specific Info */}
              {tournament.isTeamTournament && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Team className="h-5 w-5" />
                      <span>Team Tournament Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Team Size Range</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.minTeamSize} - {tournament.maxTeamSize} players
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Maximum Teams</p>
                        <p className="text-sm text-muted-foreground">{tournament.maxTeams}</p>
                      </div>
                    </div>
                    
                    {tournament.teamMatchFormat && (
                      <div>
                        <p className="text-sm font-medium mb-2">Match Format</p>
                        <div className="bg-muted p-3 rounded-lg">
                          <pre className="text-xs">{JSON.stringify(tournament.teamMatchFormat, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Entry Fee</span>
                    <span className="font-medium">{formatCurrency(tournament.entryFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prize Pool</span>
                    <span className="font-medium">{formatCurrency(tournament.prizePool)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="font-medium">{tournament.format}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Division</span>
                    <span className="font-medium">{tournament.division}</span>
                  </div>
                  {tournament.numberOfCourts && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Courts</span>
                      <span className="font-medium">{tournament.numberOfCourts}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{tournament.organizer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{tournament.contactEmail}</p>
                  </div>
                  {tournament.contactPhone && (
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{tournament.contactPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Registrations</CardTitle>
              <CardDescription>
                Manage and view all registrations for this tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No registrations yet
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {registration.isTeamRegistration ? registration.teamName : registration.playerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Registered on {formatDate(registration.registrationDate)}
                        </p>
                        {registration.isTeamRegistration && registration.teamCaptain && (
                          <p className="text-sm text-muted-foreground">
                            Captain: {registration.teamCaptain}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                          {registration.status}
                        </Badge>
                        {registration.isTeamRegistration && (
                          <Badge variant="outline">Team</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournament.registrationStartDate && (
                  <div>
                    <p className="text-sm font-medium">Registration Opens</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(tournament.registrationStartDate)}
                    </p>
                  </div>
                )}
                {tournament.registrationEndDate && (
                  <div>
                    <p className="text-sm font-medium">Registration Closes</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(tournament.registrationEndDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{tournament.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Court Surface</p>
                  <p className="text-sm text-muted-foreground">{tournament.courtSurface || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prize Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Total Prize Pool</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(tournament.prizePool)}</p>
                </div>
                {tournament.prizeDistribution && (
                  <div>
                    <p className="text-sm font-medium mb-2">Prize Distribution</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs">{tournament.prizeDistribution}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-Events Tab (for multi-event tournaments) */}
        {tournament.isParent && (
          <TabsContent value="sub-events">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Events</CardTitle>
                <CardDescription>
                  Events that are part of this multi-event tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sub-events configured yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subEvents.map((subEvent) => (
                      <Card key={subEvent.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{subEvent.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(subEvent.startDate)} - {formatDate(subEvent.endDate)}
                              </p>
                              <p className="text-sm text-muted-foreground">{subEvent.location}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(subEvent.status)}>
                                {subEvent.status}
                              </Badge>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/tournaments/${subEvent.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Management Tab */}
        <TabsContent value="management">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Tournament Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Participants
                </Button>
                <Button className="w-full" variant="outline">
                  <Trophy className="mr-2 h-4 w-4" />
                  Generate Brackets
                </Button>
                <Button className="w-full" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  Award Results
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Status</span>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate('active')}
                    disabled={tournament.status === 'active'}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Tournament
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate('completed')}
                    disabled={tournament.status === 'completed'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}