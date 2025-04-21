/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Findings Component
 * 
 * This component displays and manages the findings discovered by the Bounce testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  AlertCircle, 
  Filter, 
  Search, 
  ExternalLink,
  AlertTriangle,
  Info,
  Eye
} from 'lucide-react';
import { 
  BounceFindingSeverity, 
  BounceFindingStatus
} from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import BounceFindingDetail from './BounceFindingDetail';
import { useToast } from '@/hooks/use-toast';

const BounceFindings: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(null);

  // Build query key dynamically based on filters
  const queryKey = ['/api/admin/bounce/findings', { page, severity, status, searchQuery }];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let url = `/api/admin/bounce/findings?page=${page}`;
      if (severity) url += `&severity=${severity}`;
      if (status) url += `&status=${status}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      return apiRequest<any>(url);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest<any>(`/api/admin/bounce/findings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      // Invalidate the findings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: "Status updated",
        description: "The finding status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the finding status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleViewFinding = (id: number) => {
    setSelectedFindingId(id);
  };

  const handleBackToList = () => {
    setSelectedFindingId(null);
    // Refresh the findings list
    queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case BounceFindingSeverity.CRITICAL:
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case BounceFindingSeverity.HIGH:
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case BounceFindingSeverity.MEDIUM:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case BounceFindingSeverity.LOW:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Info className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case BounceFindingStatus.NEW:
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case BounceFindingStatus.TRIAGE:
        return <Badge className="bg-purple-500 hover:bg-purple-600">Triage</Badge>;
      case BounceFindingStatus.CONFIRMED:
        return <Badge className="bg-orange-500 hover:bg-orange-600">Confirmed</Badge>;
      case BounceFindingStatus.IN_PROGRESS:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case BounceFindingStatus.FIXED:
        return <Badge className="bg-green-500 hover:bg-green-600">Fixed</Badge>;
      case BounceFindingStatus.WONT_FIX:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Won't Fix</Badge>;
      case BounceFindingStatus.DUPLICATE:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Duplicate</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // If a finding is selected, show the detail view
  if (selectedFindingId) {
    return (
      <BounceFindingDetail 
        findingId={selectedFindingId} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bounce Test Findings</CardTitle>
          <CardDescription>
            Review and manage issues discovered by automated testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severities</SelectItem>
                  <SelectItem value={BounceFindingSeverity.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={BounceFindingSeverity.HIGH}>High</SelectItem>
                  <SelectItem value={BounceFindingSeverity.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={BounceFindingSeverity.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value={BounceFindingStatus.NEW}>New</SelectItem>
                  <SelectItem value={BounceFindingStatus.TRIAGE}>Triage</SelectItem>
                  <SelectItem value={BounceFindingStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={BounceFindingStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={BounceFindingStatus.FIXED}>Fixed</SelectItem>
                  <SelectItem value={BounceFindingStatus.WONT_FIX}>Won't Fix</SelectItem>
                  <SelectItem value={BounceFindingStatus.DUPLICATE}>Duplicate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                        Loading findings...
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.findings?.length ? (
                  data.findings.map((finding: any) => (
                    <TableRow key={finding.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleViewFinding(finding.id)}>
                      <TableCell className="font-medium">{finding.id}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {finding.title}
                      </TableCell>
                      <TableCell>{renderSeverityBadge(finding.severity)}</TableCell>
                      <TableCell>{renderStatusBadge(finding.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{finding.browserInfo?.name || "Unknown"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFinding(finding.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Select 
                            defaultValue={finding.status} 
                            onValueChange={(value) => {
                              handleUpdateStatus(finding.id, value);
                            }}
                            onOpenChange={(open) => {
                              if (open) {
                                // Prevent row click when opening the select
                                document.addEventListener('click', (e) => {
                                  e.stopPropagation();
                                }, { once: true });
                              }
                            }}
                          >
                            <SelectTrigger 
                              className="w-[130px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={BounceFindingStatus.NEW}>New</SelectItem>
                              <SelectItem value={BounceFindingStatus.TRIAGE}>Triage</SelectItem>
                              <SelectItem value={BounceFindingStatus.CONFIRMED}>Confirmed</SelectItem>
                              <SelectItem value={BounceFindingStatus.IN_PROGRESS}>In Progress</SelectItem>
                              <SelectItem value={BounceFindingStatus.FIXED}>Fixed</SelectItem>
                              <SelectItem value={BounceFindingStatus.WONT_FIX}>Won't Fix</SelectItem>
                              <SelectItem value={BounceFindingStatus.DUPLICATE}>Duplicate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                      No findings match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data?.pagination && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={handlePrevPage} 
                      disabled={page <= 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={handleNextPage} 
                      disabled={page >= data.pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BounceFindings;