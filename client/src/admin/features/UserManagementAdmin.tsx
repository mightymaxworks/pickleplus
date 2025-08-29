/**
 * Unified User Management Admin Feature
 * 
 * PKL-278651-ADMIN-USER-001 - User Management Integration
 * UDF Rule 18-21 Compliance - Security-first admin framework integration
 * Consolidates existing user management into unified admin system
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, RefreshCw, UserCheck, UserX, Shield, Activity } from 'lucide-react';
import { AdminLayout } from '../core/AdminLayout';
import { AdminDataTable } from '../core/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ColumnDef } from '@tanstack/react-table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * UDF-Compliant User Entity Structure
 */
interface UserEntity {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  isAdmin: boolean;
  isCoach: boolean;
  isReferee: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  totalMatches?: number;
  rankingPoints?: number;
}

/**
 * User Management Admin Feature Component
 * Following UDF Rule 21 - Interactive data tables with comprehensive actions
 */
const UserManagementAdmin: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users using new Admin API v1
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/admin/v1/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/v1/users');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // User status update mutation with audit logging
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: number; status: string; reason: string }) => {
      const response = await apiRequest('PUT', `/api/admin/v1/users/${userId}/status`, {
        status,
        reason,
        action: 'status_update'
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/v1/users'] });
      toast({
        title: "User Status Updated",
        description: `User ${variables.userId} status changed to ${variables.status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Status Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Role update mutation with security validation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: number; roles: { isAdmin?: boolean; isCoach?: boolean; isReferee?: boolean } }) => {
      const response = await apiRequest('PUT', `/api/admin/v1/users/${userId}/roles`, {
        ...roles,
        action: 'role_update'
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/v1/users'] });
      toast({
        title: "User Roles Updated",
        description: `User ${variables.userId} roles have been updated`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Role Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Define table columns with UDF-compliant actions
  const columns: ColumnDef<UserEntity>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }: { row: any }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('username')}</span>
          {row.original.displayName && (
            <span className="text-sm text-gray-500">{row.original.displayName}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: any }) => (
        <span className="text-sm">{row.getValue('email')}</span>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        const roles = [];
        if (user.isAdmin) roles.push('Admin');
        if (user.isCoach) roles.push('Coach');
        if (user.isReferee) roles.push('Referee');
        if (roles.length === 0) roles.push('Player');
        
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge 
                key={role}
                variant={role === 'Admin' ? 'destructive' : role === 'Coach' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {role}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge 
            variant={
              status === 'active' ? 'default' : 
              status === 'inactive' ? 'secondary' : 
              status === 'suspended' ? 'destructive' : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalMatches',
      header: 'Matches',
      cell: ({ row }: { row: any }) => (
        <span className="text-sm">{row.getValue('totalMatches') || 0}</span>
      ),
    },
    {
      accessorKey: 'rankingPoints',
      header: 'Points',
      cell: ({ row }: { row: any }) => (
        <span className="text-sm font-mono">{row.getValue('rankingPoints') || 0}</span>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }: { row: any }) => {
        const lastLogin = row.getValue('lastLoginAt');
        if (!lastLogin) return <span className="text-gray-400">Never</span>;
        const date = new Date(lastLogin);
        return <span className="text-sm text-gray-600">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewUser(user)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditUser(user)}
              title="Edit User"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleToggleStatus(user)}
              title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
            >
              {user.status === 'active' ? (
                <UserX className="h-4 w-4 text-orange-600" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  // Action handlers following UDF security practices
  const handleViewUser = (user: UserEntity) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: UserEntity) => {
    setSelectedUser(user);
    setShowUserEdit(true);
  };

  const handleToggleStatus = (user: UserEntity) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const reason = newStatus === 'suspended' ? 'Admin action' : 'Reactivation';
    
    updateUserStatusMutation.mutate({
      userId: user.id,
      status: newStatus,
      reason
    });
  };

  const handleCreateUser = () => {
    toast({
      title: "Create User",
      description: "User creation feature coming soon",
    });
  };

  const handleBulkAction = (action: string, selectedIds: number[]) => {
    toast({
      title: "Bulk Action",
      description: `${action} for ${selectedIds.length} users`,
    });
  };

  // Quick action buttons for admin toolbar
  const quickActions = [
    {
      label: 'Add User',
      icon: <Plus className="h-4 w-4" />,
      onClick: handleCreateUser,
      variant: 'default' as const,
    },
    {
      label: 'Refresh',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => refetch(),
      variant: 'outline' as const,
    },
    {
      label: 'Export Users',
      icon: <Activity className="h-4 w-4" />,
      onClick: () => toast({ title: "Export", description: "Export functionality coming soon" }),
      variant: 'outline' as const,
    },
  ];

  // Bulk actions for selected users
  const bulkActions = [
    { label: 'Activate', value: 'activate' },
    { label: 'Suspend', value: 'suspend' },
    { label: 'Export', value: 'export' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions with comprehensive audit logging
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

        {/* Advanced Data Table with UDF Compliance */}
        <AdminDataTable
          data={users}
          columns={columns}
          loading={isLoading}
          error={error?.message || null}
          searchPlaceholder="Search users by username, email, or ID..."
        />

        {/* User Details Modal */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>User Details: {selectedUser?.username}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="font-mono">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Login</label>
                    <p>{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Matches</label>
                    <p>{selectedUser.totalMatches || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ranking Points</label>
                    <p className="font-mono">{selectedUser.rankingPoints || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* User Edit Modal */}
        <Dialog open={showUserEdit} onOpenChange={setShowUserEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                User editing interface will be implemented with proper form validation and audit logging.
              </p>
              <Button onClick={() => setShowUserEdit(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserManagementAdmin;