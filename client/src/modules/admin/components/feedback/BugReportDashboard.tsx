/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Dashboard Component
 * 
 * This component serves as the main admin dashboard for managing bug reports.
 */

import { BugReportList } from './BugReportList';

/**
 * Bug Report Dashboard component
 */
export function BugReportDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bug Report Management</h1>
        <p className="text-muted-foreground">
          View and manage bug reports submitted by users through the in-app bug reporting system.
        </p>
      </div>
      
      <BugReportList />
    </div>
  );
}

export default BugReportDashboard;