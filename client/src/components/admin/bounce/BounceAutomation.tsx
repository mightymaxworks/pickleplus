/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Component
 * 
 * Frontend component for managing automated test schedules and templates
 * through an intuitive UI.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Code,
  Cog,
  Edit,
  FileText,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// Form schemas
const templateFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  configuration: z.string().optional() // JSON string
});

const scheduleFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  customCronExpression: z.string().optional(),
  templateId: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  configuration: z.string().optional() // JSON string
});

// Status component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'RUNNING':
      return <Badge className="bg-blue-500">Running</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-green-500">Completed</Badge>;
    case 'FAILED':
      return <Badge className="bg-red-500">Failed</Badge>;
    case 'PENDING':
      return <Badge className="bg-yellow-500">Pending</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-gray-500">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Templates Tab
const TemplatesTab = () => {
  const { data: templates, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/bounce/templates'],
    retry: false,
    onError: (error) => {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error loading templates',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/bounce/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      setAddDialogOpen(false);
      toast({
        title: 'Template created',
        description: 'Your test template has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating template',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/bounce/templates/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      setEditDialogOpen(false);
      toast({
        title: 'Template updated',
        description: 'Your test template has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating template',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/bounce/templates/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      toast({
        title: 'Template deleted',
        description: 'Your test template has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting template',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const handleEditTemplate = (template: any) => {
    setEditTemplate({
      ...template,
      configuration: JSON.stringify(template.configuration, null, 2)
    });
    setEditDialogOpen(true);
  };
  
  const handleDeleteTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable test configurations for automation.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Test Template</DialogTitle>
              <DialogDescription>
                Define a reusable test configuration that can be applied to automated schedules.
              </DialogDescription>
            </DialogHeader>
            <TemplateForm 
              onSubmit={(data) => {
                try {
                  const processedData = {
                    ...data,
                    configuration: data.configuration ? JSON.parse(data.configuration) : {}
                  };
                  addMutation.mutate(processedData);
                } catch (error) {
                  toast({
                    title: "Invalid JSON",
                    description: "Configuration must be valid JSON",
                    variant: "destructive"
                  });
                }
              }}
              isLoading={addMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : templates && templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: any) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description || '-'}</TableCell>
                    <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No Templates</h3>
              <p className="max-w-md mx-auto mb-4">
                Create your first test template to start automating your tests.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Test Template</DialogTitle>
            <DialogDescription>
              Update the test template configuration.
            </DialogDescription>
          </DialogHeader>
          {editTemplate && (
            <TemplateForm 
              defaultValues={editTemplate}
              onSubmit={(data) => {
                try {
                  const processedData = {
                    ...data,
                    id: editTemplate.id,
                    configuration: data.configuration ? JSON.parse(data.configuration) : {}
                  };
                  updateMutation.mutate(processedData);
                } catch (error) {
                  toast({
                    title: "Invalid JSON",
                    description: "Configuration must be valid JSON",
                    variant: "destructive"
                  });
                }
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Schedules Tab
const SchedulesTab = () => {
  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/bounce/schedules'],
    retry: false,
    onError: (error) => {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error loading schedules',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const { data: templates } = useQuery({
    queryKey: ['/api/admin/bounce/templates'],
    retry: false,
    onError: (error) => {
      console.error('Error fetching templates:', error);
    }
  });
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/bounce/schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      setAddDialogOpen(false);
      toast({
        title: 'Schedule created',
        description: 'Your test schedule has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/bounce/schedules/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      setEditDialogOpen(false);
      toast({
        title: 'Schedule updated',
        description: 'Your test schedule has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/bounce/schedules/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: 'Schedule deleted',
        description: 'Your test schedule has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const triggerMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/bounce/schedules/${id}/trigger`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: 'Test triggered',
        description: 'The test has been triggered successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error triggering test',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const pauseMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/bounce/schedules/${id}/pause`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: 'Schedule paused',
        description: 'The schedule has been paused successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error pausing schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const resumeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/bounce/schedules/${id}/resume`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: 'Schedule resumed',
        description: 'The schedule has been resumed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error resuming schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const handleEditSchedule = (schedule: any) => {
    setEditSchedule({
      ...schedule,
      configuration: JSON.stringify(schedule.configuration, null, 2)
    });
    setEditDialogOpen(true);
  };
  
  const handleDeleteSchedule = (id: number) => {
    if (confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleTriggerSchedule = (id: number) => {
    triggerMutation.mutate(id);
  };
  
  const handlePauseSchedule = (id: number) => {
    pauseMutation.mutate(id);
  };
  
  const handleResumeSchedule = (id: number) => {
    resumeMutation.mutate(id);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Schedules</h2>
          <p className="text-muted-foreground">
            Automate your tests by creating recurring schedules.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Test Schedule</DialogTitle>
              <DialogDescription>
                Set up a recurring schedule for automated test execution.
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm 
              templates={templates || []}
              onSubmit={(data) => {
                try {
                  const processedData = {
                    ...data,
                    configuration: data.configuration ? JSON.parse(data.configuration) : {}
                  };
                  addMutation.mutate(processedData);
                } catch (error) {
                  toast({
                    title: "Invalid JSON",
                    description: "Configuration must be valid JSON",
                    variant: "destructive"
                  });
                }
              }}
              isLoading={addMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : schedules && schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule: any) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.name}</TableCell>
                    <TableCell>
                      {schedule.isActive ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </TableCell>
                    <TableCell>{schedule.templateName || '-'}</TableCell>
                    <TableCell>
                      {schedule.frequency === 'CUSTOM' 
                        ? `Custom: ${schedule.customCronExpression}` 
                        : schedule.frequency}
                    </TableCell>
                    <TableCell>
                      {schedule.lastRunTime 
                        ? new Date(schedule.lastRunTime).toLocaleString() 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {schedule.nextRunTime && schedule.isActive
                        ? new Date(schedule.nextRunTime).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleTriggerSchedule(schedule.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          {schedule.isActive ? (
                            <DropdownMenuItem onClick={() => handlePauseSchedule(schedule.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleResumeSchedule(schedule.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditSchedule(schedule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No Schedules</h3>
              <p className="max-w-md mx-auto mb-4">
                Create your first test schedule to automate your tests.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Test Schedule</DialogTitle>
            <DialogDescription>
              Update the test schedule configuration.
            </DialogDescription>
          </DialogHeader>
          {editSchedule && (
            <ScheduleForm 
              templates={templates || []}
              defaultValues={editSchedule}
              onSubmit={(data) => {
                try {
                  const processedData = {
                    ...data,
                    id: editSchedule.id,
                    configuration: data.configuration ? JSON.parse(data.configuration) : {}
                  };
                  updateMutation.mutate(processedData);
                } catch (error) {
                  toast({
                    title: "Invalid JSON",
                    description: "Configuration must be valid JSON",
                    variant: "destructive"
                  });
                }
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Status tab
const StatusTab = () => {
  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/bounce/automation/status'],
    onError: (error) => {
      console.error('Error fetching automation status:', error);
      toast({
        title: 'Error loading status',
        description: error instanceof Error ? error.message : 'Failed to load automation status',
        variant: 'destructive'
      });
    },
    retry: false,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Automation Status</h2>
        <p className="text-muted-foreground">
          Monitor the status of your automated testing system.
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : status ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.activeSchedules}</div>
                <p className="text-xs text-muted-foreground">
                  {status.scheduledTasks} currently in scheduler queue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Next Scheduled Run</CardTitle>
              </CardHeader>
              <CardContent>
                {status.nextRuns && status.nextRuns.length > 0 ? (
                  <>
                    <div className="text-lg font-bold">{status.nextRuns[0].name}</div>
                    <p className="text-xs text-muted-foreground">
                      {status.nextRuns[0].nextRunTime 
                        ? new Date(status.nextRuns[0].nextRunTime).toLocaleString() 
                        : 'Not scheduled'}
                    </p>
                  </>
                ) : (
                  <div className="text-muted-foreground">No scheduled runs</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Test Status</CardTitle>
              </CardHeader>
              <CardContent>
                {status.recentRuns && status.recentRuns.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    {status.recentRuns[0].status === 'COMPLETED' ? (
                      <Check className="text-green-500" />
                    ) : status.recentRuns[0].status === 'RUNNING' ? (
                      <Loader2 className="text-blue-500 animate-spin" />
                    ) : status.recentRuns[0].status === 'FAILED' ? (
                      <XCircle className="text-red-500" />
                    ) : (
                      <AlertCircle className="text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{status.recentRuns[0].name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(status.recentRuns[0].startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No recent tests</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Scheduled Runs</CardTitle>
                <CardDescription>
                  Next tests to be executed by the scheduler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status.nextRuns && status.nextRuns.length > 0 ? (
                  <div className="space-y-4">
                    {status.nextRuns.map((run: any, index: number) => (
                      <div key={run.id || index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{run.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {run.lastRunTime 
                              ? `Last run: ${new Date(run.lastRunTime).toLocaleString()}` 
                              : 'Never run before'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">
                            {run.nextRunTime 
                              ? new Date(run.nextRunTime).toLocaleString() 
                              : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Tests</h3>
                    <p className="max-w-md mx-auto">
                      Create a schedule to see upcoming test runs here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Runs</CardTitle>
                <CardDescription>
                  Latest automated test executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status.recentRuns && status.recentRuns.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {status.recentRuns.map((run: any) => (
                        <div key={run.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{run.name}</div>
                            <StatusBadge status={run.status} />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(run.startedAt).toLocaleString()}
                            </div>
                            <div>
                              {run.completedAt ? (
                                <span>
                                  Duration: {Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s
                                </span>
                              ) : (
                                <span>In progress...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No Recent Tests</h3>
                    <p className="max-w-md mx-auto">
                      Run a test to see results here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <Cog className="h-12 w-12 mx-auto mb-4 opacity-20 animate-spin" />
          <h3 className="text-lg font-medium mb-2">System Initializing</h3>
          <p className="max-w-md mx-auto">
            The automation system is still initializing. Please wait a moment.
          </p>
        </div>
      )}
    </div>
  );
};

// Template Form
const TemplateForm = ({ defaultValues = {}, onSubmit, isLoading }: any) => {
  const form = useForm({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      configuration: '{}',
      ...defaultValues
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Core API Tests" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this test template does..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuration (JSON)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="{}" 
                  className="font-mono h-32"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter configuration as valid JSON
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues.id ? 'Update' : 'Create'} Template
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Schedule Form
const ScheduleForm = ({ templates = [], defaultValues = {}, onSubmit, isLoading }: any) => {
  const form = useForm({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: 'DAILY',
      customCronExpression: '',
      templateId: undefined,
      isActive: true,
      configuration: '{}',
      ...defaultValues
    }
  });
  
  const frequency = form.watch('frequency');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Daily Core Tests" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this schedule..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HOURLY">Hourly</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="CUSTOM">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {frequency === 'CUSTOM' && (
            <FormField
              control={form.control}
              name="customCronExpression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Expression</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 0 9 * * 1-5" {...field} />
                  </FormControl>
                  <FormDescription>
                    <span className="text-xs">Format: minute hour day month weekday</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Template (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : parseInt(value))} 
                defaultValue={field.value !== undefined ? field.value.toString() : 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Use custom configuration)</SelectItem>
                  {templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                If selected, template configuration will be used for test runs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Configuration (JSON)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="{}" 
                  className="font-mono h-32"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter configuration as valid JSON. This will be merged with template configuration if a template is selected.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Start this schedule immediately after creation
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues.id ? 'Update' : 'Create'} Schedule
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Function to create a reusable Pause component
const Pause = (props: any) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.5 3C5.67157 3 5 3.67157 5 4.5V10.5C5 11.3284 5.67157 12 6.5 12C7.32843 12 8 11.3284 8 10.5V4.5C8 3.67157 7.32843 3 6.5 3ZM6.5 4C6.22386 4 6 4.22386 6 4.5V10.5C6 10.7761 6.22386 11 6.5 11C6.77614 11 7 10.7761 7 10.5V4.5C7 4.22386 6.77614 4 6.5 4ZM8.5 3C7.67157 3 7 3.67157 7 4.5V10.5C7 11.3284 7.67157 12 8.5 12C9.32843 12 10 11.3284 10 10.5V4.5C10 3.67157 9.32843 3 8.5 3ZM8.5 4C8.22386 4 8 4.22386 8 4.5V10.5C8 10.7761 8.22386 11 8.5 11C8.77614 11 9 10.7761 9 10.5V4.5C9 4.22386 8.77614 4 8.5 4Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

// Main Automation component
const BounceAutomation = () => {
  return (
    <Tabs defaultValue="templates" className="w-full">
      <div className="border-b">
        <div className="flex items-center justify-between px-4">
          <TabsList className="w-full justify-start rounded-none border-b-0 h-auto">
            <TabsTrigger
              value="templates"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedules
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-3"
            >
              <Activity className="h-4 w-4 mr-2" />
              Status
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <div className="p-4">
        <TabsContent value="templates" className="m-0">
          <TemplatesTab />
        </TabsContent>
        
        <TabsContent value="schedules" className="m-0">
          <SchedulesTab />
        </TabsContent>
        
        <TabsContent value="status" className="m-0">
          <StatusTab />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default BounceAutomation;