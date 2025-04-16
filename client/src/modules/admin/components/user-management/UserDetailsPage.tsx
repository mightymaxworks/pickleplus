/**
 * PKL-278651-ADMIN-0015-USER
 * User Details Page
 * 
 * This component displays detailed user information and management options
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, UserCog, Shield, Calendar, Activity, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserDetails, getUserActions, getUserMatches } from '@/lib/api/admin/user-management';
import type { User } from '@shared/types';
import { UserProfileHeader } from './UserProfileHeader';
import { UserNotesPanel } from './UserNotesPanel';
import { UserActionHistory } from './UserActionHistory';
import { UserStatusPanel } from './UserStatusPanel';
import { UserLoginHistoryTable } from './UserLoginHistoryTable';
import { UserActivityStats } from './UserActivityStats';
import { UserMatchHistory } from './UserMatchHistory';
import { UserScoresPanel } from './UserScoresPanel';

/**
 * User Details Page Component
 */
const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch user details
  const { data: userDetails, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => await getUserDetails(userId),
    enabled: !isNaN(userId),
    refetchOnWindowFocus: false
  });
  
  // Set page title
  useEffect(() => {
    if (userDetails?.user) {
      const { displayName, username } = userDetails.user;
      document.title = `Pickle+ Admin | ${displayName || username}`;
    } else {
      document.title = 'Pickle+ Admin | User Details';
    }
    
    return () => {
      document.title = 'Pickle+ Admin';
    };
  }, [userDetails?.user]);
  
  // Handle invalid user ID
  if (isNaN(userId)) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>Invalid user ID provided. Please select a valid user.</AlertDescription>
      </Alert>
    );
  }
  
  // Handle loading state
  if (isLoading) {
    return <UserDetailsPageSkeleton />;
  }
  
  // Handle error state
  if (error || !userDetails) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>Failed to load user details. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  
  // Handle user not found
  if (!userDetails.user) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>User not found. The user may have been deleted or you don't have permission to view this user.</AlertDescription>
      </Alert>
    );
  }
  
  const { user, notes, accountStatus, recentActions, loginHistory, permissions } = userDetails;
  
  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-xl font-semibold">User Management</h1>
        </div>
      </div>
      
      {/* User profile header */}
      <UserProfileHeader user={user} accountStatus={accountStatus} />
      
      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Matches</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Basic user information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Username</p>
                      <p>{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{user.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                      <p>{user.displayName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p>{user.location || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Join Date</p>
                      <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Passport ID</p>
                      <p>{user.passportId || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">XP / Level</p>
                      <p>{user.xp} / {user.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Status Panel */}
            <div>
              <UserStatusPanel userId={userId} currentStatus={accountStatus} />
            </div>
            
            {/* Notes Panel */}
            <div className="md:col-span-3">
              <UserNotesPanel userId={userId} notes={notes} />
            </div>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="space-y-4">
            <UserActivityStats user={user} />
            {/* User Scores Panel - Edit XP and Ranking Points */}
            <UserScoresPanel userId={userId} user={user} />
            <UserActionHistory userId={userId} initialActions={recentActions} />
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>
                  Recent login attempts for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserLoginHistoryTable loginHistory={loginHistory} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Matches Tab */}
        <TabsContent value="matches">
          <UserMatchHistory userId={userId} />
        </TabsContent>
        
        {/* Admin Action History Tab */}
        <TabsContent value="history">
          <UserActionHistory userId={userId} initialActions={recentActions} showAllActions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Loading skeleton for user details page
 */
const UserDetailsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
    
    <div className="w-full p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
    
    <div className="w-full">
      <Skeleton className="h-10 w-full max-w-md mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="w-full p-6 rounded-lg border bg-card shadow-sm">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="w-full p-6 rounded-lg border bg-card shadow-sm">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-9 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default UserDetailsPage;