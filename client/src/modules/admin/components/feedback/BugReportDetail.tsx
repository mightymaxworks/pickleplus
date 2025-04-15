/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Detail Component
 * 
 * This component displays details for a single bug report and provides
 * controls for administrators to manage it.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ExternalLink, 
  User, 
  Calendar, 
  Monitor, 
  Info, 
  Bug 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  getBugReportById, 
  updateBugReportStatus 
} from '@/modules/feedback/api/feedbackAdminApi';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BugReportDetailProps {
  id: number;
  onClose: () => void;
}

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
 * Bug Report Detail component
 */
export function BugReportDetail({ id, onClose }: BugReportDetailProps) {
  const [status, setStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch bug report details
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/feedback/bug-reports', id],
    queryFn: () => getBugReportById(id),
    onSuccess: (data) => {
      setStatus(data.status || '');
      setAdminNotes(data.adminNotes || '');
    }
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: () => updateBugReportStatus(id, status, adminNotes),
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Bug report status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback/bug-reports', id] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update bug report status",
        variant: "destructive",
      });
    }
  });
  
  // Handle saving changes
  const handleSaveChanges = () => {
    updateStatusMutation.mutate();
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'wont_fix':
        return 'Won\'t Fix';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP p');
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <CardTitle>Bug Report Details</CardTitle>
          <CardDescription>
            View and manage bug report #{id}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-muted-foreground">
            Error loading bug report details. Please try again.
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">{report.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getSeverityBadgeColor(report.severity)}>
                  {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} Severity
                </Badge>
                <Badge variant="outline">
                  Status: {formatStatus(report.status)}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                    {report.description}
                  </div>
                </div>
                
                {report.stepsToReproduce && (
                  <div>
                    <h4 className="font-medium mb-2">Steps to Reproduce</h4>
                    <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                      {report.stepsToReproduce}
                    </div>
                  </div>
                )}
                
                {report.screenshotPath && (
                  <div>
                    <h4 className="font-medium mb-2">Screenshot</h4>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img 
                        src={`/${report.screenshotPath}`} 
                        alt="Bug screenshot" 
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Report Metadata</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Created:</span> 
                      {formatDate(report.createdAt)}
                    </div>
                    
                    {report.updatedAt && report.updatedAt !== report.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Updated:</span> 
                        {formatDate(report.updatedAt)}
                      </div>
                    )}
                    
                    {report.resolvedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Resolved:</span> 
                        {formatDate(report.resolvedAt)}
                      </div>
                    )}
                    
                    {report.userId && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">User ID:</span> {report.userId}
                      </div>
                    )}
                    
                    {report.currentPage && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Page:</span> {report.currentPage}
                      </div>
                    )}
                    
                    {report.browserInfo && (
                      <div className="flex items-start gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Browser:</span> 
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {report.browserInfo}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {report.screenSize && (
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Screen Size:</span> {report.screenSize}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Reproducible:</span> 
                      {report.isReproducible ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                
                {report.userInfo && (
                  <div>
                    <h4 className="font-medium mb-2">User Information</h4>
                    <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                      {report.userInfo}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Update Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="wont_fix">Won't Fix</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this issue (internal only)"
                  className="resize-none h-32"
                  value={adminNotes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Back to List
        </Button>
        
        <Button 
          onClick={handleSaveChanges} 
          disabled={isLoading || isError || updateStatusMutation.isPending || !report}
        >
          {updateStatusMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BugReportDetail;