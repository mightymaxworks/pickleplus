/**
 * PKL-278651-USER-0007-UX
 * User Settings Page
 * 
 * This page allows users to manage their preferences, notification settings,
 * and other account-related configurations.
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Bell, Moon, Sun, Eye, EyeOff, Shield, Activity, Volume2, User, Globe, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('account');
  
  // Settings state - would normally be fetched from API
  const [settings, setSettings] = useState({
    account: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      publicProfile: true,
      darkMode: false,
      matchAlerts: true
    },
    privacy: {
      showRank: true,
      showActivity: true,
      allowFriendRequests: true,
      showRealName: false,
      dataSharing: 'minimal'
    },
    notification: {
      volume: 70,
      newMatchNotification: true,
      tournamentReminders: true,
      achievementAlerts: true,
      matchResultAlerts: true,
      systemUpdates: true
    },
    display: {
      fontSize: 'medium',
      highContrast: false,
      animations: true,
      compactView: false,
      timeFormat: '12h'
    }
  });

  // Toggle handler for switches
  const handleToggle = (category: keyof typeof settings, setting: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting]
      }
    });

    toast({
      title: "Setting updated",
      description: `Your preference has been saved.`,
      duration: 2000,
    });
  };

  // Handle slider changes
  const handleSliderChange = (value: number[]) => {
    setSettings({
      ...settings,
      notification: {
        ...settings.notification,
        volume: value[0]
      }
    });
  };

  // Handle select changes
  const handleSelectChange = (category: keyof typeof settings, setting: string, value: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });

    toast({
      title: "Setting updated",
      description: `Your preference has been saved.`,
      duration: 2000,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Manage your account preferences and application settings
          </p>
        </motion.div>

        <Tabs defaultValue="account" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 sm:grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notification">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={activeTab === "account" ? "visible" : "hidden"}
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      View and manage your personal account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={user?.username} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={user?.email || "user@example.com"} disabled />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" defaultValue={user?.displayName || user?.username} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportId">Passport ID</Label>
                        <Input id="passportId" defaultValue={user?.passportId || "PKL-12345"} disabled />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button variant="outline" onClick={() => navigate("/profile/edit")}>
                      Edit Profile
                    </Button>
                    <Button onClick={() => {
                      toast({
                        title: "Changes saved",
                        description: "Your account information has been updated.",
                        duration: 3000,
                      });
                    }}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-primary" />
                      Communication Preferences
                    </CardTitle>
                    <CardDescription>
                      Control how you receive notifications and communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive important updates via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.account.emailNotifications}
                        onCheckedChange={() => handleToggle('account', 'emailNotifications')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts on your device
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={settings.account.pushNotifications}
                        onCheckedChange={() => handleToggle('account', 'pushNotifications')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive promotional content and offers
                        </p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={settings.account.marketingEmails}
                        onCheckedChange={() => handleToggle('account', 'marketingEmails')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="matchAlerts">Match Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified about match invitations and results
                        </p>
                      </div>
                      <Switch
                        id="matchAlerts"
                        checked={settings.account.matchAlerts}
                        onCheckedChange={() => handleToggle('account', 'matchAlerts')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={activeTab === "privacy" ? "visible" : "hidden"}
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Privacy Controls
                    </CardTitle>
                    <CardDescription>
                      Manage what information is visible to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="publicProfile">Public Profile</Label>
                        <p className="text-xs text-muted-foreground">
                          Make your profile discoverable by other players
                        </p>
                      </div>
                      <Switch
                        id="publicProfile"
                        checked={settings.account.publicProfile}
                        onCheckedChange={() => handleToggle('account', 'publicProfile')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showRank">Show Rank</Label>
                        <p className="text-xs text-muted-foreground">
                          Display your ranking on leaderboards and profile
                        </p>
                      </div>
                      <Switch
                        id="showRank"
                        checked={settings.privacy.showRank}
                        onCheckedChange={() => handleToggle('privacy', 'showRank')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showActivity">Activity Visibility</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow others to see your recent matches and activity
                        </p>
                      </div>
                      <Switch
                        id="showActivity"
                        checked={settings.privacy.showActivity}
                        onCheckedChange={() => handleToggle('privacy', 'showActivity')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowFriendRequests">Friend Requests</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow other players to send you friend requests
                        </p>
                      </div>
                      <Switch
                        id="allowFriendRequests"
                        checked={settings.privacy.allowFriendRequests}
                        onCheckedChange={() => handleToggle('privacy', 'allowFriendRequests')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showRealName">Show Real Name</Label>
                        <p className="text-xs text-muted-foreground">
                          Display your real name instead of username
                        </p>
                      </div>
                      <Switch
                        id="showRealName"
                        checked={settings.privacy.showRealName}
                        onCheckedChange={() => handleToggle('privacy', 'showRealName')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataSharing">Data Sharing</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Control how your playing statistics are shared
                      </p>
                      <Select 
                        value={settings.privacy.dataSharing}
                        onValueChange={(value) => handleSelectChange('privacy', 'dataSharing', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select data sharing level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None - Don't share my data</SelectItem>
                          <SelectItem value="minimal">Minimal - Basic stats only</SelectItem>
                          <SelectItem value="standard">Standard - Most playing stats</SelectItem>
                          <SelectItem value="complete">Complete - All playing data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notification">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={activeTab === "notification" ? "visible" : "hidden"}
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-primary" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Control when and how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="volume">Notification Volume</Label>
                        <span className="text-sm">{settings.notification.volume}%</span>
                      </div>
                      <Slider
                        id="volume"
                        max={100}
                        step={1}
                        value={[settings.notification.volume]}
                        onValueChange={handleSliderChange}
                        className="py-2"
                      />
                      <div className="flex justify-between">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Volume2 className="h-6 w-6 text-primary" />
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="newMatchNotification">New Match Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts for new match invitations
                          </p>
                        </div>
                        <Switch
                          id="newMatchNotification"
                          checked={settings.notification.newMatchNotification}
                          onCheckedChange={() => handleToggle('notification', 'newMatchNotification')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="tournamentReminders">Tournament Reminders</Label>
                          <p className="text-xs text-muted-foreground">
                            Get notified about upcoming tournaments
                          </p>
                        </div>
                        <Switch
                          id="tournamentReminders"
                          checked={settings.notification.tournamentReminders}
                          onCheckedChange={() => handleToggle('notification', 'tournamentReminders')}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="achievementAlerts">Achievement Alerts</Label>
                          <p className="text-xs text-muted-foreground">
                            Notifications when you earn achievements or level up
                          </p>
                        </div>
                        <Switch
                          id="achievementAlerts"
                          checked={settings.notification.achievementAlerts}
                          onCheckedChange={() => handleToggle('notification', 'achievementAlerts')}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="matchResultAlerts">Match Result Alerts</Label>
                          <p className="text-xs text-muted-foreground">
                            Notifications for match results and statistics
                          </p>
                        </div>
                        <Switch
                          id="matchResultAlerts"
                          checked={settings.notification.matchResultAlerts}
                          onCheckedChange={() => handleToggle('notification', 'matchResultAlerts')}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="systemUpdates">System Updates</Label>
                          <p className="text-xs text-muted-foreground">
                            Important announcements about Pickle+ features
                          </p>
                        </div>
                        <Switch
                          id="systemUpdates"
                          checked={settings.notification.systemUpdates}
                          onCheckedChange={() => handleToggle('notification', 'systemUpdates')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Display Settings Tab */}
          <TabsContent value="display">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={activeTab === "display" ? "visible" : "hidden"}
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-primary" />
                      Display Settings
                    </CardTitle>
                    <CardDescription>
                      Customize how the application looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-xs text-muted-foreground">
                          Toggle between light and dark theme
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <Switch
                          id="darkMode"
                          checked={settings.account.darkMode}
                          onCheckedChange={() => handleToggle('account', 'darkMode')}
                        />
                        <Moon className="h-4 w-4 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Adjust the size of text throughout the app
                      </p>
                      <Select 
                        value={settings.display.fontSize}
                        onValueChange={(value) => handleSelectChange('display', 'fontSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="highContrast">High Contrast</Label>
                        <p className="text-xs text-muted-foreground">
                          Enhance text and color contrast for better visibility
                        </p>
                      </div>
                      <Switch
                        id="highContrast"
                        checked={settings.display.highContrast}
                        onCheckedChange={() => handleToggle('display', 'highContrast')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Animations</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable or disable motion animations
                        </p>
                      </div>
                      <Switch
                        id="animations"
                        checked={settings.display.animations}
                        onCheckedChange={() => handleToggle('display', 'animations')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compactView">Compact View</Label>
                        <p className="text-xs text-muted-foreground">
                          Use a more condensed layout to show more content
                        </p>
                      </div>
                      <Switch
                        id="compactView"
                        checked={settings.display.compactView}
                        onCheckedChange={() => handleToggle('display', 'compactView')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Change how time is displayed throughout the app
                      </p>
                      <Select 
                        value={settings.display.timeFormat}
                        onValueChange={(value) => handleSelectChange('display', 'timeFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}