/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Nav Item Component
 * 
 * This component renders a navigation item for the bug report management section
 * in the admin dashboard.
 */

import React from 'react';
import { Bug } from 'lucide-react';

/**
 * Props for the navigation item component
 */
interface NavItemProps {
  isActive: boolean;
  onClick: () => void;
}

/**
 * Bug Report Nav Item component for the admin sidebar
 */
function BugReportNavItem({ isActive, onClick }: NavItemProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted'
      }`}
      onClick={onClick}
    >
      <Bug className="h-4 w-4" />
      <div className="font-medium">Bug Reports</div>
    </div>
  );
}

export default BugReportNavItem;