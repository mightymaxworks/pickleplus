/**
 * PKL-278651-ADMIN-0010-REPORT
 * Reports Dashboard Card
 * 
 * Dashboard card for the admin reporting system
 */

import React from 'react';
import { Link } from 'wouter';
import { LineChart, BarChart, PieChart, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminComponentRegistry } from '../../services/adminComponentRegistry';
import { AdminDashboardCard } from '../../types';

/**
 * Reports Dashboard Card Component 
 */
const ReportsDashboardCardComponent = () => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center">
            <LineChart className="mr-2 text-primary" />
            Reports & Analytics
          </div>
        </CardTitle>
        <CardDescription>
          View and analyze platform metrics and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            <span>User growth and engagement metrics</span>
          </div>
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            <span>Match activity and performance stats</span>
          </div>
          <div className="flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-orange-500" />
            <span>Comparative analysis across time periods</span>
          </div>
          <div className="flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            <span>Distribution and category breakdowns</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/admin/reports">
            View Reports
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Reports Dashboard Card configuration
 */
export const reportsDashboardCard: AdminDashboardCard = {
  id: 'reports-dashboard',
  component: ReportsDashboardCardComponent,
  width: 'third',
  height: 'medium',
  order: 20,
};