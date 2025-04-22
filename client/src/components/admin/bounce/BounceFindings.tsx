/**
 * PKL-278651-BOUNCE-0003-ADMIN - Bounce Findings Management
 * 
 * This component provides the interface for triaging and managing test findings
 * discovered by the Bounce automated testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Search, 
  Filter, 
  Trash2, 
  X, 
  Flag, 
  ExternalLink, 
  FileText, 
  Check,
  Copy,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BounceFindingSeverity, BounceFindingStatus } from '@shared/schema/bounce';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import BounceFindingCard from './BounceFindingCard';
import { MobilePagination } from './enhanced-pagination';

// Types for findings data
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

// Type for filtering options
interface FindingFilters {
  severity: string[];
  status: string[];
  area?: string;
  component?: string;
  search?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

// BounceFindings Component
const BounceFindings: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // State for filtering, pagination, and detail view
  const [filters, setFilters] = useState<FindingFilters>({
    severity: [],
    status: [BounceFindingStatus.NEW, BounceFindingStatus.IN_PROGRESS]
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isMobile ? 5 : 10); // Fewer items per page on mobile
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [viewTab, setViewTab] = useState<'all' | 'critical' | 'assigned'>('all');
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<BounceFindingStatus | ''>('');
  
  // Reset pagination when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filters, searchQuery, viewTab]);

  // Adjust page size when mobile status changes
  React.useEffect(() => {
    setPageSize(isMobile ? 5 : 10);
  }, [isMobile]);
  
  // Update total pages when data changes
  React.useEffect(() => {
    if (data?.total) {
      setTotalFindings(data.total);
      setTotalPages(Math.ceil(data.total / pageSize));
    } else if (data?.findings) {
      // Default total calculation if API doesn't return a total
      setTotalFindings(data.findings.length);
      setTotalPages(Math.max(1, Math.ceil(data.findings.length / pageSize)));
    }
  }, [data, pageSize]);
  
  // Get total count for pagination
  const [totalFindings, setTotalFindings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Navigation functions for pagination
  const goToPage = (newPage: number) => {
    // Keep page within valid range
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  };
  
  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(page - 1);
  const goToNextPage = () => goToPage(page + 1);
  const goToLastPage = () => goToPage(totalPages);
  
  // Get findings data with filters and pagination applied
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['/api/admin/bounce/findings', filters, viewTab, page, pageSize],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', String(page));
      queryParams.append('pageSize', String(pageSize));
      
      if (filters.severity.length > 0) {
        queryParams.append('severity', filters.severity.join(','));
      }
      
      if (filters.status.length > 0) {
        queryParams.append('status', filters.status.join(','));
      }
      
      if (filters.area) {
        queryParams.append('area', filters.area);
      }
      
      if (filters.component) {
        queryParams.append('component', filters.component);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      if (viewTab === 'critical') {
        queryParams.append('severity', 'critical');
      } else if (viewTab === 'assigned') {
        queryParams.append('assigned', 'true');
      }
      
      return apiRequest<{ findings: Finding[] }>(`/api/admin/bounce/findings?${queryParams.toString()}`);
    }
  });
  
  // Get areas and components for filtering
  const { data: metaData } = useQuery({
    queryKey: ['/api/admin/bounce/findings/metadata'],
    queryFn: async () => {
      return apiRequest<{ areas: string[]; components: string[] }>('/api/admin/bounce/findings/metadata');
    }
  });
  
  // Update finding status mutation
  const updateFindingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest<Finding>(`/api/admin/bounce/findings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: 'Status updated',
        description: 'The finding status has been updated successfully.',
        variant: 'default'
      });
      setStatusUpdateDialogOpen(false);
    },
    onError: (error) => {
      console.error('Failed to update finding status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update the finding status. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Assign finding mutation
  const assignFindingMutation = useMutation({
    mutationFn: async ({ id, assignee }: { id: number; assignee: string }) => {
      return apiRequest<Finding>(`/api/admin/bounce/findings/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignee })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: 'Finding assigned',
        description: 'The finding has been assigned successfully.',
        variant: 'default'
      });
    },
    onError: (error) => {
      console.error('Failed to assign finding:', error);
      toast({
        title: 'Assignment failed',
        description: 'Failed to assign the finding. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Priority update mutation
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: number; priority: number }) => {
      return apiRequest<Finding>(`/api/admin/bounce/findings/${id}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: 'Priority updated',
        description: 'The finding priority has been updated successfully.',
        variant: 'default'
      });
    },
    onError: (error) => {
      console.error('Failed to update finding priority:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update the finding priority. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
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
  
  const handleStatusChange = (finding: Finding, status: BounceFindingStatus) => {
    setSelectedFinding(finding);
    setNewStatus(status);
    setStatusUpdateDialogOpen(true);
  };
  
  const confirmStatusChange = () => {
    if (selectedFinding && newStatus) {
      updateFindingMutation.mutate({
        id: selectedFinding.id,
        status: newStatus
      });
    }
  };
  
  const handleAssignToMe = (finding: Finding) => {
    // In a real implementation, this would use the current user's ID/name
    assignFindingMutation.mutate({
      id: finding.id,
      assignee: 'current-user' // Placeholder - would use actual user ID
    });
  };
  
  const handlePriorityChange = (finding: Finding, priority: number) => {
    updatePriorityMutation.mutate({
      id: finding.id,
      priority
    });
  };
  
  const toggleSeverityFilter = (severity: string) => {
    if (filters.severity.includes(severity)) {
      setFilters({
        ...filters,
        severity: filters.severity.filter(s => s !== severity)
      });
    } else {
      setFilters({
        ...filters,
        severity: [...filters.severity, severity]
      });
    }
  };
  
  const toggleStatusFilter = (status: string) => {
    if (filters.status.includes(status)) {
      setFilters({
        ...filters,
        status: filters.status.filter(s => s !== status)
      });
    } else {
      setFilters({
        ...filters,
        status: [...filters.status, status]
      });
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-lg font-medium mb-1">No findings match your filters</h3>
      <p className="text-muted-foreground">
        Try adjusting your filters or search query to see more results.
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => {
          setFilters({ severity: [], status: [BounceFindingStatus.NEW, BounceFindingStatus.IN_PROGRESS] });
          setSearchQuery('');
          setViewTab('all');
        }}
      >
        Reset filters
      </Button>
    </div>
  );
  
  // Render pagination control component
  const renderPagination = () => {
    return (
      <MobilePagination 
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalFindings}
        pageSize={pageSize}
        onPageChange={goToPage}
      />
    );
  };
  
  // Render findings table
  const renderFindingsTable = () => (
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
        {data?.findings && data.findings.length > 0 ? (
          data.findings.map((finding) => (
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
                    onClick={() => setSelectedFinding(finding)}
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
                    <DropdownMenuItem onClick={() => setSelectedFinding(finding)}>
                      <FileText className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(finding, BounceFindingStatus.NEW)}>
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> Mark New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(finding, BounceFindingStatus.IN_PROGRESS)}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" /> Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(finding, BounceFindingStatus.FIXED)}>
                      <Check className="h-4 w-4 mr-2 text-green-500" /> Mark Fixed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(finding, BounceFindingStatus.WONT_FIX)}>
                      <X className="h-4 w-4 mr-2 text-gray-500" /> Won't Fix
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(finding, BounceFindingStatus.DUPLICATE)}>
                      <Copy className="h-4 w-4 mr-2 text-purple-500" /> Mark Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAssignToMe(finding)}>
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
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.severity.includes('critical') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeverityFilter('critical')}
                className={filters.severity.includes('critical') ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Critical
              </Button>
              <Button
                variant={filters.severity.includes('high') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeverityFilter('high')}
                className={filters.severity.includes('high') ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                High
              </Button>
              <Button
                variant={filters.status.includes(BounceFindingStatus.NEW) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStatusFilter(BounceFindingStatus.NEW)}
              >
                New
              </Button>
              <Button
                variant={filters.status.includes(BounceFindingStatus.IN_PROGRESS) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStatusFilter(BounceFindingStatus.IN_PROGRESS)}
              >
                In Progress
              </Button>
            </div>
            
            <div className="flex-grow flex justify-end">
              <Select
                value={filters.area || "all_areas"}
                onValueChange={(value) => setFilters({ ...filters, area: value === "all_areas" ? undefined : value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_areas">All Areas</SelectItem>
                  {metaData?.areas?.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={viewTab} 
            onValueChange={(value) => setViewTab(value as 'all' | 'critical' | 'assigned')}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">All Findings</TabsTrigger>
              <TabsTrigger value="critical">
                Critical Issues
                <Badge variant="destructive" className="ml-2 bg-red-500">
                  {data?.findings?.filter(f => f.severity === 'critical').length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Error loading findings</h3>
                  <p className="text-muted-foreground">
                    There was a problem loading findings. Please try again.
                  </p>
                </div>
              ) : data?.findings?.length === 0 ? (
                renderEmptyState()
              ) : isMobile ? (
                <div className="pt-2 space-y-4">
                  {data?.findings?.map((finding) => (
                    <BounceFindingCard
                      key={finding.id}
                      finding={finding}
                      onViewDetails={() => setSelectedFinding(finding)}
                      onStatusChange={(status) => handleStatusChange(finding, status)}
                      onAssign={() => handleAssignToMe(finding)}
                    />
                  ))}
                  {/* Mobile pagination */}
                  {renderPagination()}
                </div>
              ) : (
                <div className="border rounded-md">
                  <ScrollArea className="h-[450px]">
                    {renderFindingsTable()}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            <TabsContent value="critical" className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.findings?.filter(f => f.severity === 'critical').length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No critical findings!</h3>
                  <p className="text-muted-foreground">
                    Great job! There are no critical issues to address.
                  </p>
                </div>
              ) : isMobile ? (
                <div className="pt-2 space-y-4">
                  {data?.findings
                    ?.filter(f => f.severity === 'critical')
                    ?.map((finding) => (
                      <BounceFindingCard
                        key={finding.id}
                        finding={finding}
                        onViewDetails={() => setSelectedFinding(finding)}
                        onStatusChange={(status) => handleStatusChange(finding, status)}
                        onAssign={() => handleAssignToMe(finding)}
                      />
                  ))}
                  {/* Critical issues mobile pagination */}
                  {renderPagination()}
                </div>
              ) : (
                <div className="border rounded-md">
                  <ScrollArea className="h-[450px]">
                    {renderFindingsTable()}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            <TabsContent value="assigned" className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isMobile ? (
                <div className="pt-2 space-y-4">
                  {data?.findings
                    ?.filter(f => f.assignedTo === 'current-user') // This would use the actual user ID in production
                    .map((finding) => (
                      <BounceFindingCard
                        key={finding.id}
                        finding={finding}
                        onViewDetails={() => setSelectedFinding(finding)}
                        onStatusChange={(status) => handleStatusChange(finding, status)}
                        onAssign={() => handleAssignToMe(finding)}
                      />
                  ))}
                  {/* Assigned issues mobile pagination */}
                  {renderPagination()}
                </div>
              ) : (
                <div className="border rounded-md">
                  <ScrollArea className="h-[450px]">
                    {renderFindingsTable()}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing {data?.findings?.length || 0} findings
          </div>
        </CardFooter>
      </Card>
      
      {/* Finding Detail Dialog */}
      {selectedFinding && (
        <Dialog open={!!selectedFinding} onOpenChange={(open) => !open && setSelectedFinding(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedFinding.severity)}
                <DialogTitle className="text-base sm:text-lg">{selectedFinding.title}</DialogTitle>
              </div>
              <DialogDescription className="text-xs sm:text-sm">
                Found during test run #{selectedFinding.testRunId} on {formatDate(selectedFinding.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow overflow-auto">
              {/* Mobile-friendly layout that stacks on small screens and uses grid on larger ones */}
              <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-6'} mb-4`}>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div>{getStatusBadge(selectedFinding.status)}</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Area</div>
                  <div className="text-sm">{selectedFinding.area || 'General'}</div>
                  {selectedFinding.component && (
                    <div className="text-xs text-muted-foreground mt-1">{selectedFinding.component}</div>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Assigned To</div>
                  <div className="text-sm">
                    {selectedFinding.assignedTo || 'Unassigned'}
                    {!selectedFinding.assignedTo && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={() => handleAssignToMe(selectedFinding)}
                      >
                        Assign to me
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md whitespace-pre-line">
                    {selectedFinding.description}
                  </div>
                </div>
                
                {selectedFinding.steps && selectedFinding.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Reproduction Steps</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <ol className="list-decimal list-inside space-y-1">
                        {selectedFinding.steps.map((step, index) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
                
                {selectedFinding.elementSelector && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Element Selector</h4>
                    <code className="block bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-xs overflow-x-auto">
                      {selectedFinding.elementSelector}
                    </code>
                  </div>
                )}
                
                {selectedFinding.screenshot && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Screenshot</h4>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={selectedFinding.screenshot} 
                        alt="Finding Screenshot" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile-optimized footer that stacks buttons on small screens */}
            <DialogFooter className={`${isMobile ? 'flex-col items-stretch space-y-2' : 'flex items-center justify-between'} mt-4`}>
              <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex gap-2'}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <span className="truncate">
                        {selectedFinding.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span> ▾
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedFinding, BounceFindingStatus.NEW)}>
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedFinding, BounceFindingStatus.IN_PROGRESS)}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" /> In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedFinding, BounceFindingStatus.FIXED)}>
                      <Check className="h-4 w-4 mr-2 text-green-500" /> Fixed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedFinding, BounceFindingStatus.WONT_FIX)}>
                      <X className="h-4 w-4 mr-2 text-gray-500" /> Won't Fix
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedFinding, BounceFindingStatus.DUPLICATE)}>
                      <Copy className="h-4 w-4 mr-2 text-purple-500" /> Duplicate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleAssignToMe(selectedFinding)}
                  className="w-full sm:w-auto"
                >
                  Assign to Me
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Priority {selectedFinding.priority || 0} ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[1, 2, 3, 4, 5].map((priority) => (
                      <DropdownMenuItem 
                        key={priority}
                        onClick={() => handlePriorityChange(selectedFinding, priority)}
                      >
                        {priority} - {
                          priority === 1 ? 'Highest' :
                          priority === 2 ? 'High' :
                          priority === 3 ? 'Medium' :
                          priority === 4 ? 'Low' :
                          'Lowest'
                        }
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                variant="default" 
                onClick={() => setSelectedFinding(null)}
                className={`${isMobile ? 'mt-2' : ''} w-full sm:w-auto`}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Finding Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of this finding to {newStatus.replace('_', ' ')}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">Finding:</p>
            <p className="text-sm">{selectedFinding?.title}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BounceFindings;