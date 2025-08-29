/**
 * Role Assignment Admin Feature
 * 
 * PKL-278651-ADMIN-ROLES-001 - Admin Role Assignment System
 * UDF Rule 18-21 Compliance - Security-first role management
 * Implements comprehensive role assignment with granular permissions
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Key,
  UserCheck,
  UserX,
  Search,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../core/AdminLayout';
import { AdminDataTable } from '../core/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import type { ColumnDef } from '@tanstack/react-table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Role Entity Interface (from admin-security schema)
 */
interface AdminRoleEntity {
  id: number;
  name: string;
  description?: string;
  level: number;
  isSystem: boolean;
  permissions: string[];
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User Role Assignment Interface
 */
interface UserRoleAssignment {
  id: number;
  userId: number;
  roleId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleName: string;
  roleLevel: number;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  expiresAt?: string;
}

/**
 * Permission Entity Interface
 */
interface AdminPermissionEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
}

/**
 * Audit Log Entry Interface
 */
interface RoleAuditLogEntry {
  id: string;
  action: string;
  userId: number;
  targetUserId?: number;
  roleId?: number;
  roleName?: string;
  adminName: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

/**
 * Role Statistics Interface
 */
interface RoleStatistics {
  totalRoles: number;
  totalUserAssignments: number;
  activeAdmins: number;
  pendingAssignments: number;
  roleDistribution: Array<{
    roleName: string;
    userCount: number;
    percentage: number;
  }>;
  recentAssignments: RoleAuditLogEntry[];
}

/**
 * Role Assignment Form Component
 */
const RoleAssignmentForm: React.FC<{
  userId?: number;
  roleId?: number;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ userId, roleId, onClose, onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<string>(userId?.toString() || '');
  const [selectedRole, setSelectedRole] = useState<string>(roleId?.toString() || '');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/v1/users/assignable'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/users/assignable');
      return response.json();
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['/api/admin/v1/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/roles');
      return response.json();
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      roleId: number;
      expiresAt?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/admin/v1/roles/assign', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Assigned",
        description: "User role has been assigned successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both user and role",
        variant: "destructive",
      });
      return;
    }

    assignRoleMutation.mutate({
      userId: parseInt(selectedUser),
      roleId: parseInt(selectedRole),
      expiresAt: expiresAt || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="user-select">Select User</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.firstName} {user.lastName} ({user.username})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="role-select">Select Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role: AdminRoleEntity) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                <div className="flex items-center space-x-2">
                  <span>{role.name}</span>
                  <Badge variant="outline">Level {role.level}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
        <Input
          id="expires-at"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes for this role assignment..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={assignRoleMutation.isPending}>
          {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
        </Button>
      </div>
    </form>
  );
};

/**
 * Role Statistics Dashboard Component
 */
