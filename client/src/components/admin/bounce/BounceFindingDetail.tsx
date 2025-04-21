/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Finding Detail Component
 * 
 * This component displays detailed information about a specific finding,
 * including its evidence and allows updating its status.
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
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogClose
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  BounceFindingSeverity, 
  BounceFindingStatus
} from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  ClipboardList,
  Image,
  Terminal,
  Code,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BounceFindingDetailProps {
  findingId: number;
  onBack: () => void;
}

const BounceFindingDetail: React.FC<BounceFindingDetailProps> = ({ 
  findingId, 
  onBack 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  // Fetch the finding details and evidence
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/bounce/findings', findingId],
    queryFn: async () => {
      return apiRequest<any>(`/api/admin/bounce/findings/${findingId}`);
    }
  });

  // Mutation for updating the finding status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest<any>(`/api/admin/bounce/findings/${findingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      // Invalidate the finding query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/bounce/findings', findingId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/bounce/findings'] 
      });
      
      toast({
        title: 'Status updated',
        description: 'The finding status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update the finding status. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
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

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'screenshot':
        return <Image className="h-4 w-4 mr-2" />;
      case 'console_log':
        return <Terminal className="h-4 w-4 mr-2" />;
      case 'network_request':
        return <Code className="h-4 w-4 mr-2" />;
      default:
        return <ClipboardList className="h-4 w-4 mr-2" />;
    }
  };

  const handleViewEvidence = (evidence: any) => {
    setSelectedEvidence(evidence);
    setEvidenceDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-muted-foreground">Loading finding details...</p>
      </div>
    );
  }

  const finding = data?.finding;
  const evidence = data?.evidence || [];

  if (!finding) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Finding Not Found</h3>
        <p className="text-muted-foreground mt-2">
          The requested finding could not be found or you don't have permission to view it.
        </p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Findings
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Findings
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-xl">
                {finding.title}
              </CardTitle>
              <CardDescription className="mt-1">
                ID: {finding.id} · Found on {new Date(finding.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {renderSeverityBadge(finding.severity)}
              {renderStatusBadge(finding.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {finding.description}
            </p>
          </div>

          {finding.reproducibleSteps && (
            <div>
              <h3 className="font-medium mb-2">Steps to Reproduce</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md whitespace-pre-line">
                {finding.reproducibleSteps}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Details</h3>
              <div className="space-y-2">
                {finding.affectedUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Affected URL:</span>
                    <span className="font-mono text-sm">{finding.affectedUrl}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Browser:</span>
                  <span>{finding.browserInfo?.name || "Unknown"}</span>
                </div>
                {finding.browserInfo?.device && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Device:</span>
                    <span>{finding.browserInfo.device}</span>
                  </div>
                )}
                {finding.browserInfo?.os && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">OS:</span>
                    <span>{finding.browserInfo.os}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Current Status:</span>
                  {renderStatusBadge(finding.status)}
                </div>

                <div>
                  <Select 
                    defaultValue={finding.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
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

                {finding.fixedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Fixed At:</span>
                    <span>{new Date(finding.fixedAt).toLocaleString()}</span>
                  </div>
                )}
                
                {finding.assignedToUserId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Assigned To:</span>
                    <span>User #{finding.assignedToUserId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
          <CardDescription>
            Supporting evidence collected for this finding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evidence.length > 0 ? (
            <div className="space-y-4">
              {evidence.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleViewEvidence(item)}
                >
                  <div className="flex items-center">
                    {getEvidenceIcon(item.type)}
                    <div>
                      <p className="font-medium">{item.type.replace('_', ' ')}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No evidence has been collected for this finding.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Evidence Dialog */}
      <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evidence Detail</DialogTitle>
            <DialogDescription>
              {selectedEvidence?.type.replace('_', ' ')} - Created at {
                selectedEvidence ? new Date(selectedEvidence.createdAt).toLocaleString() : ''
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="mt-4">
              {selectedEvidence.type === 'screenshot' ? (
                <div className="border rounded-md overflow-hidden">
                  <img 
                    src={selectedEvidence.content} 
                    alt="Evidence Screenshot" 
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {selectedEvidence.content}
                  </pre>
                </div>
              )}

              {selectedEvidence.metadata && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="metadata">
                    <AccordionTrigger>Metadata</AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-48 whitespace-pre-wrap font-mono text-sm">
                        {JSON.stringify(selectedEvidence.metadata, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BounceFindingDetail;