/**
 * PKL-278651-COACH-ADMIN-001 - Coach Application Review System
 * Admin interface for reviewing and managing coach applications
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle, Clock, Eye, FileText, Award, Phone, Mail, Calendar } from 'lucide-react';

interface CoachApplication {
  id: number;
  userId: number;
  userName: string;
  email: string;
  coachType: 'independent' | 'facility' | 'guest' | 'volunteer';
  applicationStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    emergencyContact: string;
  };
  experience: {
    yearsPlaying: number;
    yearsCoaching: number;
    previousExperience: string;
    achievements: string[];
  };
  certifications: {
    pcpCertified: boolean;
    certificationNumber: string;
    otherCertifications: string[];
  };
  availability: {
    schedule: Record<string, any>;
    preferredTimes: string[];
  };
  rates: {
    hourlyRate: number;
    packageRates: Record<string, number>;
  };
  specializations: string[];
  references: Array<{
    name: string;
    relationship: string;
    contact: string;
  }>;
  teachingPhilosophy?: string;
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  under_review: Eye,
  approved: CheckCircle,
  rejected: XCircle
};

// Status icon helper function
const getStatusIcon = (status: string) => {
  const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
  return <IconComponent className="w-3 h-3 mr-1" />;
};

export default function CoachApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<CoachApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/admin/coach-applications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/coach-applications');
      return response.json();
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ applicationId, action, notes }: { 
      applicationId: number; 
      action: string; 
      notes: string;
    }) => {
      const response = await apiRequest('POST', `/api/admin/coach-applications/${applicationId}/review`, {
        action,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coach-applications'] });
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewNotes('');
      toast({
        title: "Application Reviewed",
        description: "Coach application has been processed successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to process application review.",
        variant: "destructive"
      });
    }
  });

  const handleReview = () => {
    if (!selectedApplication) return;
    
    reviewMutation.mutate({
      applicationId: selectedApplication.id,
      action: reviewAction,
      notes: reviewNotes
    });
  };

  const filteredApplications = applications.filter((app: CoachApplication) => {
    if (selectedTab === 'all') return true;
    return app.applicationStatus === selectedTab;
  });

  const ApplicationCard = ({ application }: { application: CoachApplication }) => {
    const StatusIcon = statusIcons[application.applicationStatus];
    
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {application.personalInfo?.firstName || 'Unknown'} {application.personalInfo?.lastName || 'User'}
              </CardTitle>
              <CardDescription>
                {application.email || 'No email'} • Applied {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Date unavailable'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[application.applicationStatus as keyof typeof statusColors] || statusColors.pending}>
                {getStatusIcon(application.applicationStatus)}
                {(application.applicationStatus || 'pending').replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {application.coachType || 'Unknown Type'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{application.experience?.yearsCoaching || 0}y coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {application.certifications?.pcpCertified ? 'PCP Certified' : 'No PCP'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{application.personalInfo?.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">${application.rates?.hourlyRate || 0}/hr</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {(application.specializations || []).slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {(application.specializations || []).length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{(application.specializations || []).length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <ApplicationDetails application={application} />
                </DialogContent>
              </Dialog>
              
              {application.applicationStatus === 'pending' && (
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application);
                    setReviewDialogOpen(true);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ApplicationDetails = ({ application }: { application: CoachApplication }) => (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          Coach Application - {application.personalInfo.firstName} {application.personalInfo.lastName}
        </DialogTitle>
        <DialogDescription>
          Submitted on {new Date(application.submittedAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="availability">Rates & Philosophy</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <p className="text-sm text-gray-600">
                {application.personalInfo.firstName} {application.personalInfo.lastName}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{application.personalInfo.email || 'Not provided'}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm text-gray-600">{application.personalInfo.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <p className="text-sm text-gray-600">{application.personalInfo.dateOfBirth || 'Not provided'}</p>
            </div>
            {application.personalInfo.dateOfBirth && (
              <div>
                <Label>Age</Label>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const birthDate = new Date(application.personalInfo.dateOfBirth);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      return age - 1;
                    }
                    return age;
                  })()} years old
                </p>
              </div>
            )}
            <div>
              <Label>Coach Type</Label>
              <p className="text-sm text-gray-600 capitalize">{application.coachType || 'Not specified'}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Years Playing Pickleball</Label>
              <p className="text-sm text-gray-600">{application.experience.yearsPlaying} years</p>
            </div>
            <div>
              <Label>Years Coaching</Label>
              <p className="text-sm text-gray-600">{application.experience.yearsCoaching} years</p>
            </div>
          </div>
          <div>
            <Label>Previous Experience</Label>
            <p className="text-sm text-gray-600 mt-1">{application.experience.previousExperience}</p>
          </div>
          <div>
            <Label>Achievements</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {application.experience.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary">{achievement}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {application.specializations.map((spec, index) => (
                <Badge key={index} variant="outline">{spec}</Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>PCP Coaching Certification Programme</Label>
              <p className="text-sm text-gray-600">
                {application.certifications.pcpCertified ? (
                  <span className="text-green-600">✓ Certified</span>
                ) : (
                  <span className="text-red-600">✗ Not Certified</span>
                )}
              </p>
              {application.certifications.certificationNumber && (
                <p className="text-xs text-gray-500">
                  Cert #: {application.certifications.certificationNumber}
                </p>
              )}
            </div>
          </div>
          {application.certifications.otherCertifications.length > 0 && (
            <div>
              <Label>Other Certifications</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {application.certifications.otherCertifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Individual Rate</Label>
              <p className="text-sm text-gray-600">
                ${(application.availability as any)?.individual || 'Not specified'}/hour
              </p>
            </div>
            <div>
              <Label>Group Rate</Label>
              <p className="text-sm text-gray-600">
                ${(application.availability as any)?.group || 'Not specified'}/hour
              </p>
            </div>
          </div>
          <div>
            <Label>Teaching Philosophy</Label>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {application.teachingPhilosophy || 'Not provided'}
            </p>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Coach Applications</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coach Applications</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredApplications.length} {selectedTab === 'all' ? 'total' : selectedTab}
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({applications.filter((a: CoachApplication) => a.applicationStatus === 'pending').length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({applications.filter((a: CoachApplication) => a.applicationStatus === 'under_review').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({applications.filter((a: CoachApplication) => a.applicationStatus === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applications.filter((a: CoachApplication) => a.applicationStatus === 'rejected').length})</TabsTrigger>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500">
                    {selectedTab === 'pending' 
                      ? 'No pending applications to review.'
                      : `No ${selectedTab} applications.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((application: CoachApplication) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Coach Application</DialogTitle>
            <DialogDescription>
              {selectedApplication && 
                `Review application from ${selectedApplication.personalInfo.firstName} ${selectedApplication.personalInfo.lastName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={reviewAction} onValueChange={(value: any) => setReviewAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Application</SelectItem>
                  <SelectItem value="reject">Reject Application</SelectItem>
                  <SelectItem value="request_info">Request Additional Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReview}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Processing...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}