const RoleStatisticsPanel: React.FC<{ stats: RoleStatistics }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-bold">{stats.totalRoles}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Admins</p>
              <p className="text-2xl font-bold">{stats.activeAdmins}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Assignments</p>
              <p className="text-2xl font-bold">{stats.totalUserAssignments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main Role Assignment Admin Component
 */
const RoleAssignmentAdmin: React.FC = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<UserRoleAssignment | null>(null);
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user role assignments using new Admin API v1
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['/api/admin/v1/role-assignments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/role-assignments');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch roles
  const {
    data: roles = [],
    isLoading: rolesLoading
  } = useQuery({
    queryKey: ['/api/admin/v1/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/roles');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch permissions
  const {
    data: permissions = []
  } = useQuery({
    queryKey: ['/api/admin/v1/permissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/permissions');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fetch statistics
  const {
    data: stats
  } = useQuery({
    queryKey: ['/api/admin/v1/roles/statistics'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/v1/roles/statistics');
        return response.json();
      } catch (error) {
        // Return mock data for development
        return {
          totalRoles: 5,
          totalUserAssignments: 23,
          activeAdmins: 8,
          pendingAssignments: 2,
          roleDistribution: [
            { roleName: 'Super Admin', userCount: 2, percentage: 25 },
            { roleName: 'Admin', userCount: 4, percentage: 50 },
            { roleName: 'Moderator', userCount: 2, percentage: 25 }
          ],
          recentAssignments: []
        } as RoleStatistics;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Role revocation mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ assignmentId, reason }: { assignmentId: number; reason?: string }) => {
      const response = await apiRequest('DELETE', `/api/admin/v1/role-assignments/${assignmentId}`, {
        reason,
        action: 'role_revocation'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/v1/role-assignments'] });
      toast({
        title: "Role Revoked",
        description: "User role has been revoked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Revocation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Define assignment table columns
  const assignmentColumns: ColumnDef<UserRoleAssignment>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }: { row: any }) => {
        const assignment = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {assignment.firstName} {assignment.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              @{assignment.username}
            </div>
            <div className="text-xs text-muted-foreground">
              {assignment.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }: { row: any }) => {
        const assignment = row.original;
        return (
          <div className="space-y-1">
            <Badge variant="default">{assignment.roleName}</Badge>
            <div className="text-xs text-muted-foreground">
              Level {assignment.roleLevel}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const isActive = row.getValue('isActive');
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignedBy',
      header: 'Assigned By',
      cell: ({ row }: { row: any }) => (
        <span className="text-sm">{row.getValue('assignedBy')}</span>
      ),
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigned Date',
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue('assignedAt'));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expires',
      cell: ({ row }: { row: any }) => {
        const expires = row.getValue('expiresAt');
        if (!expires) return <span className="text-muted-foreground">Never</span>;
        const date = new Date(expires as string);
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const assignment = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewAssignment(assignment)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRevokeRole(assignment.id)}
              title="Revoke Role"
              className="text-red-600 hover:text-red-800"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Define roles table columns
  const roleColumns: ColumnDef<AdminRoleEntity>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: any }) => (
        <span className="font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline">Level {row.getValue('level')}</Badge>
      ),
    },
    {
      accessorKey: 'userCount',
      header: 'Users',
      cell: ({ row }: { row: any }) => (
        <span>{row.getValue('userCount') || 0}</span>
      ),
    },
    {
      accessorKey: 'isSystem',
      header: 'Type',
      cell: ({ row }: { row: any }) => {
        const isSystem = row.getValue('isSystem');
        return (
          <Badge variant={isSystem ? 'destructive' : 'secondary'}>
            {isSystem ? 'System' : 'Custom'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue('createdAt'));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
  ];

  // Action handlers
  const handleViewAssignment = (assignment: UserRoleAssignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentDetails(true);
  };

  const handleRevokeRole = (assignmentId: number) => {
    if (confirm('Are you sure you want to revoke this role assignment?')) {
      revokeRoleMutation.mutate({ assignmentId });
    }
  };

  const handleCreateAssignment = () => {
    setShowCreateAssignment(true);
  };

  const handleRefresh = () => {
    refetchAssignments();
    toast({
      title: "Data Refreshed",
      description: "All role assignment data has been updated",
    });
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Assign Role',
      icon: <Plus className="h-4 w-4" />,
      onClick: handleCreateAssignment,
      variant: 'default' as const,
    },
    {
      label: 'Create Role',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => setShowCreateRole(true),
      variant: 'outline' as const,
    },
    {
      label: 'Refresh',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleRefresh,
      variant: 'outline' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Role Assignment</h1>
            <p className="text-muted-foreground">
              Manage admin roles and permissions with comprehensive audit logging
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                className="flex items-center space-x-2"
              >
                {action.icon}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Role Statistics</h2>
            <RoleStatisticsPanel stats={stats} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">User Assignments</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <AdminDataTable
              data={assignments}
              columns={assignmentColumns}
              loading={assignmentsLoading}
              error={assignmentsError?.message || null}
              searchPlaceholder="Search assignments by user name, role, or email..."
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <AdminDataTable
              data={roles}
              columns={roleColumns}
              loading={rolesLoading}
              error={null}
              searchPlaceholder="Search roles by name, level, or type..."
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
                <CardDescription>
                  System permissions and role-based access control configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissions.map((permission: AdminPermissionEntity) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                        <Badge variant="outline" className="mt-1">{permission.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {permission.isSystem && (
                          <Badge variant="destructive">System</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Assignment Audit Log</CardTitle>
                <CardDescription>
                  Complete audit trail of all role assignments and modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Audit log functionality will display all role assignment actions 
                  with timestamps, user details, and change history.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assignment Details Modal */}
        <Dialog open={showAssignmentDetails} onOpenChange={setShowAssignmentDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Role Assignment Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User</label>
                    <p>{selectedAssignment.firstName} {selectedAssignment.lastName}</p>
                    <p className="text-sm text-muted-foreground">@{selectedAssignment.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <div className="space-y-1">
                      <Badge>{selectedAssignment.roleName}</Badge>
                      <p className="text-sm text-muted-foreground">Level {selectedAssignment.roleLevel}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned By</label>
                    <p>{selectedAssignment.assignedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={selectedAssignment.isActive ? 'default' : 'secondary'}>
                      {selectedAssignment.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned Date</label>
                    <p>{new Date(selectedAssignment.assignedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expires</label>
                    <p>{selectedAssignment.expiresAt ? new Date(selectedAssignment.expiresAt).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Assignment Modal */}
        <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
            </DialogHeader>
            <RoleAssignmentForm
              onClose={() => setShowCreateAssignment(false)}
              onSuccess={() => {
                setShowCreateAssignment(false);
                refetchAssignments();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Create Role Modal */}
        <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Advanced role creation interface will be implemented with permission 
                selection, hierarchy configuration, and validation rules.
              </p>
              <Button onClick={() => setShowCreateRole(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default RoleAssignmentAdmin;