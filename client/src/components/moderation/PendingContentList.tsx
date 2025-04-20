/**
 * PKL-278651-COMM-0029-MOD - Pending Content List Component
 * Implementation timestamp: 2025-04-20 23:25 ET
 * 
 * List component for displaying and approving pending content items
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { moderationService } from "@/lib/api/community/moderation-service";
import { formatDistanceToNow } from "date-fns";

interface PendingContentItem {
  id: number;
  communityId: number;
  userId: number;
  contentType: string;
  content: string;
  metadata?: any;
  status: string;
  moderatorId?: number;
  moderationNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PendingContentListProps {
  pendingItems: PendingContentItem[];
  communityId: number;
  onItemReviewed: () => void;
}

export function PendingContentList({ pendingItems, communityId, onItemReviewed }: PendingContentListProps) {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<PendingContentItem | null>(null);
  const [moderationNotes, setModerationNotes] = useState<string>('');

  // Mutation for reviewing content
  const reviewMutation = useMutation({
    mutationFn: async ({ approved }: { approved: boolean }) => {
      if (!selectedItem) return;
      
      return await moderationService.reviewContentItem(
        communityId,
        selectedItem.id,
        {
          approved,
          moderationNotes
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Content reviewed",
        description: "The content has been reviewed successfully.",
      });
      setSelectedItem(null);
      setModerationNotes('');
      if (onItemReviewed) {
        onItemReviewed();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to review content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Format relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get a preview of content
  const getContentPreview = (content: string) => {
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Pending Content</h3>
      
      {pendingItems.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No pending content items to review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="capitalize">
                    {item.contentType}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={item.content}>
                    {getContentPreview(item.content)}
                  </TableCell>
                  <TableCell>
                    {formatTime(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setModerationNotes('');
                      }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Content Review Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Review Content</DialogTitle>
              <DialogDescription>
                Review this {selectedItem.contentType} and decide whether to approve or reject it.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Type:</span>
                <span className="col-span-3 capitalize">{selectedItem.contentType}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Submitted:</span>
                <span className="col-span-3">{formatTime(selectedItem.createdAt)}</span>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium">Content:</span>
                <Card className="col-span-3">
                  <CardContent className="p-4 whitespace-pre-wrap">
                    {selectedItem.content}
                  </CardContent>
                </Card>
              </div>
              
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Metadata:</span>
                  <Card className="col-span-3">
                    <CardContent className="p-4">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(selectedItem.metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium">Notes:</span>
                <div className="col-span-3">
                  <Textarea
                    placeholder="Add notes about your decision (optional)"
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedItem(null)}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => reviewMutation.mutate({ approved: false })}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Reject'}
              </Button>
              <Button 
                variant="default"
                onClick={() => reviewMutation.mutate({ approved: true })}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PendingContentList;