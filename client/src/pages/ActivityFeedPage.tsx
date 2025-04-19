/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Page
 * 
 * This page demonstrates the real-time activity feed component.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActivityFeed from '@/components/community/ActivityFeed';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, RefreshCw, Plus, Bell, Settings, Users } from 'lucide-react';

/**
 * ActivityFeedPage Component
 */
export default function ActivityFeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communityId, setCommunityId] = useState<number | undefined>(undefined);
  const [feedTab, setFeedTab] = useState('all');
  const [newActivityContent, setNewActivityContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle posting a new activity
   */
  const handlePostActivity = async () => {
    if (!newActivityContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter activity content',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new activity via the API
      const response = await apiRequest('POST', '/api/activities/create', {
        content: newActivityContent,
        type: 'comment',
        communityId: communityId || null
      });

      if (!response.ok) {
        throw new Error(`Failed to post activity: ${response.statusText}`);
      }

      // Success
      toast({
        title: 'Success',
        description: 'Activity posted successfully',
        variant: 'default'
      });

      // Clear the input
      setNewActivityContent('');
    } catch (error) {
      console.error('Error posting activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to post activity',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Activity Feed</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={communityId ? communityId.toString() : 'all'}
            onValueChange={(value) => setCommunityId(value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
              <SelectItem value="1">Pickle+ Giveaway Group</SelectItem>
              <SelectItem value="2">Seattle Pickleball Club</SelectItem>
              <SelectItem value="3">Tournament Players</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Real-time updates from the Pickle+ community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tabs for different feed views */}
              <Tabs defaultValue="all" value={feedTab} onValueChange={setFeedTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Activity</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="mentions">Mentions</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Post a new activity */}
              <div className="mb-6 p-4 border rounded-lg">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="new-activity">Post a new activity</Label>
                  <Input
                    id="new-activity"
                    placeholder="What's happening in your pickleball world?"
                    value={newActivityContent}
                    onChange={(e) => setNewActivityContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handlePostActivity}
                      disabled={isSubmitting || !newActivityContent.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Post Activity
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity Feed Component */}
              <ActivityFeed 
                communityId={communityId}
                maxHeight={500}
                showRefreshButton={true}
                emptyMessage="No activities to display. Be the first to post something!"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activity Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span>Notifications</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Feed Preferences</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Following</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                The Activity Feed provides real-time updates from your Pickle+ network, including match
                results, tournament announcements, community events, and more.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Activities from communities you join will automatically appear in your feed.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}