/**
 * PKL-278651-ADMIN-0014-UX
 * Admin Settings Page
 * 
 * This page demonstrates the enhanced UX components and improved user experience
 * for the admin interface.
 * Note: AdminLayout is provided by AdminProtectedRoute, so we don't need to wrap it here
 */

import React from 'react';
import { AdminSettingsForm } from '@/modules/admin/components/settings/AdminSettingsForm';
import { AccessibilityControls, HelpButton } from '@/modules/admin/components/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure global platform settings and preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <AccessibilityControls />
          <HelpButton />
        </div>
      </div>
      
      <AdminSettingsForm />
    </div>
  );
}