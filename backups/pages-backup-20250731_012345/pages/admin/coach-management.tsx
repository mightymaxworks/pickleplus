/**
 * PKL-278651-COACH-DUAL-ROLE - Admin Coach Management Page
 * Allows admins to view and manage coach role assignments
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CoachRoleManager } from '@/components/admin/CoachRoleManager';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter, 
  Settings,
  Star,
  Calendar,
  Building
} from 'lucide-react';

interface Coach {
  id: number;
  userId: number;
  name: string;
  currentRoles: string[];
  status: string;
  averageRating: number;
  totalSessions: number;
  joinedAt: string;
}

export default function CoachManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ['/api/admin/coaches'],
    enabled: true
  });

  const filteredCoaches = coaches.filter((coach: Coach) => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coach.status === statusFilter;
    const matchesRole = roleFilter === 'all' || coach.currentRoles.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'independent': return <Users className="w-4 h-4" />;
      case 'facility': return <Building className="w-4 h-4" />;
      case 'guest': return <Star className="w-4 h-4" />;
      case 'volunteer': return <Calendar className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coach Management</h1>
          <p className="text-gray-600 mt-1">
            Manage coach role assignments and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredCoaches.length} coaches
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="independent">Independent</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coach List */}
      <div className="grid gap-4">
        {filteredCoaches.map((coach: Coach) => (
          <Card key={coach.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {coach.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{coach.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(coach.status)}>
                        {coach.status}
                      </Badge>
                      <div className="flex gap-1">
                        {coach.currentRoles.map(role => (
                          <Badge key={role} variant="outline" className="flex items-center gap-1">
                            {getRoleIcon(role)}
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Rating</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {coach.averageRating.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Sessions</div>
                    <div className="font-semibold">{coach.totalSessions}</div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCoach(coach)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Roles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Manage Coach Roles</DialogTitle>
                      </DialogHeader>
                      {selectedCoach && (
                        <CoachRoleManager
                          coachId={selectedCoach.userId}
                          currentRoles={selectedCoach.currentRoles}
                          coachName={selectedCoach.name}
                          onRoleChange={(newRoles) => {
                            // Update the coach list locally
                            setSelectedCoach(prev => prev ? {...prev, currentRoles: newRoles} : null);
                          }}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCoaches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No coaches found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No coaches have been approved yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}