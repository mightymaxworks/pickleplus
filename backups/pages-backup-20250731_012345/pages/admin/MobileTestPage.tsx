/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * Mobile Test Execution Standalone Page
 * 
 * This page provides a standalone interface for executing Bounce tests on mobile devices,
 * with a simplified mobile-first layout and touch-friendly controls.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MobileTestExecution from '@/components/admin/bounce/MobileTestExecution';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { Smartphone } from 'lucide-react';

const MobileTestPage: React.FC = () => {
  return (
    <AdminLayout title="Mobile Test Execution" breadcrumbs={[
      { label: 'Admin', href: '/admin' },
      { label: 'Bounce', href: '/admin/bounce' },
      { label: 'Mobile Test', href: '/admin/mobile-test' }
    ]}>
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle>Mobile Test Execution</CardTitle>
          </div>
          <CardDescription>
            Run automated tests directly from your mobile device with simplified touch controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <MobileTestExecution />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default MobileTestPage;