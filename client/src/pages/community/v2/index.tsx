/**
 * @component CommunityHubV2
 * @layer UI
 * @version 0.1.0
 * @description NodeBB-based Community Hub v2 main entry point
 * @openSource Integrated with NodeBB@2.8.0 
 * @integrationPattern Iframe
 * @lastModified 2025-04-17
 * @sprint PKL-278651-COMM-0011-OSI
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  Settings, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export default function CommunityHubV2() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth(); // useAuth provides the user object
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discussions');
  const [isIntegrationReady, setIsIntegrationReady] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Placeholder for a future API endpoint that will check NodeBB status
  const { data: nodebbStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['/api/nodebb/status'],
    enabled: false, // Disable for now as we don't have the endpoint yet
  });
  
  useEffect(() => {
    // In the future, this will authenticate with NodeBB
    if (isAuthenticated && user && iframeRef.current) {
      // Will be implemented in Sprint 2: Authentication and API Integration
      console.log('User authenticated, ready for NodeBB integration:', user.id);
      
      // Simulate successful integration for now
      setTimeout(() => {
        setIsIntegrationReady(true);
      }, 1500);
    }
  }, [isAuthenticated, user]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Hub</h1>
          <p className="text-muted-foreground">Connect with fellow pickleball enthusiasts</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <span className="text-primary font-semibold mr-1">v2</span> 
          <span className="text-xs text-muted-foreground">Beta</span>
        </Badge>
      </div>
      
      <Separator className="my-4" />
      
      <Tabs defaultValue="discussions" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="discussions" className="flex items-center justify-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Discussions</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          {isAuthenticated ? (
            isIntegrationReady ? (
              <Card className="overflow-hidden border-t-0 rounded-tl-none rounded-tr-none">
                <CardContent className="p-0 h-[800px]">
                  {/* This iframe will be properly integrated with NodeBB in Sprint 2 */}
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-semibold mb-2">Community Hub v2</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Coming soon! The next generation community platform is currently in development.
                        This space will be powered by NodeBB integration.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={() => window.location.href = '/communities'}>
                          Go to Current Communities
                        </Button>
                        <Button>
                          Learn More
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sign in to access the community</CardTitle>
                <CardDescription>
                  Connect with fellow pickleball enthusiasts, join discussions, and stay updated on community events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Community Events</CardTitle>
              <CardDescription>
                Find and join upcoming pickleball events in your area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 border rounded-md bg-muted/50">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Event integration is part of Sprint 5 in our development plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Community Members</CardTitle>
              <CardDescription>
                Connect with other pickleball players and build your network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 border rounded-md bg-muted/50">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Member directory integration is part of Sprint 4 in our development plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Community Settings</CardTitle>
              <CardDescription>
                Manage your community preferences and notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 border rounded-md bg-muted/50">
                <div className="text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Settings integration is part of Sprint 5 in our development plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 border rounded-md bg-amber-50 border-amber-200">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Community Hub v2 Beta</h3>
            <p className="text-sm text-amber-700 mt-1">
              This is a preview of the new community hub powered by NodeBB. The current community features 
              remain available at <a href="/communities" className="font-medium underline">Communities</a>.
              We welcome your feedback as we develop this new experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}