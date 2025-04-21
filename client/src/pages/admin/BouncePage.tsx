/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Admin Page
 * 
 * This page hosts the Bounce automated testing system interface for administrators.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import BounceDashboard from '@/components/admin/bounce/BounceDashboard';
import BounceFindings from '@/components/admin/bounce/BounceFindings';
import AdminLayout from '@/layouts/AdminLayout';

export default function BouncePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bounce Testing System</h1>
          <p className="text-muted-foreground">
            Automated non-destructive testing system for application quality assurance
          </p>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Implementation Progress</AlertTitle>
          <AlertDescription>
            Bounce system is currently in Sprint 1 (Core Infrastructure). The dashboard displays real-time data from the backend API.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="test-config">Test Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <BounceDashboard />
          </TabsContent>
          
          <TabsContent value="findings" className="space-y-4">
            <BounceFindings />
          </TabsContent>
          
          <TabsContent value="test-config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Configure and schedule automated testing runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Coming Soon</AlertTitle>
                  <AlertDescription>
                    Test configuration will be available in Sprint 2 (Test Runner).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}