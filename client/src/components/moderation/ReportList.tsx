/**
 * PKL-278651-COMM-0029-MOD - Report List Component
 * Implementation timestamp: 2025-04-20 23:15 ET
 * 
 * List component for displaying and handling content reports
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { moderationService } from "@/lib/api/community/moderation-service";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: number;
  reporterId: number;
  communityId: number;
  contentType: string;
  contentId: number;
  reason: string;
  details?: string;
  status: string;
  reviewerId?: number;
  reviewNotes?: string;
  reviewedAt?: string;
  action?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportListProps {
  reports: Report[];
  communityId: number;
  onReportReviewed: () => void;
}

export function ReportList({ reports, communityId, onReportReviewed }: ReportListProps) {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('approved');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [action, setAction] = useState<string>('remove_content');

  // Mutation for reviewing reports
  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReport) return;
      
      return await moderationService.reviewReport(
        communityId,
        selectedReport.id,
        {
          status: reviewStatus,
          reviewNotes,
          action
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Report reviewed",
        description: `The report has been marked as ${reviewStatus}.`,
      });
      setSelectedReport(null);
      setReviewNotes('');
      if (onReportReviewed) {
        onReportReviewed();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to review report",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Filter reports - show pending first, then most recent
  const sortedReports = [...reports].sort((a, b) => {
    // Pending reports first
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Then sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle opening the review dialog
  const handleReviewClick = (report: Report) => {
    setSelectedReport(report);
    setReviewStatus('approved');
    setReviewNotes('');
    setAction('remove_content');
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="destructive">Action Taken</Badge>;
      case 'rejected':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Content Reports</h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No content reports found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="capitalize">
                    {report.contentType}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={report.reason}>
                    {report.reason}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell>
                    {formatTime(report.createdAt)}
                  </TableCell>
                  <TableCell>
                    {report.status === 'pending' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewClick(report)}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReviewClick(report)}
                      >
                        Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Report Review Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedReport.status === 'pending' ? 'Review Report' : 'Report Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedReport.status === 'pending' 
                  ? 'Review this content report and decide on an action.' 
                  : 'View details of this report and its resolution.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Type:</span>
                <span className="col-span-3 capitalize">{selectedReport.contentType}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Reason:</span>
                <span className="col-span-3">{selectedReport.reason}</span>
              </div>
              
              {selectedReport.details && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Details:</span>
                  <span className="col-span-3 whitespace-pre-wrap">{selectedReport.details}</span>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Reported:</span>
                <span className="col-span-3">{formatTime(selectedReport.createdAt)}</span>
              </div>
              
              {selectedReport.status !== 'pending' && selectedReport.reviewedAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Reviewed:</span>
                  <span className="col-span-3">{formatTime(selectedReport.reviewedAt)}</span>
                </div>
              )}
              
              {selectedReport.status !== 'pending' && selectedReport.reviewNotes && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Notes:</span>
                  <span className="col-span-3 whitespace-pre-wrap">{selectedReport.reviewNotes}</span>
                </div>
              )}
              
              {selectedReport.status === 'pending' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <div className="col-span-3">
                      <Select value={reviewStatus} onValueChange={setReviewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved (Take Action)</SelectItem>
                          <SelectItem value="rejected">Rejected (Dismiss)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {reviewStatus === 'approved' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm font-medium">Action:</span>
                      <div className="col-span-3">
                        <Select value={action} onValueChange={setAction}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remove_content">Remove Content</SelectItem>
                            <SelectItem value="warn_user">Warn User</SelectItem>
                            <SelectItem value="temp_ban">Temporary Ban</SelectItem>
                            <SelectItem value="perm_ban">Permanent Ban</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <span className="text-sm font-medium">Notes:</span>
                    <div className="col-span-3">
                      <Textarea
                        placeholder="Add notes about your decision (optional)"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
                disabled={reviewMutation.isPending}
              >
                {selectedReport.status === 'pending' ? 'Cancel' : 'Close'}
              </Button>
              
              {selectedReport.status === 'pending' && (
                <Button 
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ReportList;