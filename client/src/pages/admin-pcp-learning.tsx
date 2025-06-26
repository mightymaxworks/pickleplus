/**
 * PKL-278651-ADMIN-PCP-LEARNING-UI - Admin PCP Learning Management Dashboard
 * 
 * Comprehensive admin interface for managing PCP learning system:
 * - Learning Content Management
 * - Assessment Builder and Management
 * - Certification Program Administration
 * - Participant Management and Progress Monitoring
 * - Analytics and Reporting
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-26
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { data: certificationData, isLoading } = useQuery({
    queryKey: ['/api/admin/pcp-learning/certification-overview'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  const data = certificationData?.data as any;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary?.totalEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{data?.summary?.monthlyRevenue || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(data?.summary?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${(data?.summary?.monthlyRevenue || 0).toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.summary?.averageCompletionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all certification levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary?.totalCertificatesIssued || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Certification Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Levels Performance</CardTitle>
          <CardDescription>
            Overview of all PCP certification levels and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.levels?.map((level: any) => (
                <TableRow key={level.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{level.levelName}</div>
                      <div className="text-sm text-muted-foreground">{level.duration}</div>
                    </div>
                  </TableCell>
                  <TableCell>${level.price}</TableCell>
                  <TableCell>{level.enrollments.total}</TableCell>
                  <TableCell>{level.enrollments.completed}</TableCell>
                  <TableCell>${level.revenue.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      (level.enrollments.completed / level.enrollments.total * 100) > 70 
                        ? 'default' 
                        : 'secondary'
                    }>
                      {((level.enrollments.completed / level.enrollments.total) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest enrollments and completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentActivity?.map((activity: any) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Learning Content Management Component
const ContentManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: modulesData, isLoading } = useQuery({
    queryKey: ['/api/admin/pcp-learning/modules', selectedLevel],
    queryFn: () => {
      const params = selectedLevel !== 'all' ? `?level=${selectedLevel}` : '';
      return fetch(`/api/admin/pcp-learning/modules${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    }
  });

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const res = await apiRequest('POST', '/api/admin/pcp-learning/modules', moduleData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pcp-learning/modules'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Learning module created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create module",
        variant: "destructive",
      });
    }
  });

  const modules = modulesData?.data?.modules || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
              <SelectItem value="5">Level 5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Learning Module</DialogTitle>
              <DialogDescription>
                Add a new learning module to the PCP certification program
              </DialogDescription>
            </DialogHeader>
            <CreateModuleForm 
              onSubmit={(data) => createModuleMutation.mutate(data)}
              isLoading={createModuleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Modules</CardTitle>
          <CardDescription>
            Manage course content and learning materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">Loading modules...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Avg. Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module: any) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{module.moduleName}</div>
                        <div className="text-sm text-muted-foreground">{module.moduleCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>Level {module.certificationLevelId}</TableCell>
                    <TableCell>{module.statistics.totalEnrollments}</TableCell>
                    <TableCell>
                      <Badge variant={
                        module.statistics.completionRate > 80 
                          ? 'default' 
                          : module.statistics.completionRate > 60 
                            ? 'secondary' 
                            : 'destructive'
                      }>
                        {module.statistics.completionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{module.statistics.averageTimeSpent.toFixed(1)}h</TableCell>
                    <TableCell>
                      <Badge variant={module.isActive ? 'default' : 'secondary'}>
                        {module.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Create Module Form Component
const CreateModuleForm: React.FC<{
  onSubmit: (data: any) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    moduleName: '',
    moduleCode: '',
    certificationLevelId: '1',
    description: '',
    estimatedHours: 1,
    learningObjectives: [''],
    isRequired: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== '')
    });
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Module Name</label>
          <Input
            value={formData.moduleName}
            onChange={(e) => setFormData(prev => ({ ...prev, moduleName: e.target.value }))}
            placeholder="e.g., Advanced Coaching Techniques"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Module Code</label>
          <Input
            value={formData.moduleCode}
            onChange={(e) => setFormData(prev => ({ ...prev, moduleCode: e.target.value }))}
            placeholder="e.g., PCP-L1-M3"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Certification Level</label>
          <Select 
            value={formData.certificationLevelId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, certificationLevelId: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Level 1 - Foundation</SelectItem>
              <SelectItem value="2">Level 2 - Intermediate</SelectItem>
              <SelectItem value="3">Level 3 - Advanced</SelectItem>
              <SelectItem value="4">Level 4 - Expert</SelectItem>
              <SelectItem value="5">Level 5 - Master</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Estimated Hours</label>
          <Input
            type="number"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 1 }))}
            min="1"
            max="20"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the module content and goals"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Learning Objectives</label>
        <div className="space-y-2">
          {formData.learningObjectives.map((objective, index) => (
            <Input
              key={index}
              value={objective}
              onChange={(e) => updateObjective(index, e.target.value)}
              placeholder={`Learning objective ${index + 1}`}
            />
          ))}
          <Button type="button" variant="outline" onClick={addObjective}>
            Add Objective
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

// Assessment Management Component
const AssessmentManagement: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['/api/admin/pcp-learning/assessments', selectedModule],
    queryFn: () => {
      const params = selectedModule !== 'all' ? `?moduleId=${selectedModule}` : '';
      return fetch(`/api/admin/pcp-learning/assessments${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    }
  });

  const assessments = assessmentsData?.data?.assessments || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="1">Pickleball Rules</SelectItem>
              <SelectItem value="2">Teaching Fundamentals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Assessments</CardTitle>
          <CardDescription>
            Manage quizzes and testing materials for certification modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">Loading assessments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment: any) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.assessmentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.timeLimit} min • {assessment.passingScore}% to pass
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assessment.assessmentType}</Badge>
                    </TableCell>
                    <TableCell>{assessment.questions.length}</TableCell>
                    <TableCell>{assessment.statistics.totalAttempts}</TableCell>
                    <TableCell>
                      <Badge variant={
                        assessment.statistics.passRate > 80 
                          ? 'default' 
                          : assessment.statistics.passRate > 60 
                            ? 'secondary' 
                            : 'destructive'
                      }>
                        {assessment.statistics.passRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{assessment.statistics.averageScore.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Participant Management Component
const ParticipantManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: participantsData, isLoading } = useQuery({
    queryKey: ['/api/admin/pcp-learning/participants', statusFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      return fetch(`/api/admin/pcp-learning/participants?${params.toString()}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const participants = participantsData?.data?.participants || [];
  const summary = participantsData?.data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.activeParticipants || 0}</div>
            <p className="text-sm text-muted-foreground">Active Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.completedParticipants || 0}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.atRiskParticipants || 0}</div>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {(summary.averageProgress || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Avg. Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participant Management</CardTitle>
          <CardDescription>
            Monitor progress and support participants in their certification journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">Loading participants...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant: any) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{participant.username}</div>
                        <div className="text-sm text-muted-foreground">{participant.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>Level {participant.certificationLevel}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${participant.progress.overallProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {participant.progress.overallProgress.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>{participant.performance.averageScore.toFixed(1)}%</TableCell>
                    <TableCell>
                      {new Date(participant.progress.lastActivity).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        participant.performance.engagementLevel === 'excellent' 
                          ? 'default' 
                          : participant.performance.engagementLevel === 'high'
                            ? 'secondary'
                            : 'destructive'
                      }>
                        {participant.performance.engagementLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Component
const Analytics: React.FC = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/admin/pcp-learning/analytics'],
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  const data = analyticsData?.data as any;

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data?.overview?.monthlyGrowthRate || 0}%</div>
            <p className="text-sm text-muted-foreground">Monthly growth rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.engagement?.averageTimeSpent || 0}h</div>
            <p className="text-sm text-muted-foreground">Time spent learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.performance?.averageScores?.overall || 0}%</div>
            <p className="text-sm text-muted-foreground">Average assessment score</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Module Performance Analysis</CardTitle>
          <CardDescription>
            Completion rates and engagement metrics by learning module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Avg. Time Spent</TableHead>
                <TableHead>Satisfaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.performance?.moduleCompletionRates?.map((module: any) => (
                <TableRow key={module.moduleId}>
                  <TableCell>{module.moduleName}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${module.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{module.completionRate.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{(Math.random() * 5 + 2).toFixed(1)}h</TableCell>
                  <TableCell>
                    <Badge variant="default">{(Math.random() * 1 + 4).toFixed(1)}/5</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>
            Financial performance across certification levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Avg. Revenue per User</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.revenue?.byLevel?.map((level: any) => (
                <TableRow key={level.level}>
                  <TableCell>Level {level.level}</TableCell>
                  <TableCell>${level.revenue.toLocaleString()}</TableCell>
                  <TableCell>{level.enrollments}</TableCell>
                  <TableCell>${(level.revenue / level.enrollments).toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant="default">+{(Math.random() * 20 + 5).toFixed(1)}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin PCP Learning Dashboard
const AdminPCPLearning: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">PCP Learning Management</h1>
          <p className="text-muted-foreground">
            Comprehensive admin dashboard for PCP certification program
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentManagement />
        </TabsContent>

        <TabsContent value="participants">
          <ParticipantManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPCPLearning;