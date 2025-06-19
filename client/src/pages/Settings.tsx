/**
 * Settings Page - User Preferences and Configuration
 * Page with full translation support for settings management
 */

import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LanguageToggle } from '@/components/LanguageToggle';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  User, 
  Palette,
  Lock
} from 'lucide-react';

export default function Settings() {
  const { t } = useLanguage();

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('settings.general')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {t('settings.account')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Switch id="profile-visibility" checked={true} onCheckedChange={() => {}} />
              </div>
              <Button variant="outline" className="w-full">
                {t('action.edit')} {t('profile.personalInfo')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {t('settings.notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" checked={true} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="match-reminders">Match Reminders</Label>
                <Switch id="match-reminders" checked={false} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tournament-updates">Tournament Updates</Label>
                <Switch id="tournament-updates" checked={true} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Language Selection</Label>
                <LanguageToggle />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t('settings.privacy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing">Data Sharing</Label>
                <Switch id="data-sharing" checked={false} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Analytics Tracking</Label>
                <Switch id="analytics" checked={true} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                {t('settings.security')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                {t('settings.theme')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch id="dark-mode" checked={false} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch id="animations" checked={true} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
}