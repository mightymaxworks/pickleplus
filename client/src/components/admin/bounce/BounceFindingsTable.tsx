/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * 
 * Enhanced findings table component with integrated pagination
 * optimized for both desktop and mobile views.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Filter, 
  FileText, 
  Check, 
  X, 
  Copy, 
  Flag 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BounceFindingStatus, BounceFindingSeverity } from '@shared/schema/bounce';
import MobilePagination from './enhanced-pagination';

interface Finding {
  id: number;
  title: string;
  description: string;
  severity: BounceFindingSeverity;
  status: BounceFindingStatus;
  elementSelector?: string;
  screenshot?: string;
  testRunId: number;
  testId: string;
  createdAt: string;
  assignedTo?: string;
  priority?: number;
  steps?: string[];
  area?: string;
  component?: string;
}

interface BounceFindingsTableProps {
  findings: Finding[];
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (finding: Finding) => void;
  onStatusChange: (finding: Finding, status: BounceFindingStatus) => void;
  onAssign: (finding: Finding) => void;
}

const BounceFindingsTable: React.FC<BounceFindingsTableProps> = ({
  findings,
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onViewDetails,
  onStatusChange,
  onAssign
}) => {
  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case BounceFindingStatus.NEW:
        return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">New</Badge>;
      case BounceFindingStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      case BounceFindingStatus.FIXED:
        return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">Fixed</Badge>;
      case BounceFindingStatus.WONT_FIX:
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Won't Fix</Badge>;
      case BounceFindingStatus.DUPLICATE:
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Duplicate</Badge>;
      case BounceFindingStatus.TRIAGE:
        return <Badge variant="outline" className="bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Triage</Badge>;
      case BounceFindingStatus.CONFIRMED:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Confirmed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <ScrollArea className="h-[450px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead>Finding</TableHead>
                <TableHead>Area</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[150px]">Found</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings && findings.length > 0 ? (
                findings.map((finding) => (
                  <TableRow 
                    key={finding.id} 
                    className={cn(
                      finding.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : '',
                      finding.status === BounceFindingStatus.NEW ? 'border-l-2 border-l-red-500' : '',
                      finding.status === BounceFindingStatus.IN_PROGRESS ? 'border-l-2 border-l-blue-500' : ''
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        {getSeverityIcon(finding.severity)}
                        <span className="ml-2 text-xs capitalize">
                          {finding.severity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div 
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => onViewDetails(finding)}
                        >
                          {finding.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {finding.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{finding.area || 'General'}</div>
                      {finding.component && (
                        <div className="text-xs text-muted-foreground">{finding.component}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(finding.status)}
                      {finding.assignedTo && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Assigned: {finding.assignedTo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {formatDate(finding.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onViewDetails(finding)}>
                            <FileText className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onStatusChange(finding, BounceFindingStatus.NEW)}>
                            <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> Mark New
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(finding, BounceFindingStatus.IN_PROGRESS)}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" /> Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(finding, BounceFindingStatus.FIXED)}>
                            <Check className="h-4 w-4 mr-2 text-green-500" /> Mark Fixed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(finding, BounceFindingStatus.WONT_FIX)}>
                            <X className="h-4 w-4 mr-2 text-gray-500" /> Won't Fix
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(finding, BounceFindingStatus.DUPLICATE)}>
                            <Copy className="h-4 w-4 mr-2 text-purple-500" /> Mark Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAssign(finding)}>
                            <Flag className="h-4 w-4 mr-2" /> Assign to Me
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No findings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default BounceFindingsTable;