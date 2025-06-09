/**
 * PKL-278651-PLAYER-ADMIN-001 - Player Management Admin Interface
 * Comprehensive player management system for administrators
 */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Ban, 
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  UserPlus
} from 'lucide-react';

interface Player {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  duprRating?: number;
  pcpRating?: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  status: 'active' | 'suspended' | 'banned' | 'inactive';
  membershipType: 'free' | 'premium' | 'coach' | 'facility';
  joinedDate: string;
  lastActive?: string;
  totalMatches: number;
  winRate: number;
  achievements: string[];
  certifications: string[];
  coachingStatus?: 'none' | 'aspiring' | 'certified' | 'facility';
  notes?: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  banned: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};

const membershipColors = {
  free: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  coach: 'bg-emerald-100 text-emerald-800',
  facility: 'bg-orange-100 text-orange-800'
};

const skillLevelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  pro: 'bg-red-100 text-red-800'
};

export default function PlayerManagement() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const { toast } = useToast();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['/api/admin/players'],
    enabled: true
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (playerData: Partial<Player> & { id: number }) => {
      const response = await fetch(`/api/admin/players/${playerData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      });
      if (!response.ok) throw new Error('Failed to update player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
      toast({
        title: "Player Updated",
        description: "Player information has been successfully updated.",
      });
      setSelectedPlayer(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update player information.",
        variant: "destructive",
      });
    }
  });

  const suspendPlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await fetch(`/api/admin/players/${playerId}/suspend`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to suspend player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
      toast({
        title: "Player Suspended",
        description: "Player account has been suspended.",
      });
    }
  });

  const activatePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await fetch(`/api/admin/players/${playerId}/activate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to activate player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/players'] });
      toast({
        title: "Player Activated",
        description: "Player account has been activated.",
      });
    }
  });

  // Filter players based on search and filters
  const filteredPlayers = players.filter((player: Player) => {
    const matchesSearch = 
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${player.firstName || ''} ${player.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
    const matchesMembership = membershipFilter === 'all' || player.membershipType === membershipFilter;
    const matchesSkill = skillFilter === 'all' || player.skillLevel === skillFilter;
    
    return matchesSearch && matchesStatus && matchesMembership && matchesSkill;
  });

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Player Management</h1>
          <p className="text-gray-600 mt-1">
            Manage player accounts, memberships, and development progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Players
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Players</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Players</p>
                <p className="text-2xl font-bold">
                  {players.filter((p: Player) => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium Members</p>
                <p className="text-2xl font-bold">
                  {players.filter((p: Player) => p.membershipType === 'premium').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coaches</p>
                <p className="text-2xl font-bold">
                  {players.filter((p: Player) => p.membershipType === 'coach').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search Players</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membership-filter">Membership</Label>
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-filter">Skill Level</Label>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="pro">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>Players ({filteredPlayers.length})</CardTitle>
          <CardDescription>
            Manage player accounts and view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPlayers.map((player: Player) => (
              <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username}</h3>
                      <Badge className={statusColors[player.status]}>{player.status}</Badge>
                      <Badge className={membershipColors[player.membershipType]}>{player.membershipType}</Badge>
                      <Badge className={skillLevelColors[player.skillLevel]}>{player.skillLevel}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{player.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>DUPR: {player.duprRating || 'Unrated'}</span>
                      <span>PCP: {player.pcpRating || 'Unrated'}</span>
                      <span>Matches: {player.totalMatches}</span>
                      <span>Win Rate: {player.winRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPlayer(player)}>
                        <Edit className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Player Details - {player.displayName || player.username}</DialogTitle>
                        <DialogDescription>
                          View and manage player information, progress, and account status
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                          <TabsTrigger value="activity">Activity</TabsTrigger>
                          <TabsTrigger value="admin">Admin</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Username</Label>
                              <p className="text-sm text-gray-600">{player.username}</p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm text-gray-600">{player.email}</p>
                            </div>
                            <div>
                              <Label>Full Name</Label>
                              <p className="text-sm text-gray-600">
                                {`${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <Label>Age</Label>
                              <p className="text-sm text-gray-600">{calculateAge(player.dateOfBirth)}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p className="text-sm text-gray-600">{player.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>Location</Label>
                              <p className="text-sm text-gray-600">{player.location || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>Member Since</Label>
                              <p className="text-sm text-gray-600">
                                {new Date(player.joinedDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <Label>Last Active</Label>
                              <p className="text-sm text-gray-600">
                                {player.lastActive ? new Date(player.lastActive).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="progress" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>DUPR Rating</Label>
                              <p className="text-sm text-gray-600">{player.duprRating || 'Unrated'}</p>
                            </div>
                            <div>
                              <Label>PCP Rating</Label>
                              <p className="text-sm text-gray-600">{player.pcpRating || 'Unrated'}</p>
                            </div>
                            <div>
                              <Label>Skill Level</Label>
                              <Badge className={skillLevelColors[player.skillLevel]}>{player.skillLevel}</Badge>
                            </div>
                            <div>
                              <Label>Coaching Status</Label>
                              <p className="text-sm text-gray-600">{player.coachingStatus || 'None'}</p>
                            </div>
                          </div>
                          <div>
                            <Label>Achievements</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {player.achievements.length > 0 ? player.achievements.map((achievement, index) => (
                                <Badge key={index} variant="secondary">{achievement}</Badge>
                              )) : (
                                <span className="text-sm text-gray-500">No achievements yet</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label>Certifications</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {player.certifications.length > 0 ? player.certifications.map((cert, index) => (
                                <Badge key={index} variant="outline">{cert}</Badge>
                              )) : (
                                <span className="text-sm text-gray-500">No certifications</span>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Total Matches</Label>
                              <p className="text-2xl font-bold text-blue-600">{player.totalMatches}</p>
                            </div>
                            <div>
                              <Label>Win Rate</Label>
                              <p className="text-2xl font-bold text-green-600">{player.winRate}%</p>
                            </div>
                            <div>
                              <Label>Membership Type</Label>
                              <Badge className={membershipColors[player.membershipType]}>{player.membershipType}</Badge>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="admin" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Account Status</Label>
                              <Badge className={statusColors[player.status]}>{player.status}</Badge>
                            </div>
                            <div>
                              <Label>Actions</Label>
                              <div className="flex gap-2">
                                {player.status === 'active' ? (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => suspendPlayerMutation.mutate(player.id)}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Suspend
                                  </Button>
                                ) : (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => activatePlayerMutation.mutate(player.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Activate
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="admin-notes">Admin Notes</Label>
                            <Textarea
                              id="admin-notes"
                              placeholder="Add administrative notes about this player..."
                              value={player.notes || ''}
                              rows={4}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}