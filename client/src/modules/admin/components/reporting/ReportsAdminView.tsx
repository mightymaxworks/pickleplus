/**
 * PKL-278651-ADMIN-0010-REPORT
 * Reports Admin View
 * 
 * Main view component for the admin reporting system
 */

import React from 'react';
import { LineChart } from 'lucide-react';
import { useLocation } from 'wouter';
import { ResponsiveReportsDashboard } from '../responsive/ResponsiveReportsDashboard';
import { AdminViewComponent } from '../../types';

/**
 * Reports Admin View Component
 */
const ReportsAdminViewComponent = () => {
  const [location] = useLocation();
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold flex items-center mb-6">
        <LineChart className="mr-2 h-8 w-8 text-primary" />
        Reports & Analytics
      </h1>
      
      <ResponsiveReportsDashboard />
    </div>
  );
};

/**
 * Reports Admin View configuration
 */
export const reportsAdminView: AdminViewComponent = {
  id: 'reports-view',
  path: '/admin/reports',
  component: ReportsAdminViewComponent,
};