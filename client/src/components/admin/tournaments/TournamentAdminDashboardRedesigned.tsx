/**
 * PKL-278651-TOURN-0015-HIERARCHY - Redesigned Tournament Admin Dashboard
 * 
 * This redesigned dashboard provides proper hierarchical organization:
 * - Single column layout with proper spacing
 * - Tournament type grouping (Multi-Event, Single, Team)
 * - Visual hierarchy with parent-child relationships
 * - Enhanced statistics and better visual design
 * 
 * All existing functionality is preserved while improving organization.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  Plus,
  Trophy,
  Users,
  Calendar,
  GitBranch,
  Eye,
  Edit,
  Play,
  AlertCircle,
  Target
} from 'lucide-react';

// Import existing tournament creation components
import CreateMultiEventTournamentForm from './CreateMultiEventTournamentForm';

export default function TournamentAdminDashboardRedesigned() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for tournament creation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTournamentType, setCreateTournamentType] = useState<'single' | 'multi-event' | 'team'>('single');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Fetch all tournaments with increased limit
  const { data: allTournaments = [], isLoading: allTournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tournaments?limit=100');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tournament Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage all tournament types with proper hierarchy and organization
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Tournament</span>
        </Button>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{allTournaments.length}</div>
                <p className="text-xs text-muted-foreground">Total Tournaments</p>
              </div>
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {allTournaments.filter(t => t.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {allTournaments.filter(t => t.status === 'upcoming').length}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {allTournaments.filter(t => t.isParent).length}
                </div>
                <p className="text-xs text-muted-foreground">Multi-Event</p>
              </div>
              <GitBranch className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {allTournaments.filter(t => t.isTeamTournament).length}
                </div>
                <p className="text-xs text-muted-foreground">Team</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchical Tournament Display */}
      <div className="space-y-8">
        {allTournamentsLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <Card key={j} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="h-6 bg-muted rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : allTournaments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first tournament
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Tournament
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Multi-Event Tournament Systems */}
            {(() => {
              const multiEventParents = allTournaments.filter(t => t.isParent);
              return multiEventParents.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-blue-500">
                      <GitBranch className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Multi-Event Tournament Systems</h2>
                      <p className="text-muted-foreground">
                        {multiEventParents.length} tournament systems with sub-events
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {multiEventParents.map((parentTournament) => {
                      const subEvents = allTournaments.filter(t => t.parentTournamentId === parentTournament.id);
                      return (
                        <div key={parentTournament.id} className="space-y-4">
                          {/* Parent Tournament Card */}
                          <div className="border-l-4 border-blue-500 pl-4">
                            <Card className="shadow-md">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="text-xl font-semibold">{parentTournament.name}</h3>
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        Parent Tournament
                                      </Badge>
                                      <Badge className={parentTournament.status === 'active' ? 'bg-green-500' : parentTournament.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'}>
                                        {parentTournament.status}
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground mb-3">{parentTournament.description}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Dates:</span>
                                        <p className="font-medium">{formatDate(parentTournament.startDate)} - {formatDate(parentTournament.endDate)}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Location:</span>
                                        <p className="font-medium">{parentTournament.location}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Sub-Events:</span>
                                        <p className="font-medium">{subEvents.length}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Level:</span>
                                        <p className="font-medium">{parentTournament.level}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {/* Sub-Events */}
                          {subEvents.length > 0 && (
                            <div className="ml-8 space-y-3">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <div className="w-4 h-px bg-border"></div>
                                <span>Sub-Events ({subEvents.length})</span>
                              </div>
                              <div className="space-y-3">
                                {subEvents.map((subEvent) => (
                                  <div key={subEvent.id} className="relative">
                                    <div className="absolute -left-4 top-6 w-3 h-px bg-border"></div>
                                    <Card className="shadow-sm border-l-2 border-green-200">
                                      <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <h4 className="font-semibold">{subEvent.name}</h4>
                                              <Badge variant="outline" className="text-xs">Sub-Event</Badge>
                                              <Badge className={subEvent.status === 'active' ? 'bg-green-500' : subEvent.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'} className="text-xs">
                                                {subEvent.status}
                                              </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                              <div>
                                                <span className="text-muted-foreground">Dates:</span>
                                                <p className="font-medium">{formatDate(subEvent.startDate)} - {formatDate(subEvent.endDate)}</p>
                                              </div>
                                              <div>
                                                <span className="text-muted-foreground">Location:</span>
                                                <p className="font-medium">{subEvent.location}</p>
                                              </div>
                                              <div>
                                                <span className="text-muted-foreground">Entry Fee:</span>
                                                <p className="font-medium">${subEvent.entryFee}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button variant="ghost" size="sm">
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Single Tournaments */}
            {(() => {
              const singleTournaments = allTournaments.filter(t => !t.isParent && !t.isSubEvent && !t.isTeamTournament);
              return singleTournaments.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-orange-500">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Single Tournaments</h2>
                      <p className="text-muted-foreground">
                        {singleTournaments.length} individual tournaments
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {singleTournaments.map((tournament) => (
                      <Card key={tournament.id} className="shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold">{tournament.name}</h3>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Single Tournament
                                </Badge>
                                <Badge className={tournament.status === 'active' ? 'bg-green-500' : tournament.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'}>
                                  {tournament.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{tournament.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Dates:</span>
                                  <p className="font-medium">{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Location:</span>
                                  <p className="font-medium">{tournament.location}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Entry Fee:</span>
                                  <p className="font-medium">${tournament.entryFee}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Level:</span>
                                  <p className="font-medium">{tournament.level}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Team Tournaments */}
            {(() => {
              const teamTournaments = allTournaments.filter(t => t.isTeamTournament);
              return teamTournaments.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-purple-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Team Tournaments</h2>
                      <p className="text-muted-foreground">
                        {teamTournaments.length} team-based tournaments
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {teamTournaments.map((tournament) => (
                      <Card key={tournament.id} className="shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold">{tournament.name}</h3>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                  Team Tournament
                                </Badge>
                                <Badge className={tournament.status === 'active' ? 'bg-green-500' : tournament.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'}>
                                  {tournament.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{tournament.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Dates:</span>
                                  <p className="font-medium">{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Location:</span>
                                  <p className="font-medium">{tournament.location}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Team Size:</span>
                                  <p className="font-medium">{tournament.minTeamSize}-{tournament.maxTeamSize} players</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Max Teams:</span>
                                  <p className="font-medium">{tournament.maxTeams}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Tournament Creation Dialog - PRESERVED FROM ORIGINAL */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

      {/* Tournament Creation Form - PRESERVED FROM ORIGINAL */}
      {isCreateFormOpen && (
        <CreateMultiEventTournamentForm 
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          tournamentType={createTournamentType}
        />
      )}
    </div>
  );
}