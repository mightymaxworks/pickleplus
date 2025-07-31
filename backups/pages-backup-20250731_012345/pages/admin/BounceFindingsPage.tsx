/**
 * PKL-278651-BOUNCE-0006-ADMIN - Bounce Findings Admin Page
 * 
 * This page displays the findings from Bounce automated tests,
 * allowing administrators to view, filter, and manage issues.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React from 'react';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BounceFindings from '@/components/admin/bounce/BounceFindings';
import { Bug, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const BounceFindingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bounce Findings</h1>
            <p className="text-muted-foreground mt-1">
              View and manage issues discovered by Bounce automated testing
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1.5 bg-red-50 text-red-600 border-red-200">
              <AlertCircle className="mr-1 h-4 w-4" />
              <span className="font-semibold">Critical: 2</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 bg-amber-50 text-amber-600 border-amber-200">
              <AlertTriangle className="mr-1 h-4 w-4" />
              <span className="font-semibold">High: 5</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 bg-blue-50 text-blue-600 border-blue-200">
              <Info className="mr-1 h-4 w-4" />
              <span className="font-semibold">Medium: 8</span>
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Bug className="mr-2 h-5 w-5" />
              Bounce Test Findings
            </CardTitle>
            <CardDescription>
              Issues identified through automated testing across different areas of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                <TabsTrigger value="all">All Findings</TabsTrigger>
                <TabsTrigger value="critical">Critical Issues</TabsTrigger>
                <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                <TabsTrigger value="fixed">Fixed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <BounceFindings viewTab="all" />
              </TabsContent>
              
              <TabsContent value="critical" className="mt-6">
                <BounceFindings viewTab="critical" />
              </TabsContent>
              
              <TabsContent value="assigned" className="mt-6">
                <BounceFindings viewTab="assigned" />
              </TabsContent>
              
              <TabsContent value="fixed" className="mt-6">
                <BounceFindings viewTab="fixed" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BounceFindingsPage;