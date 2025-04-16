/**
 * PKL-278651-ADMIN-0015-USER
 * Enhanced User Details Page
 * 
 * Displays comprehensive user details with admin features
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  getUserDetails, 
  addUserNote, 
  updateUserStatus 
} from '@/lib/api/admin/user-management';
import { formatDistance } from 'date-fns';

// UI Components
import AdminLayout from "@/modules/admin/components/AdminLayout";
import { UserProfileHeader } from './UserProfileHeader';
import { UserNotesPanel } from './UserNotesPanel';
import { UserActionHistory } from './UserActionHistory';
import { UserStatusPanel } from './UserStatusPanel';
import { UserLoginHistoryTable } from './UserLoginHistoryTable';
import { UserActivityStats } from './UserActivityStats';
import { UserMatchHistory } from './UserMatchHistory';

// UI Elements
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, AreaChart, Shield, History, Key, UserCog, Activity } from 'lucide-react';

const UserDetailsPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const userId = Number(id);
  
  // Fetch user details
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/admin/users', userId],
    queryFn: () => getUserDetails(userId),
    enabled: !isNaN(userId)
  });
  
  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: (noteData: { note: string; visibility: 'admin' | 'system' }) => 
      addUserNote(userId, noteData),
    onSuccess: () => {
      toast({
        title: 'Note added',
        description: 'The note has been added to the user profile'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', userId] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add note',
        variant: 'destructive'
      });
    }
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusData: { 
      status: 'active' | 'suspended' | 'restricted' | 'deactivated';
      reason?: string;
      expiresAt?: string;
    }) => updateUserStatus(userId, statusData),
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'The user account status has been updated'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', userId] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  });
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/users');
  };
  
  // Handle adding a note
  const handleAddNote = (noteData: { note: string; visibility: 'admin' | 'system' }) => {
    addNoteMutation.mutate(noteData);
  };
  
  // Handle updating status
  const handleUpdateStatus = (statusData: { 
    status: 'active' | 'suspended' | 'restricted' | 'deactivated';
    reason?: string;
    expiresAt?: string;
  }) => {
    updateStatusMutation.mutate(statusData);
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (isError) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as Error)?.message || 'Failed to load user details'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  const { user, notes, accountStatus, recentActions, permissions, loginHistory } = data!;
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold flex-1">User Details</h1>
          {accountStatus && accountStatus.status !== 'active' && (
            <Badge variant="destructive" className="ml-2 text-base py-1 px-2">
              {accountStatus.status.toUpperCase()}
            </Badge>
          )}
        </div>
        
        {/* User Profile Header */}
        <UserProfileHeader 
          user={user} 
          accountStatus={accountStatus} 
          onUpdateStatus={handleUpdateStatus}
        />
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full max-w-4xl">
              <TabsTrigger value="overview">
                <UserCog className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Key className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <UserActivityStats user={user} />
                </div>
                <div>
                  <UserStatusPanel 
                    accountStatus={accountStatus}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={updateStatusMutation.isPending}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <UserNotesPanel 
                    notes={notes} 
                    onAddNote={handleAddNote} 
                    isAddingNote={addNoteMutation.isPending}
                  />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Actions</CardTitle>
                      <CardDescription>Administrative actions taken on this account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UserActionHistory actions={recentActions} />
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('history')} className="w-full">
                        View All History
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Match History</CardTitle>
                  <CardDescription>Recent matches played by this user</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserMatchHistory userId={userId} />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Login History</CardTitle>
                  <CardDescription>Recent login attempts for this account</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserLoginHistoryTable loginHistory={loginHistory} />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Permissions</CardTitle>
                  <CardDescription>Permission overrides for this user</CardDescription>
                </CardHeader>
                <CardContent>
                  {permissions.length > 0 ? (
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{permission.permissionKey}</p>
                            <p className="text-sm text-muted-foreground">{permission.reason}</p>
                          </div>
                          <Badge variant={permission.allowed ? "success" : "destructive"}>
                            {permission.allowed ? 'Allowed' : 'Denied'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No permission overrides set for this user.</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Add Permission Override
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Administrative Action History</CardTitle>
                  <CardDescription>Complete history of administrative actions on this account</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActionHistory 
                    actions={recentActions} 
                    expandable 
                    showLoadMore
                    userId={userId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailsPage;