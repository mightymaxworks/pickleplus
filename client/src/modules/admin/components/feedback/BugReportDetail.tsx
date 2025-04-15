/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Detail Component
 * 
 * This component displays detailed information about a selected bug report.
 */

import React, { useState } from 'react';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BugReport, 
  BugReportStatus, 
  BugReportSeverity 
} from '@/shared/bug-report-schema';
import { 
  AlertTriangle,
  Bug, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Computer, 
  ExternalLink, 
  Monitor, 
  User, 
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  assignBugReport, 
  updateBugReportStatus 
} from '@/modules/feedback/api/feedbackAdminApi';
import { format } from 'date-fns';

interface BugReportDetailProps {
  report: BugReport;
  onStatusChange?: (updatedReport: BugReport) => void;
  onClose?: () => void;
}

/**
 * Format a date string to a human-readable format
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  } catch (e) {
    return 'Invalid date';
  }
};

/**
 * Get appropriate icon for severity level
 */
const getSeverityIcon = (severity: BugReportSeverity) => {
  switch (severity) {
    case BugReportSeverity.CRITICAL:
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case BugReportSeverity.HIGH:
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case BugReportSeverity.MEDIUM:
      return <Bug className="h-5 w-5 text-yellow-500" />;
    case BugReportSeverity.LOW:
      return <Bug className="h-5 w-5 text-blue-500" />;
    default:
      return <Bug className="h-5 w-5" />;
  }
};

/**
 * Get appropriate text and color for status
 */
const getStatusDisplay = (status: BugReportStatus) => {
  switch (status) {
    case BugReportStatus.NEW:
      return { label: 'New', color: 'bg-amber-100 text-amber-800' };
    case BugReportStatus.IN_PROGRESS:
      return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
    case BugReportStatus.RESOLVED:
      return { label: 'Resolved', color: 'bg-green-100 text-green-800' };
    case BugReportStatus.WONT_FIX:
      return { label: "Won't Fix", color: 'bg-gray-100 text-gray-800' };
    case BugReportStatus.DUPLICATE:
      return { label: 'Duplicate', color: 'bg-purple-100 text-purple-800' };
    default:
      return { label: status, color: '' };
  }
};

/**
 * Bug Report Detail component
 */
const BugReportDetail: React.FC<BugReportDetailProps> = ({ 
  report, 
  onStatusChange, 
  onClose 
}) => {
  const [status, setStatus] = useState<BugReportStatus>(report.status);
  const [adminNotes, setAdminNotes] = useState<string>(report.adminNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeId, setAssigneeId] = useState<number | null>(report.assignedTo || null);
  
  const statusDisplay = getStatusDisplay(report.status);
  
  /**
   * Handle status update
   */
  const handleStatusUpdate = async () => {
    if (status === report.status && adminNotes === report.adminNotes) {
      return; // No changes made
    }
    
    setIsSubmitting(true);
    try {
      const updatedReport = await updateBugReportStatus(
        report.id,
        status,
        adminNotes
      );
      
      if (onStatusChange) {
        onStatusChange(updatedReport);
      }
    } catch (error) {
      console.error('Failed to update bug report status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handle assignment update
   */
  const handleAssignmentUpdate = async (newAssigneeId: number | null) => {
    if (newAssigneeId === report.assignedTo) {
      return; // No changes made
    }
    
    setIsSubmitting(true);
    try {
      const updatedReport = await assignBugReport(
        report.id,
        newAssigneeId
      );
      
      setAssigneeId(newAssigneeId);
      
      if (onStatusChange) {
        onStatusChange(updatedReport);
      }
    } catch (error) {
      console.error('Failed to update bug report assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getSeverityIcon(report.severity)}
            <CardTitle className="text-lg">{report.title}</CardTitle>
          </div>
          <Badge className={statusDisplay.color}>
            {statusDisplay.label}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 mt-2">
          <User className="h-4 w-4" />
          <span>Reported by {report.userName || `User #${report.userId}`}</span>
          <span className="mx-2">•</span>
          <Calendar className="h-4 w-4" />
          <span>{formatDate(report.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Description</h3>
          <p className="text-sm">{report.description}</p>
        </div>
        
        <Separator />
        
        {/* Steps to Reproduce */}
        {report.stepsToReproduce && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Steps to Reproduce</h3>
            <p className="text-sm whitespace-pre-line">{report.stepsToReproduce}</p>
          </div>
        )}
        
        {/* Expected vs Actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.expectedBehavior && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Expected Behavior</h3>
              <p className="text-sm">{report.expectedBehavior}</p>
            </div>
          )}
          
          {report.actualBehavior && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Actual Behavior</h3>
              <p className="text-sm">{report.actualBehavior}</p>
            </div>
          )}
        </div>
        
        {/* Screenshots */}
        {(report.screenshotPath || (report.screenshots && report.screenshots.length > 0)) && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Screenshots</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {report.screenshotPath && (
                <div className="border rounded p-2">
                  <img 
                    src={report.screenshotPath} 
                    alt="Bug screenshot" 
                    className="max-w-full h-auto"
                  />
                </div>
              )}
              
              {report.screenshots && report.screenshots.map((screenshot, index) => (
                <div key={index} className="border rounded p-2">
                  <img 
                    src={screenshot} 
                    alt={`Bug screenshot ${index + 1}`} 
                    className="max-w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Technical Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Technical Details</h3>
              
              {report.deviceInfo && (
                <div className="flex items-start gap-2 text-sm mb-2">
                  <Computer className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Device:</span> {report.deviceInfo}
                  </span>
                </div>
              )}
              
              {report.browserInfo && (
                <div className="flex items-start gap-2 text-sm mb-2">
                  <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Browser:</span> {report.browserInfo}
                  </span>
                </div>
              )}
              
              {report.currentPage && (
                <div className="flex items-start gap-2 text-sm mb-2">
                  <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Page:</span> {report.currentPage}
                  </span>
                </div>
              )}
              
              {report.screenSize && (
                <div className="flex items-start gap-2 text-sm mb-2">
                  <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Screen Size:</span> {report.screenSize}
                  </span>
                </div>
              )}
              
              {report.isReproducible !== undefined && (
                <div className="flex items-start gap-2 text-sm">
                  <Bug className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Reproducible:</span> {report.isReproducible ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Admin Notes */}
            <div>
              <Label htmlFor="adminNotes" className="font-semibold text-sm">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this issue..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Status Management</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Change Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as BugReportStatus)}
                  >
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BugReportStatus.NEW}>New</SelectItem>
                      <SelectItem value={BugReportStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={BugReportStatus.RESOLVED}>Resolved</SelectItem>
                      <SelectItem value={BugReportStatus.WONT_FIX}>Won't Fix</SelectItem>
                      <SelectItem value={BugReportStatus.DUPLICATE}>Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assignee">Assign To</Label>
                  <Select
                    value={assigneeId?.toString() || ''}
                    onValueChange={(value) => handleAssignmentUpdate(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="assignee" className="mt-2">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      <SelectItem value="1">Admin User</SelectItem>
                      <SelectItem value="2">Developer 1</SelectItem>
                      <SelectItem value="3">Developer 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {report.resolvedAt && (
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      <span className="font-medium">Resolved at:</span> {formatDate(report.resolvedAt)}
                    </span>
                  </div>
                )}
                
                {report.assignedToName && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>
                      <span className="font-medium">Assigned to:</span> {report.assignedToName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button 
          onClick={handleStatusUpdate} 
          disabled={isSubmitting || (status === report.status && adminNotes === report.adminNotes)}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BugReportDetail;