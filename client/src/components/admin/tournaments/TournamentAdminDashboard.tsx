/**
 * Tournament Admin Dashboard
 * Enhanced version with better tournament representation and management
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  DollarSign, 
  Star, 
  Plus,
  Eye,
  Edit,
  Download,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface Tournament {
  id: number;
  name: string;
  description?: string;
  level: string;
  status: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  registrationEndDate?: Date;
  entryFee?: number;
  maxParticipants?: number;
  prizePool?: number;
  category?: string;
  division?: string;
  organizer?: string;
  numberOfCourts?: number;
  createdAt: Date;
  parentTournamentId?: number;
  isParent?: boolean;
  isSubEvent?: boolean;
}

const levelColors = {
  'club': 'bg-green-100 text-green-800',
  'district': 'bg-blue-100 text-blue-800',
  'city': 'bg-purple-100 text-purple-800',
  'provincial': 'bg-orange-100 text-orange-800',
  'national': 'bg-red-100 text-red-800',
  'regional': 'bg-indigo-100 text-indigo-800',
  'international': 'bg-yellow-100 text-yellow-800'
};

const statusColors = {
  'upcoming': 'bg-blue-100 text-blue-800',
  'active': 'bg-green-100 text-green-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800'
};

export default function TournamentAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const response = await fetch('/api/tournaments');
      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }
      return response.json();
    },
  });

  // Helper functions for hierarchy management
  const toggleParentExpansion = (parentId: number) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Group tournaments by hierarchy based on actual data structure
  const { parentTournaments, standaloneTournaments, subTournamentsByParent } = useMemo(() => {
    const parents: Tournament[] = [];
    const standalone: Tournament[] = [];
    const subsByParent: { [parentId: number]: Tournament[] } = {};

    // First pass: identify actual parent-child relationships from database
    const childTournaments = tournaments.filter(t => t.parentTournamentId);
    const parentIds = new Set(childTournaments.map(t => t.parentTournamentId));

    // Organize child tournaments by parent
    childTournaments.forEach(child => {
      const parentId = child.parentTournamentId;
      if (parentId) {
        if (!subsByParent[parentId]) {
          subsByParent[parentId] = [];
        }
        subsByParent[parentId].push(child);
      }
    });

    // Second pass: categorize tournaments
    tournaments.forEach(tournament => {
      const hasParentId = tournament.parentTournamentId;
      if (hasParentId) {
        // This is a child tournament - already handled above
        return;
      } else if (parentIds.has(tournament.id)) {
        // This is a parent tournament (has children)
        parents.push(tournament);
      } else {
        // This is a standalone tournament
        standalone.push(tournament);
      }
    });

    return { 
      parentTournaments: parents, 
      standaloneTournaments: standalone, 
      subTournamentsByParent: subsByParent 
    };
  }, [tournaments]);

  // Filter and sort tournaments
  const filteredAndSortedTournaments = useMemo(() => {
    console.log('[Filter Debug] View mode:', viewMode);
    console.log('[Filter Debug] All tournaments count:', tournaments.length);
    
    const allTournaments = viewMode === 'hierarchy' ? 
      [...parentTournaments, ...standaloneTournaments] : 
      // In flat view, exclude child tournaments - they should only appear grouped under parents
      tournaments.filter(t => !t.parentTournamentId);
    
    console.log('[Filter Debug] Tournaments after view filter:', allTournaments.length);
    console.log('[Filter Debug] Child tournaments being filtered out:', tournaments.filter(t => t.parentTournamentId).map(t => ({id: t.id, name: t.name, parentId: t.parentTournamentId})));

    let filtered = allTournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.organizer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || tournament.level === levelFilter;
      const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
      
      return matchesSearch && matchesLevel && matchesStatus;
    });

    // Sort tournaments
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'prize':
          aValue = a.prizePool || 0;
          bValue = b.prizePool || 0;
          break;
        case 'participants':
          aValue = a.maxParticipants || 0;
          bValue = b.maxParticipants || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tournaments, searchTerm, levelFilter, statusFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = tournaments.length;
    const upcoming = tournaments.filter(t => t.status === 'upcoming').length;
    const active = tournaments.filter(t => t.status === 'active').length;
    const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);
    const totalParticipants = tournaments.reduce((sum, t) => sum + (t.maxParticipants || 0), 0);
    
    return { total, upcoming, active, totalPrizePool, totalParticipants };
  }, [tournaments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tournament Administration</h1>
          <p className="text-gray-600">Manage tournaments, eligibility criteria, and participant registration</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Tournament
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tournaments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Prize Pool</p>
                <p className="text-2xl font-bold">${stats.totalPrizePool.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tournaments, organizers, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="provincial">Provincial</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="prize">Prize Pool</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('hierarchy')}
                className="rounded-r-none"
              >
                <Layers className="h-4 w-4 mr-1" />
                Hierarchy
              </Button>
              <Button
                variant={viewMode === 'flat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('flat')}
                className="rounded-l-none"
              >
                <FileText className="h-4 w-4 mr-1" />
                Flat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Display */}
      {viewMode === 'hierarchy' ? (
        /* Hierarchical View */
        <div className="space-y-4">
          {/* Parent Tournaments with Sub-tournaments */}
          {parentTournaments.filter(parent => 
            parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((parentTournament) => {
            const subTournaments = subTournamentsByParent[parentTournament.id] || [];
            const isExpanded = expandedParents.has(parentTournament.id);
            
            return (
              <Card key={parentTournament.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleParentExpansion(parentTournament.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="w-full">
                      <CardHeader className="pb-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Layers className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg leading-tight line-clamp-2">
                                {parentTournament.name}
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge className={levelColors[parentTournament.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
                                {parentTournament.level}
                              </Badge>
                              <Badge className={statusColors[parentTournament.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                                {parentTournament.status}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {subTournaments.length} Sub-Events
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {subTournaments.map((subTournament) => (
                          <Card key={subTournament.id} className="border-l-4 border-l-blue-400 bg-blue-50/50">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm line-clamp-2">{subTournament.name}</h4>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline">{subTournament.division}</Badge>
                                  <Badge variant="outline">{subTournament.category}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(subTournament.startDate), 'MMM dd')}</span>
                                  </div>
                                  {subTournament.maxParticipants && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{subTournament.maxParticipants}</span>
                                    </div>
                                  )}
                                  {subTournament.prizePool && subTournament.prizePool > 0 && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>${subTournament.prizePool.toLocaleString()}</span>
                                    </div>
                                  )}
                                  {subTournament.entryFee && subTournament.entryFee > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>Fee: ${subTournament.entryFee}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}

          {/* Standalone Tournaments */}
          {standaloneTournaments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Standalone Tournaments
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {standaloneTournaments.filter(tournament => 
                  tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tournament.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tournament.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((tournament) => (
                  <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
                            {tournament.name}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={levelColors[tournament.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
                              {tournament.level}
                            </Badge>
                            <Badge className={statusColors[tournament.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                              {tournament.status}
                            </Badge>
                            {tournament.category && (
                              <Badge variant="outline">{tournament.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Tournament Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{format(new Date(tournament.startDate), 'MMM dd')}</span>
                          </div>
                          
                          {tournament.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span className="truncate">{tournament.location}</span>
                            </div>
                          )}
                          
                          {tournament.maxParticipants && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-gray-500" />
                              <span>{tournament.maxParticipants} max</span>
                            </div>
                          )}
                          
                          {tournament.prizePool && tournament.prizePool > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              <span>${tournament.prizePool.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Division and Entry Fee */}
                        {tournament.division && (
                          <div className="text-sm">
                            <span className="font-medium">Division:</span> {tournament.division}
                          </div>
                        )}
                        
                        {tournament.entryFee && tournament.entryFee > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Entry Fee:</span> ${tournament.entryFee}
                          </div>
                        )}

                        {/* Description */}
                        {tournament.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {tournament.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Flat View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
                      {tournament.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={levelColors[tournament.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
                        {tournament.level}
                      </Badge>
                      <Badge className={statusColors[tournament.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                        {tournament.status}
                      </Badge>
                      {tournament.category && (
                        <Badge variant="outline">{tournament.category}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Tournament Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>{format(new Date(tournament.startDate), 'MMM dd')}</span>
                    </div>
                    
                    {tournament.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{tournament.location}</span>
                      </div>
                    )}
                    
                    {tournament.maxParticipants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{tournament.maxParticipants} max</span>
                      </div>
                    )}
                    
                    {tournament.prizePool && tournament.prizePool > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-500" />
                        <span>${tournament.prizePool.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Division and Entry Fee */}
                  {tournament.division && (
                    <div className="text-sm">
                      <span className="font-medium">Division:</span> {tournament.division}
                    </div>
                  )}
                  
                  {tournament.entryFee && tournament.entryFee > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Entry Fee:</span> ${tournament.entryFee}
                    </div>
                  )}

                  {/* Description */}
                  {tournament.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedTournaments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first tournament.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}