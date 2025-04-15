/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report List Component
 * 
 * This component displays a list of bug reports in the admin dashboard.
 */

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BugReport, BugReportStatus, BugReportSeverity } from '@/shared/bug-report-schema';
import { 
  AlertTriangle, 
  Bug, 
  CheckCircle, 
  Clock, 
  Copy, 
  MoreHorizontal, 
  XCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface BugReportListProps {
  reports: BugReport[];
  onSelectReport?: (report: BugReport) => void;
}

/**
 * Returns the appropriate icon based on bug report severity
 */
const getSeverityIcon = (severity: BugReportSeverity) => {
  switch (severity) {
    case BugReportSeverity.CRITICAL:
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case BugReportSeverity.HIGH:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case BugReportSeverity.MEDIUM:
      return <Bug className="h-4 w-4 text-yellow-500" />;
    case BugReportSeverity.LOW:
    default:
      return <Bug className="h-4 w-4 text-blue-500" />;
  }
};

/**
 * Returns the appropriate status badge based on bug report status
 */
const getStatusBadge = (status: BugReportStatus) => {
  switch (status) {
    case BugReportStatus.NEW:
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">New</Badge>;
    case BugReportStatus.IN_PROGRESS:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case BugReportStatus.RESOLVED:
      return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
    case BugReportStatus.WONT_FIX:
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Won't Fix</Badge>;
    case BugReportStatus.DUPLICATE:
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Duplicate</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

/**
 * Format relative time for display
 */
const formatTime = (timestamp: string) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    return 'Unknown time';
  }
};

/**
 * Bug Report List component
 */
const BugReportList: React.FC<BugReportListProps> = ({ reports, onSelectReport }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Severity</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow 
              key={report.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectReport && onSelectReport(report)}
            >
              <TableCell>
                {getSeverityIcon(report.severity)}
              </TableCell>
              <TableCell className="font-medium">
                {report.title}
              </TableCell>
              <TableCell>
                {report.userName || `User #${report.userId}`}
              </TableCell>
              <TableCell>
                {getStatusBadge(report.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatTime(report.createdAt)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport && onSelectReport(report);
                    }}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Copy ID to clipboard
                      navigator.clipboard.writeText(report.id.toString());
                    }}>
                      Copy ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BugReportList;