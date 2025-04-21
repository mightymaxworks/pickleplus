/**
 * PKL-278651-BOUNCE-0003-ADMIN-DETAIL - Bounce Finding Detail Component
 * 
 * This component displays detailed information about a selected finding
 * including reproduction steps, screenshots, and related technical details.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Bug, 
  ExternalLink, 
  Code, 
  Image, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  User,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Type for Finding object
interface Finding {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix' | 'duplicate';
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
  browser?: string;
  url?: string;
  stackTrace?: string;
  consoleOutput?: string[];
  relatedFindings?: number[];
  resolvedAt?: string;
  resolvedBy?: string;
  reproSteps?: string;
  testName?: string;
}

// Props type
interface BounceFindingDetailProps {
  finding: Finding;
  onStatusChange?: (status: string) => void;
  onAssign?: (assignee: string) => void;
  onClose?: () => void;
}

/**
 * Component for detailed view of a finding
 */
const BounceFindingDetail: React.FC<BounceFindingDetailProps> = ({
  finding,
  onStatusChange,
  onAssign,
  onClose
}) => {
  const queryClient = useQueryClient();
  
  // Get the appropriate severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  // Get the appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>;
      case 'wont_fix':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Won't Fix</Badge>;
      case 'duplicate':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Duplicate</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Mutation for marking finding as verified
  const verifyFindingMutation = useMutation({
    mutationFn: async (findingId: number) => {
      return apiRequest(`/api/admin/bounce/findings/${findingId}/verify`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: 'Finding verified',
        description: 'The finding has been marked as verified.',
        variant: 'default'
      });
    },
    onError: (error) => {
      console.error('Failed to verify finding:', error);
      toast({
        title: 'Verification failed',
        description: 'Failed to verify the finding. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for adding a note
  const addNoteMutation = useMutation({
    mutationFn: async ({ findingId, note }: { findingId: number; note: string }) => {
      return apiRequest(`/api/admin/bounce/findings/${findingId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/findings'] });
      toast({
        title: 'Note added',
        description: 'Your note has been added to the finding.',
        variant: 'default'
      });
    },
    onError: (error) => {
      console.error('Failed to add note:', error);
      toast({
        title: 'Failed to add note',
        description: 'There was an error adding your note. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Format date to a readable string
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      {/* Header with title and severity */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getSeverityIcon(finding.severity)}
            <h2 className="text-2xl font-bold">{finding.title}</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            ID: {finding.id} • Found during {finding.testName || `Test Run #${finding.testRunId}`}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(finding.status)}
          {finding.priority && (
            <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              P{finding.priority}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Found
              </span>
              <span className="text-sm font-medium">
                {formatDate(finding.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <User className="h-3 w-3 mr-1" /> Assigned
              </span>
              <span className="text-sm font-medium">
                {finding.assignedTo || 'Unassigned'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <Bug className="h-3 w-3 mr-1" /> Area
              </span>
              <span className="text-sm font-medium">
                {finding.area || 'General'}
                {finding.component && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({finding.component})
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Browser
              </span>
              <span className="text-sm font-medium">
                {finding.browser || 'Chrome'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <Card>
          <CardContent className="pt-4 whitespace-pre-line">
            {finding.description}
          </CardContent>
        </Card>
      </div>
      
      {/* Reproduction Steps */}
      {(finding.steps?.length > 0 || finding.reproSteps) && (
        <div>
          <h3 className="text-lg font-medium mb-2">Reproduction Steps</h3>
          <Card>
            <CardContent className="pt-4">
              {finding.steps && finding.steps.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1">
                  {finding.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              ) : finding.reproSteps ? (
                <div className="whitespace-pre-line">
                  {finding.reproSteps}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Technical Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">Technical Details</h3>
        <div className="space-y-4">
          {/* URL */}
          {finding.url && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <ExternalLink className="h-4 w-4 mr-2" /> URL
                  </div>
                  <div className="text-sm overflow-x-auto">
                    <a 
                      href={finding.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {finding.url}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Element Selector */}
          {finding.elementSelector && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <Code className="h-4 w-4 mr-2" /> Element Selector
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-xs font-mono overflow-x-auto">
                    {finding.elementSelector}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Stack Trace (if available) */}
          {finding.stackTrace && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <Code className="h-4 w-4 mr-2" /> Stack Trace
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-xs font-mono overflow-x-auto">
                    <pre>{finding.stackTrace}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Console Output (if available) */}
          {finding.consoleOutput && finding.consoleOutput.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <Code className="h-4 w-4 mr-2" /> Console Output
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                    {finding.consoleOutput.map((line, index) => (
                      <div key={index} className="py-0.5">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Screenshot */}
      {finding.screenshot && (
        <div>
          <h3 className="text-lg font-medium mb-2">Screenshot</h3>
          <Card>
            <CardContent className="pt-4">
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={finding.screenshot} 
                  alt="Finding Screenshot" 
                  className="w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Related Findings */}
      {finding.relatedFindings && finding.relatedFindings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Related Findings</h3>
          <Card>
            <CardContent className="pt-4">
              <ul className="divide-y">
                {finding.relatedFindings.map((id) => (
                  <li key={id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bug className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Finding #{id}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {finding.status === 'open' && (
          <Button onClick={() => onStatusChange?.('in_progress')}>
            <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
            Start Working
          </Button>
        )}
        
        {finding.status === 'in_progress' && (
          <Button onClick={() => onStatusChange?.('resolved')}>
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Mark Resolved
          </Button>
        )}
        
        {['open', 'in_progress'].includes(finding.status) && (
          <Button variant="secondary" onClick={() => onStatusChange?.('wont_fix')}>
            <X className="h-4 w-4 mr-2" />
            Won't Fix
          </Button>
        )}
        
        {!finding.assignedTo && (
          <Button variant="outline" onClick={() => onAssign?.('current-user')}>
            <User className="h-4 w-4 mr-2" />
            Assign to Me
          </Button>
        )}
        
        <Button variant="outline" onClick={() => verifyFindingMutation.mutate(finding.id)}>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Verify Finding
        </Button>
      </div>
    </div>
  );
};

export default BounceFindingDetail;