/**
 * PKL-278651-COMM-0028-NOTIF-PREFS - Notification Preferences Page
 * Implementation timestamp: 2025-04-20 11:20 ET
 * 
 * Dedicated page for managing notification preferences with improved UI
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell,
  Mail,
  Smartphone,
  AlertCircle,
  CheckCircle,
  RefreshCcw,
  Shield,
  Users,
  Calendar,
  Trophy,
  Medal,
  MessageSquare,
  Settings
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

// Types for notification preferences
interface NotificationChannel {
  id: number;
  type: 'in_app' | 'email' | 'push';
  name: string;
  enabled: boolean;
}

interface NotificationPreference {
  id: number;
  userId: number;
  notificationType: string; 
  category: string;
  enabled: boolean;
  channel: string;
  communityId?: number | null;
  communityName?: string | null;
}

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const NotificationPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  // Fetch notification preferences
  const { 
    data: preferences = [], 
    isLoading: preferencesLoading 
  } = useQuery<NotificationPreference[]>({
    queryKey: ['/api/notification-preferences', selectedCommunity],
    queryFn: async () => {
      const url = selectedCommunity 
        ? `/api/notification-preferences?communityId=${selectedCommunity}`
        : '/api/notification-preferences';
      
      const response = await apiRequest('GET', url);
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch available communities for filtering
  interface Community {
    id: number;
    name: string;
  }
  
  const { 
    data: communities = [] as Community[], 
    isLoading: communitiesLoading 
  } = useQuery<Community[]>({
    queryKey: ['/api/communities/mine'],
    enabled: !!user,
  });

  // Update notification preference
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const response = await apiRequest('PUT', `/api/notification-preferences/${id}`, {
        enabled
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: `Failed to update preference: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  });

  // Update all preferences of a category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ category, enabled }: { category: string, enabled: boolean }) => {
      const response = await apiRequest('POST', `/api/notification-preferences/category`, {
        category,
        enabled
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Category updated",
        description: "All notifications in this category have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: `Failed to update category: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  });

  // Toggle individual preference
  const handleTogglePreference = (id: number, enabled: boolean) => {
    updatePreferenceMutation.mutate({ id, enabled });
  };

  // Toggle all preferences in a category
  const handleToggleCategory = (category: string, enabled: boolean) => {
    updateCategoryMutation.mutate({ category, enabled });
  };

  // Filter preferences based on active tab
  const filteredPreferences = preferences.filter(pref => {
    if (activeTab === "all") return true;
    return pref.category === activeTab;
  });

  // Group preferences by category
  const groupedPreferences = filteredPreferences.reduce<Record<string, NotificationPreference[]>>(
    (acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push(pref);
      return acc;
    },
    {}
  );

  // Define notification categories with icons
  const categories: NotificationCategory[] = [
    { 
      id: "all", 
      label: "All Notifications", 
      description: "View and manage all notification settings",
      icon: <Bell className="h-5 w-5" /> 
    },
    { 
      id: "system", 
      label: "System", 
      description: "Platform updates and announcements",
      icon: <AlertCircle className="h-5 w-5" /> 
    },
    { 
      id: "match", 
      label: "Matches", 
      description: "Match invites and results",
      icon: <Trophy className="h-5 w-5" /> 
    },
    { 
      id: "achievement", 
      label: "Achievements", 
      description: "Level ups and achievements",
      icon: <Medal className="h-5 w-5" /> 
    },
    { 
      id: "community", 
      label: "Community", 
      description: "Community posts and activity",
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      id: "event", 
      label: "Events", 
      description: "Event reminders and updates",
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      id: "social", 
      label: "Social", 
      description: "Friend requests and mentions",
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      id: "ranking", 
      label: "Rankings", 
      description: "Ranking changes and updates",
      icon: <Trophy className="h-5 w-5" /> 
    },
  ];

  // Loading state
  if (preferencesLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="h-5 bg-gray-200 rounded-md w-32"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-48"></div>
                      </div>
                      <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If no preferences are set, show an empty state with helpful message
  if (preferences.length === 0 && !preferencesLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              No Notification Preferences Set
            </CardTitle>
            <CardDescription>
              You don't have any notification preferences configured yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-6 max-w-md">
              Notification preferences allow you to control what types of notifications you receive
              and how they're delivered. Default settings will be used until you customize them.
            </p>
            <Button onClick={() => navigate("/settings")}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {Array.isArray(communities) && communities.length > 0 && (
            <Select
              value={selectedCommunity?.toString() || "all"}
              onValueChange={(value) => setSelectedCommunity(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id.toString()}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            All Settings
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar with category filters */}
        <div className="hidden md:block">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeTab === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.icon}
                  <span className="ml-2">{category.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="space-y-6">
          {/* Mobile tabs */}
          <div className="md:hidden">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4">
                {categories.slice(0, 8).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    <span className="flex items-center">
                      {category.icon}
                      <span className="ml-2 hidden sm:inline">{category.label}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Notification preferences grouped by category */}
          {Object.entries(groupedPreferences).map(([category, prefs]) => {
            // Find category info
            const categoryInfo = categories.find(c => c.id === category) || {
              label: category.charAt(0).toUpperCase() + category.slice(1),
              description: "Notification settings for this category",
              icon: <Bell className="h-5 w-5" />
            };

            // Skip if empty group and not showing "all"
            if (prefs.length === 0 && activeTab !== "all") return null;

            // Skip "all" pseudo-category in grouped view
            if (category === "all") return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {categoryInfo.icon}
                      {categoryInfo.label} Notifications
                    </CardTitle>
                    <CardDescription>
                      {categoryInfo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {prefs.map((pref) => (
                        <div key={pref.id} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {formatNotificationType(pref.notificationType)}
                              {pref.communityName && (
                                <Badge variant="outline" className="ml-2">
                                  {pref.communityName}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="capitalize">{pref.channel.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <Switch
                            checked={pref.enabled}
                            onCheckedChange={(checked) => handleTogglePreference(pref.id, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-muted-foreground">
                        {prefs.length} notification {prefs.length === 1 ? 'setting' : 'settings'}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleCategory(category, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Enable All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleCategory(category, false)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Disable All
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}

          {/* No preferences message when filtered and no results */}
          {Object.keys(groupedPreferences).length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Preferences Found</CardTitle>
                <CardDescription>
                  No notification preferences match your current filter.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6">
                  Try selecting a different category or removing your community filter.
                </p>
                <Button variant="outline" onClick={() => {
                  setActiveTab("all");
                  setSelectedCommunity(null);
                }}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format notification types for display
function formatNotificationType(type: string): string {
  // Replace underscores with spaces and capitalize each word
  const formatted = type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
  
  // Map specific types to more user-friendly names if needed
  const typeMap: Record<string, string> = {
    'Community Post': 'New Community Post',
    'Community Comment': 'Post Comment',
    'Match Invitation': 'Match Invite',
    'Match Result': 'Match Results',
    'Tournament Update': 'Tournament Updates',
    'Achievement Unlocked': 'Achievement Earned',
    'Level Up': 'Level Up',
    'Rating Change': 'Rating Changed',
    'Friend Request': 'Friend Request',
    'Mention': 'Mentioned You',
    'Event Reminder': 'Event Reminder',
    'System Announcement': 'System Announcement'
  };
  
  return typeMap[formatted] || formatted;
}

export default NotificationPreferencesPage;