/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report List Component
 * 
 * This component displays a list of bug reports for the admin dashboard.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBugReports } from '@/modules/feedback/api/feedbackAdminApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { BugReportDetail } from './BugReportDetail';

/**
 * Helper function to get severity badge color
 */
function getSeverityBadgeColor(severity: string) {
  switch (severity) {
    case 'low':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'high':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    case 'critical':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

/**
 * Helper function to get status badge color
 */
function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'resolved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'wont_fix':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'duplicate':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

/**
 * Helper function to format status text
 */
function formatStatus(status: string) {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'wont_fix':
      return 'Won\'t Fix';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Bug Report List component
 */
export function BugReportList() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  
  // Fetch bug reports with filtering
  const { data: reports, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/feedback/bug-reports', statusFilter, severityFilter],
    queryFn: () => getAllBugReports({ 
      status: statusFilter, 
      severity: severityFilter 
    })
  });
  
  // View a bug report
  const handleViewReport = (id: number) => {
    setSelectedReportId(id);
  };
  
  // Close the detail view
  const handleCloseDetail = () => {
    setSelectedReportId(null);
    refetch();
  };
  
  return (
    <div className="space-y-6">
      {selectedReportId ? (
        <BugReportDetail id={selectedReportId} onClose={handleCloseDetail} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>
                View and manage bug reports submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="w-full sm:w-auto">
                  <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || undefined)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="wont_fix">Won't Fix</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto">
                  <Select value={severityFilter || ''} onValueChange={(value) => setSeverityFilter(value || undefined)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-muted-foreground">
                  Error loading bug reports. Please try again.
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bug reports found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium truncate max-w-[240px]">
                            {report.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(report.status)}>
                              {formatStatus(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityBadgeColor(report.severity)}>
                              {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReport(report.id)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {!isLoading && !isError && reports && `Showing ${reports.length} results`}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}

export default BugReportList;