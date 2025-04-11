/**
 * PKL-278651-ADMIN-0014-UX
 * Admin Settings Page
 * 
 * This page demonstrates the enhanced UX components and improved user experience
 * for the admin interface.
 */

import React from 'react';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { AdminSettingsForm } from '@/modules/admin/components/settings/AdminSettingsForm';
import { AccessibilityControls, HelpButton } from '@/modules/admin/components/ui';

export default function SettingsPage() {
  return (
    <AdminLayout title="Admin Settings">
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
    </AdminLayout>
  );
}