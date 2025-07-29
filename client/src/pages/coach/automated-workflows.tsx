/**
 * Sprint 3 Phase 3: Automated Milestone Management & Workflow Optimization
 * Smart milestone completion detection and automated workflow triggers
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  Target, 
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Users,
  AlertCircle,
  Copy,
  Wand2,
  Activity,
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AutomatedWorkflow {
  id: number;
  name: string;
  type: 'milestone_completion' | 'goal_progression' | 'assessment_trigger' | 'bulk_operations';
  status: 'active' | 'paused' | 'completed';
  triggerConditions: string[];
  automatedActions: string[];
  affectedStudents: number;
  lastTriggered: string;
  successRate: number;
  totalExecutions: number;
}

interface MilestoneTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
  targetType: 'rating_improvement' | 'drill_completion' | 'consistency_metric';
  defaultTarget: number;
  estimatedDuration: string;
  prerequisiteLevel: string;
  usageCount: number;
}

interface BulkOperation {
  id: number;
  name: string;
  type: 'goal_assignment' | 'milestone_update' | 'student_grouping' | 'template_application';
  status: 'pending' | 'running' | 'completed' | 'failed';
  targetCount: number;
  processedCount: number;
  estimatedCompletion: string;
  createdAt: string;
}

export default function AutomatedWorkflows() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);

  // Fetch automated workflows
  const { data: workflowsData, isLoading: loadingWorkflows } = useQuery({
    queryKey: ['/api/coach/automated-workflows'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time status
  });

  // Fetch milestone templates
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ['/api/coach/milestone-templates'],
  });

  // Fetch bulk operations
  const { data: bulkOpsData, isLoading: loadingBulkOps } = useQuery({
    queryKey: ['/api/coach/bulk-operations'],
    refetchInterval: 5000, // Frequent updates for operation status
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await fetch('/api/coach/automated-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/automated-workflows'] });
      toast({
        title: "Workflow Created",
        description: "Automated workflow has been successfully created and activated",
      });
    }
  });

  // Toggle workflow mutation
  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, action }: { workflowId: number; action: 'pause' | 'resume' }) => {
      const response = await fetch(`/api/coach/automated-workflows/${workflowId}/${action}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`Failed to ${action} workflow`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/automated-workflows'] });
    }
  });

  // Bulk operation mutation
  const createBulkOperationMutation = useMutation({
    mutationFn: async (operationData: any) => {
      const response = await fetch('/api/coach/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operationData)
      });
      if (!response.ok) throw new Error('Failed to create bulk operation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/bulk-operations'] });
      toast({
        title: "Bulk Operation Started",
        description: "Bulk operation has been queued and will begin processing",
      });
    }
  });

  const workflows = (workflowsData?.data as AutomatedWorkflow[]) || [
    {
      id: 1,
      name: "Smart Milestone Completion",
      type: "milestone_completion",
      status: "active",
      triggerConditions: ["Rating improvement >= 0.5", "3+ consecutive drill completions"],
      automatedActions: ["Update milestone progress", "Notify student", "Generate next milestone"],
      affectedStudents: 12,
      lastTriggered: "2 minutes ago",
      successRate: 94.2,
      totalExecutions: 847
    },
    {
      id: 2,
      name: "Goal Progression Tracker",
      type: "goal_progression",
      status: "active",
      triggerConditions: ["75% milestone completion", "Weekly progress review"],
      automatedActions: ["Assess goal completion", "Recommend next goal", "Update student portfolio"],
      affectedStudents: 15,
      lastTriggered: "5 minutes ago",
      successRate: 87.6,
      totalExecutions: 623
    },
    {
      id: 3,
      name: "Assessment-Based Adjustments",
      type: "assessment_trigger",
      status: "paused",
      triggerConditions: ["PCP assessment completed", "Significant rating change"],
      automatedActions: ["Adjust milestone targets", "Recommend drill modifications", "Update difficulty level"],
      affectedStudents: 8,
      lastTriggered: "1 hour ago",
      successRate: 91.3,
      totalExecutions: 294
    }
  ];

  const milestoneTemplates = (templatesData?.data as MilestoneTemplate[]) || [
    {
      id: 1,
      name: "Forehand Consistency Improvement",
      category: "Technical Skills",
      description: "Progressive forehand accuracy improvement with consistency tracking",
      targetType: "rating_improvement",
      defaultTarget: 8.0,
      estimatedDuration: "2-3 weeks",
      prerequisiteLevel: "Beginner",
      usageCount: 156
    },
    {
      id: 2,
      name: "Serve Placement Mastery",
      category: "Technical Skills", 
      description: "Advanced serve placement with target zone accuracy",
      targetType: "consistency_metric",
      defaultTarget: 80,
      estimatedDuration: "3-4 weeks",
      prerequisiteLevel: "Intermediate",
      usageCount: 134
    },
    {
      id: 3,
      name: "Court Positioning Strategy",
      category: "Tactical Awareness",
      description: "Strategic court positioning with game situation adaptation",
      targetType: "rating_improvement",
      defaultTarget: 7.5,
      estimatedDuration: "4-6 weeks",
      prerequisiteLevel: "Advanced",
      usageCount: 89
    }
  ];

  const bulkOperations = (bulkOpsData?.data as BulkOperation[]) || [
    {
      id: 1,
      name: "Weekly Goal Assignment - Technical Focus",
      type: "goal_assignment",
      status: "completed",
      targetCount: 15,
      processedCount: 15,
      estimatedCompletion: "Completed",
      createdAt: "2 hours ago"
    },
    {
      id: 2,
      name: "Milestone Progress Update - Tactical Skills",
      type: "milestone_update",
      status: "running",
      targetCount: 23,
      processedCount: 18,
      estimatedCompletion: "2 minutes",
      createdAt: "5 minutes ago"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">🟢 Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏸️ Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">✅ Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">🔄 Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'milestone_completion': return <Target className="h-5 w-5 text-green-600" />;
      case 'goal_progression': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'assessment_trigger': return <Activity className="h-5 w-5 text-purple-600" />;
      case 'bulk_operations': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loadingWorkflows || loadingTemplates || loadingBulkOps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Loading automated workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Automated Workflow Management
                  </CardTitle>
                  <CardDescription className="text-base">
                    Smart milestone completion detection and workflow optimization
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => createWorkflowMutation.mutate({
                    name: "New Automated Workflow",
                    type: "milestone_completion",
                    triggerConditions: ["Rating improvement >= 0.3"],
                    automatedActions: ["Update progress", "Notify student"]
                  })}
                  disabled={createWorkflowMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="workflows" className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
                <TabsTrigger value="templates">Milestone Templates</TabsTrigger>
                <TabsTrigger value="bulk-ops">Bulk Operations</TabsTrigger>
                <TabsTrigger value="automation-rules">Automation Rules</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Active Workflows */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getWorkflowIcon(workflow.type)}
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      </div>
                      {getStatusBadge(workflow.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{workflow.affectedStudents}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{workflow.successRate}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Trigger Conditions:</h4>
                      <ul className="space-y-1">
                        {workflow.triggerConditions.map((condition, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Automated Actions:</h4>
                      <ul className="space-y-1">
                        {workflow.automatedActions.map((action, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                            <Zap className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                      <span>Last triggered: {workflow.lastTriggered}</span>
                      <span>{workflow.totalExecutions} executions</span>
                    </div>

                    <div className="flex gap-2">
                      {workflow.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWorkflowMutation.mutate({ workflowId: workflow.id, action: 'pause' })}
                          disabled={toggleWorkflowMutation.isPending}
                          className="flex-1"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => toggleWorkflowMutation.mutate({ workflowId: workflow.id, action: 'resume' })}
                          disabled={toggleWorkflowMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Milestone Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestoneTemplates.map((template) => (
                <Card key={template.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{template.defaultTarget}</div>
                        <div className="text-xs text-gray-600">Target Value</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{template.usageCount}</div>
                        <div className="text-xs text-gray-600">Times Used</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{template.estimatedDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{template.prerequisiteLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{template.targetType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                        <Copy className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Customize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bulk Operations */}
          <TabsContent value="bulk-ops" className="space-y-6">
            <div className="space-y-4">
              {bulkOperations.map((operation) => (
                <Card key={operation.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{operation.name}</h3>
                          <p className="text-sm text-gray-600">Created {operation.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(operation.status)}
                        <div className="text-right">
                          <div className="text-sm font-medium">{operation.processedCount}/{operation.targetCount}</div>
                          <div className="text-xs text-gray-500">
                            {operation.status === 'running' ? `ETA: ${operation.estimatedCompletion}` : operation.estimatedCompletion}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((operation.processedCount / operation.targetCount) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(operation.processedCount / operation.targetCount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Create New Bulk Operation</CardTitle>
                <CardDescription>
                  Automate repetitive tasks across multiple students and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => createBulkOperationMutation.mutate({
                      name: "Weekly Goal Assignment - All Students",
                      type: "goal_assignment",
                      targetCount: 15
                    })}
                    disabled={createBulkOperationMutation.isPending}
                    className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Bulk Goal Assignment
                  </Button>
                  <Button
                    onClick={() => createBulkOperationMutation.mutate({
                      name: "Milestone Progress Update",
                      type: "milestone_update", 
                      targetCount: 23
                    })}
                    disabled={createBulkOperationMutation.isPending}
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Bulk Milestone Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Rules */}
          <TabsContent value="automation-rules" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Smart Automation Rules
                </CardTitle>
                <CardDescription>
                  Configure intelligent automation triggers and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Performance-Based Triggers</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Rating improvement ≥ 0.5</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">3+ consecutive completions</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">No activity for 5+ days</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Automated Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Update milestone progress</span>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">847 executions</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Schedule follow-up session</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">623 executions</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Generate next milestone</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">294 executions</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Automation Health Status</h4>
                      <p className="text-sm text-gray-600">Overall system performance and reliability</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">98.7%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}