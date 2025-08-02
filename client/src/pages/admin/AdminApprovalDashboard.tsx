/**
 * Admin Approval Dashboard
 * PKL-278651-ADMIN-APPROVAL-WORKFLOW
 * 
 * Complete admin interface for reviewing and approving coach applications
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye, MessageSquare, Users, TrendingUp, FileText, Calendar } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CoachApplication {
  id: number;
  userId: number;
  applicationType: string;
  applicationStatus: string;
  motivation: string;
  experience: string;
  certifications: any[];
  availability: any;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface ApprovalStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  changesRequestedCount: number;
  totalApplications: number;
  avgProcessingTime: number;
  recentActivity: any[];
}

export default function AdminApprovalDashboard() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [requestedChanges, setRequestedChanges] = useState<string[]>([]);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending applications
  const { data: pendingApplications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/admin-approval/pending-applications'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-approval/pending-applications');
      const data = await res.json();
      return data.applications as CoachApplication[];
    }
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin-approval/dashboard-stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-approval/dashboard-stats');
      const data = await res.json();
      return data.stats as ApprovalStats;
    }
  });

  // Fetch application details
  const { data: selectedApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ['/api/admin-approval/application', selectedApplicationId],
    queryFn: async () => {
      if (!selectedApplicationId) return null;
      const res = await apiRequest('GET', `/api/admin-approval/application/${selectedApplicationId}`);
      const data = await res.json();
      return data.application;
    },
    enabled: !!selectedApplicationId
  });

  // Process approval mutation
  const processApprovalMutation = useMutation({
    mutationFn: async (data: {
      applicationId: number;
      action: 'approve' | 'reject' | 'request_changes';
      reviewComments?: string;
      requestedChanges?: string[];
    }) => {
      const res = await apiRequest('POST', '/api/admin-approval/process-approval', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-approval/pending-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-approval/dashboard-stats'] });
      setSelectedApplicationId(null);
      setReviewComments('');
      setRequestedChanges([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process approval',
        variant: 'destructive',
      });
    }
  });

  // Bulk approval mutation
  const bulkApprovalMutation = useMutation({
    mutationFn: async (data: {
      applicationIds: number[];
      action: 'approve' | 'reject';
      reviewComments?: string;
    }) => {
      const res = await apiRequest('POST', '/api/admin-approval/bulk-approval', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Bulk Action Complete',
        description: `${data.results.successful.length} applications processed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-approval/pending-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-approval/dashboard-stats'] });
      setBulkSelectedIds([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to process bulk approval',
        variant: 'destructive',
      });
    }
  });

  const handleApprovalAction = (action: 'approve' | 'reject' | 'request_changes') => {
    if (!selectedApplicationId) return;

    processApprovalMutation.mutate({
      applicationId: selectedApplicationId,
      action,
      reviewComments: reviewComments || undefined,
      requestedChanges: action === 'request_changes' ? requestedChanges : undefined
    });
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (bulkSelectedIds.length === 0) return;

    bulkApprovalMutation.mutate({
      applicationIds: bulkSelectedIds,
      action,
      reviewComments: reviewComments || undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'changes_requested':
        return <Badge variant="outline" className="text-orange-600"><AlertTriangle className="w-3 h-3 mr-1" />Changes Requested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingApplications || isLoadingStats) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coach Application Review</h1>
          <p className="text-muted-foreground">Review and approve PCP coach applications</p>
        </div>
        
        {bulkSelectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkAction('approve')}
              disabled={bulkApprovalMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Bulk Approve ({bulkSelectedIds.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('reject')}
              disabled={bulkApprovalMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Bulk Reject ({bulkSelectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changes Requested</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.changesRequestedCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            Review coach applications awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingApplications || pendingApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={bulkSelectedIds.includes(application.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelectedIds([...bulkSelectedIds, application.id]);
                          } else {
                            setBulkSelectedIds(bulkSelectedIds.filter(id => id !== application.id));
                          }
                        }}
                      />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={application.user.profileImageUrl} />
                        <AvatarFallback>
                          {(application.user.firstName?.[0] || '') + (application.user.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {application.user.firstName} {application.user.lastName}
                          </h3>
                          {getStatusBadge(application.applicationStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          @{application.user.username} • {application.user.email}
                        </p>
                        <p className="text-sm line-clamp-2">
                          {application.motivation}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {formatDate(application.createdAt)}
                          </span>
                          <span>Type: {application.applicationType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplicationId(application.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Application Review</DialogTitle>
                          <DialogDescription>
                            Review and process coach application
                          </DialogDescription>
                        </DialogHeader>
                        
                        {isLoadingApplication ? (
                          <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                          </div>
                        ) : selectedApplication && (
                          <div className="space-y-6">
                            {/* Applicant Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedApplication.user.profileImageUrl} />
                                <AvatarFallback className="text-lg">
                                  {(selectedApplication.user.firstName?.[0] || '') + (selectedApplication.user.lastName?.[0] || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-semibold">
                                  {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                                </h3>
                                <p className="text-muted-foreground">
                                  @{selectedApplication.user.username} • {selectedApplication.user.email}
                                </p>
                                {getStatusBadge(selectedApplication.applicationStatus)}
                              </div>
                            </div>

                            <Tabs defaultValue="application" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="application">Application</TabsTrigger>
                                <TabsTrigger value="experience">Experience</TabsTrigger>
                                <TabsTrigger value="availability">Availability</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="application" className="space-y-4">
                                <div>
                                  <Label className="text-base font-semibold">Motivation</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                                    {selectedApplication.motivation}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-base font-semibold">Application Type</Label>
                                  <div className="mt-2">
                                    <Badge variant="outline">{selectedApplication.applicationType}</Badge>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="experience" className="space-y-4">
                                <div>
                                  <Label className="text-base font-semibold">Experience</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                                    {selectedApplication.experience}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-base font-semibold">Certifications</Label>
                                  <div className="mt-2 space-y-2">
                                    {selectedApplication.certifications && selectedApplication.certifications.length > 0 ? (
                                      selectedApplication.certifications.map((cert: any, index: number) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded border">
                                          {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-muted-foreground">No certifications provided</p>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="availability" className="space-y-4">
                                <div>
                                  <Label className="text-base font-semibold">Availability</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                                    <pre className="whitespace-pre-wrap text-sm">
                                      {JSON.stringify(selectedApplication.availability, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <Separator />

                            {/* Review Section */}
                            <div className="space-y-4">
                              <Label className="text-base font-semibold">Admin Review</Label>
                              
                              <div>
                                <Label htmlFor="reviewComments">Review Comments</Label>
                                <Textarea
                                  id="reviewComments"
                                  placeholder="Add your review comments..."
                                  value={reviewComments}
                                  onChange={(e) => setReviewComments(e.target.value)}
                                  className="mt-2"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  onClick={() => handleApprovalAction('approve')}
                                  disabled={processApprovalMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Application
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  onClick={() => handleApprovalAction('request_changes')}
                                  disabled={processApprovalMutation.isPending}
                                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Request Changes
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  onClick={() => handleApprovalAction('reject')}
                                  disabled={processApprovalMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject Application
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}