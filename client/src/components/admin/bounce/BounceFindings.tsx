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
  Info
} from 'lucide-react';
import { 
  BounceFindingSeverity, 
  BounceFindingStatus
} from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const BounceFindings: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
      return apiRequest<any>(`/api/admin/bounce/findings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      // Invalidate the findings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
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

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case BounceFindingSeverity.CRITICAL:
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case BounceFindingSeverity.MODERATE:
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Moderate
          </Badge>
        );
      case BounceFindingSeverity.LOW:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
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
      case BounceFindingStatus.OPEN:
        return <Badge className="bg-red-500 hover:bg-red-600">Open</Badge>;
      case BounceFindingStatus.IN_PROGRESS:
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case BounceFindingStatus.FIXED:
        return <Badge className="bg-green-500 hover:bg-green-600">Fixed</Badge>;
      case BounceFindingStatus.VERIFIED:
        return <Badge className="bg-purple-500 hover:bg-purple-600">Verified</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
                  <SelectItem value={BounceFindingSeverity.MODERATE}>Moderate</SelectItem>
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
                  <SelectItem value={BounceFindingStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={BounceFindingStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={BounceFindingStatus.FIXED}>Fixed</SelectItem>
                  <SelectItem value={BounceFindingStatus.VERIFIED}>Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Area</TableHead>
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
                      <TableCell colSpan={7} className="h-16 text-center text-muted-foreground">
                        Loading findings...
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.findings?.length ? (
                  data.findings.map((finding: any) => (
                    <TableRow key={finding.id}>
                      <TableCell className="font-medium">{finding.findingId}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {finding.description}
                      </TableCell>
                      <TableCell>{finding.area}</TableCell>
                      <TableCell>{renderSeverityBadge(finding.severity)}</TableCell>
                      <TableCell>{renderStatusBadge(finding.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{finding.browser}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select 
                            defaultValue={finding.status} 
                            onValueChange={(value) => handleUpdateStatus(finding.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={BounceFindingStatus.OPEN}>Open</SelectItem>
                              <SelectItem value={BounceFindingStatus.IN_PROGRESS}>In Progress</SelectItem>
                              <SelectItem value={BounceFindingStatus.FIXED}>Fixed</SelectItem>
                              <SelectItem value={BounceFindingStatus.VERIFIED}>Verified</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-16 text-center text-muted-foreground">
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