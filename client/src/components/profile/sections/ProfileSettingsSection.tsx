/**
 * PKL-278651-PROF-0009.6-SECT - Profile Settings Section
 * 
 * This component displays and manages user profile settings and preferences.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnhancedUser } from "@/types/enhanced-user";
import { Bell, EyeOff, Lock, Share2, Globe, UserCog, Languages } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileSettingsSectionProps {
  user: EnhancedUser;
}

interface PrivacySettings {
  publicProfile: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showStats: boolean;
  showEquipment: boolean;
  showActivityFeed: boolean;
}

interface NotificationSettings {
  matchReminders: boolean;
  tournamentUpdates: boolean;
  messageNotifications: boolean;
  friendRequests: boolean;
  systemAnnouncements: boolean;
  emailDigest: boolean;
}

export function ProfileSettingsSection({ user }: ProfileSettingsSectionProps) {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  // Get privacy settings
  const { data: privacySettings, isLoading: privacyLoading } = useQuery({
    queryKey: ['/api/profile/privacy', { userId: user.id }],
    staleTime: 300000 // 5 minutes
  });
  
  // Get notification settings
  const { data: notificationSettings, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/profile/notifications', { userId: user.id }],
    staleTime: 300000 // 5 minutes
  });
  
  // Default values for settings
  const defaultPrivacy: PrivacySettings = {
    publicProfile: true,
    showEmail: false,
    showLocation: true,
    showStats: true,
    showEquipment: true,
    showActivityFeed: true
  };
  
  const defaultNotifications: NotificationSettings = {
    matchReminders: true,
    tournamentUpdates: true,
    messageNotifications: true,
    friendRequests: true,
    systemAnnouncements: true,
    emailDigest: false
  };
  
  // Use settings from API if available, otherwise use defaults
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacy);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  
  // Update state when data loads
  React.useEffect(() => {
    if (privacySettings) {
      setPrivacy(privacySettings);
    }
  }, [privacySettings]);
  
  React.useEffect(() => {
    if (notificationSettings) {
      setNotifications(notificationSettings);
    }
  }, [notificationSettings]);
  
  // Mutation for updating privacy settings
  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings: PrivacySettings) => {
      const res = await apiRequest('PATCH', '/api/profile/privacy', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/privacy'] });
      toast({
        title: 'Privacy settings updated',
        description: 'Your privacy settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update privacy settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for updating notification settings
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const res = await apiRequest('PATCH', '/api/profile/notifications', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/notifications'] });
      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update notification settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle privacy setting changes
  const handlePrivacyChange = (field: keyof PrivacySettings, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle notification setting changes
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };
  
  // Save privacy settings
  const savePrivacySettings = () => {
    updatePrivacyMutation.mutate(privacy);
  };
  
  // Save notification settings
  const saveNotificationSettings = () => {
    updateNotificationsMutation.mutate(notifications);
  };
  
  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="h-5 w-5 mr-2 text-primary" />
            Language Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred language for the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Interface Language</Label>
              <div className="text-sm text-muted-foreground">
                Change the language used throughout the application
              </div>
            </div>
            <LanguageToggle />
          </div>
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <strong>Current language:</strong> {language === 'en' ? 'English (US)' : '中文 (简体)'}
            <br />
            Language changes apply immediately across the entire application.
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-primary" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Public Profile</Label>
                <div className="text-sm text-muted-foreground">
                  Allow others to see your profile
                </div>
              </div>
              <Switch
                checked={privacy.publicProfile}
                onCheckedChange={(value) => handlePrivacyChange('publicProfile', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Email</Label>
                <div className="text-sm text-muted-foreground">
                  Display your email address on your profile
                </div>
              </div>
              <Switch
                checked={privacy.showEmail}
                onCheckedChange={(value) => handlePrivacyChange('showEmail', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Location</Label>
                <div className="text-sm text-muted-foreground">
                  Display your location on your profile
                </div>
              </div>
              <Switch
                checked={privacy.showLocation}
                onCheckedChange={(value) => handlePrivacyChange('showLocation', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Performance Stats</Label>
                <div className="text-sm text-muted-foreground">
                  Allow others to see your performance statistics
                </div>
              </div>
              <Switch
                checked={privacy.showStats}
                onCheckedChange={(value) => handlePrivacyChange('showStats', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Equipment</Label>
                <div className="text-sm text-muted-foreground">
                  Display your equipment preferences on your profile
                </div>
              </div>
              <Switch
                checked={privacy.showEquipment}
                onCheckedChange={(value) => handlePrivacyChange('showEquipment', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Activity Feed Visibility</Label>
                <div className="text-sm text-muted-foreground">
                  Allow others to see your recent activities
                </div>
              </div>
              <Switch
                checked={privacy.showActivityFeed}
                onCheckedChange={(value) => handlePrivacyChange('showActivityFeed', value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={savePrivacySettings}
              disabled={updatePrivacyMutation.isPending}
            >
              {updatePrivacyMutation.isPending ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Match Reminders</Label>
                <div className="text-sm text-muted-foreground">
                  Receive reminders about upcoming matches
                </div>
              </div>
              <Switch
                checked={notifications.matchReminders}
                onCheckedChange={(value) => handleNotificationChange('matchReminders', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Tournament Updates</Label>
                <div className="text-sm text-muted-foreground">
                  Get notifications about tournaments you're participating in
                </div>
              </div>
              <Switch
                checked={notifications.tournamentUpdates}
                onCheckedChange={(value) => handleNotificationChange('tournamentUpdates', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Message Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive notifications for new messages
                </div>
              </div>
              <Switch
                checked={notifications.messageNotifications}
                onCheckedChange={(value) => handleNotificationChange('messageNotifications', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Friend Requests</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified about new connection requests
                </div>
              </div>
              <Switch
                checked={notifications.friendRequests}
                onCheckedChange={(value) => handleNotificationChange('friendRequests', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">System Announcements</Label>
                <div className="text-sm text-muted-foreground">
                  Receive important system-wide announcements
                </div>
              </div>
              <Switch
                checked={notifications.systemAnnouncements}
                onCheckedChange={(value) => handleNotificationChange('systemAnnouncements', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Digest</Label>
                <div className="text-sm text-muted-foreground">
                  Receive weekly email summaries of your activity
                </div>
              </div>
              <Switch
                checked={notifications.emailDigest}
                onCheckedChange={(value) => handleNotificationChange('emailDigest', value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveNotificationSettings}
              disabled={updateNotificationsMutation.isPending}
            >
              {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}