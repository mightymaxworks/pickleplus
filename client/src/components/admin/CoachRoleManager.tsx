/**
 * PKL-278651-COACH-DUAL-ROLE - Coach Role Management Component
 * Allows admins to assign coaches as both independent and facility coaches
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Building, 
  Star, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

interface CoachRoleManagerProps {
  coachId: number;
  currentRoles: string[];
  coachName: string;
  onRoleChange?: (newRoles: string[]) => void;
}

interface RoleAssignment {
  roleType: 'independent' | 'facility' | 'guest' | 'volunteer';
  isActive: boolean;
  facilityId?: number;
  notes?: string;
}

export function CoachRoleManager({ 
  coachId, 
  currentRoles, 
  coachName, 
  onRoleChange 
}: CoachRoleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([
    { roleType: 'independent', isActive: currentRoles.includes('independent') },
    { roleType: 'facility', isActive: currentRoles.includes('facility') },
    { roleType: 'guest', isActive: currentRoles.includes('guest') },
    { roleType: 'volunteer', isActive: currentRoles.includes('volunteer') }
  ]);
  
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [roleNotes, setRoleNotes] = useState('');

  const updateRolesMutation = useMutation({
    mutationFn: async (data: { 
      coachId: number; 
      roles: RoleAssignment[];
      facilityId?: number;
      notes?: string;
    }) => {
      const response = await apiRequest('PUT', `/api/admin/coaches/${data.coachId}/roles`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coach Roles Updated",
        description: `Successfully updated role assignments for ${coachName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaches'] });
      const activeRoles = roleAssignments
        .filter(r => r.isActive)
        .map(r => r.roleType);
      onRoleChange?.(activeRoles);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleToggle = (roleType: string, isActive: boolean) => {
    setRoleAssignments(prev => 
      prev.map(r => 
        r.roleType === roleType 
          ? { ...r, isActive }
          : r
      )
    );
  };

  const handleSaveChanges = () => {
    const activeRoles = roleAssignments.filter(r => r.isActive);
    
    if (activeRoles.length === 0) {
      toast({
        title: "Invalid Configuration",
        description: "A coach must have at least one active role",
        variant: "destructive",
      });
      return;
    }

    updateRolesMutation.mutate({
      coachId,
      roles: roleAssignments,
      facilityId: selectedFacility || undefined,
      notes: roleNotes
    });
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'independent': return <Users className="w-4 h-4" />;
      case 'facility': return <Building className="w-4 h-4" />;
      case 'guest': return <Star className="w-4 h-4" />;
      case 'volunteer': return <Calendar className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (roleType: string) => {
    switch (roleType) {
      case 'independent': return 'Can offer private coaching services independently';
      case 'facility': return 'Assigned to specific facility for coaching duties';
      case 'guest': return 'Temporary or event-based coaching privileges';
      case 'volunteer': return 'Community volunteer coaching role';
      default: return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Coach Role Management - {coachName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Roles Display */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Current Active Roles</Label>
          <div className="flex flex-wrap gap-2">
            {currentRoles.map(role => (
              <Badge key={role} variant="default" className="flex items-center gap-1">
                {getRoleIcon(role)}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            ))}
            {currentRoles.length === 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                No Active Roles
              </Badge>
            )}
          </div>
        </div>

        {/* Role Assignment Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Role Assignments</Label>
          
          {roleAssignments.map((assignment) => (
            <div key={assignment.roleType} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getRoleIcon(assignment.roleType)}
                <div>
                  <div className="font-medium">
                    {assignment.roleType.charAt(0).toUpperCase() + assignment.roleType.slice(1)} Coach
                  </div>
                  <div className="text-sm text-gray-600">
                    {getRoleDescription(assignment.roleType)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`role-${assignment.roleType}`} className="text-sm">
                  {assignment.isActive ? 'Active' : 'Inactive'}
                </Label>
                <Switch
                  id={`role-${assignment.roleType}`}
                  checked={assignment.isActive}
                  onCheckedChange={(checked) => 
                    handleRoleToggle(assignment.roleType, checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Facility Assignment (if facility role is active) */}
        {roleAssignments.find(r => r.roleType === 'facility')?.isActive && (
          <div className="space-y-2">
            <Label htmlFor="facility-select">Facility Assignment</Label>
            <Select onValueChange={(value) => setSelectedFacility(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a facility..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Downtown Sports Complex</SelectItem>
                <SelectItem value="2">Community Recreation Center</SelectItem>
                <SelectItem value="3">Elite Pickleball Academy</SelectItem>
                <SelectItem value="4">Riverside Courts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="role-notes">Administrative Notes</Label>
          <Textarea
            id="role-notes"
            value={roleNotes}
            onChange={(e) => setRoleNotes(e.target.value)}
            placeholder="Add notes about role assignments, special permissions, or restrictions..."
            rows={3}
          />
        </div>

        {/* Dual Role Information */}
        {roleAssignments.filter(r => r.isActive).length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Multiple Role Assignment</h3>
                <p className="text-sm text-blue-700">
                  This coach will have multiple active roles. They can operate as both an independent coach 
                  and be assigned to facilities as needed. This provides maximum flexibility for coaching 
                  opportunities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            setRoleAssignments([
              { roleType: 'independent', isActive: currentRoles.includes('independent') },
              { roleType: 'facility', isActive: currentRoles.includes('facility') },
              { roleType: 'guest', isActive: currentRoles.includes('guest') },
              { roleType: 'volunteer', isActive: currentRoles.includes('volunteer') }
            ]);
            setRoleNotes('');
          }}>
            Reset Changes
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={updateRolesMutation.isPending}
          >
            {updateRolesMutation.isPending ? 'Updating...' : 'Save Role Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}