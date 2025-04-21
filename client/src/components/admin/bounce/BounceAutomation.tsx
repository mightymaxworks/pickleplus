/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation UI
 * 
 * This component provides the UI for managing automated Bounce tests,
 * including schedules and templates.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckIcon, Clock, Play, Pause, Trash2, Edit, Plus, RefreshCw, Calendar, FileJson, Settings } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, formatDistance } from 'date-fns';

// Define interfaces and enums
export enum SCHEDULE_FREQUENCY {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM'
}

// Template interfaces
interface BounceTestTemplate {
  id: number;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// Schedule interfaces
interface BounceSchedule {
  id: number;
  name: string;
  description?: string;
  frequency: SCHEDULE_FREQUENCY;
  customCronExpression?: string;
  isActive: boolean;
  lastRunTime?: string;
  nextRunTime?: string;
  lastError?: string;
  lastErrorTime?: string;
  templateId?: number;
  templateName?: string;
  configuration: Record<string, any>;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Test run interfaces
interface BounceTestRun {
  id: number;
  name: string;
  description?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  scheduleId?: number;
  templateId?: number;
  configuration: Record<string, any>;
  results?: Record<string, any>;
  finishMessage?: string;
  isAutomated: boolean;
}

interface ScheduleDetailResponse extends BounceSchedule {
  recentRuns: BounceTestRun[];
}

// Status interface
interface AutomationStatus {
  scheduledTasks: number;
  activeSchedules: number;
  nextRuns: Array<{
    id: number;
    name: string;
    nextRunTime?: string;
    lastRunTime?: string;
    lastError?: string;
    lastErrorTime?: string;
  }>;
  recentRuns: Array<{
    id: number;
    name: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    scheduleId?: number;
  }>;
}

// Form validation schemas
const templateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100),
  description: z.string().optional(),
  configuration: z.record(z.any()).default({})
});

const scheduleSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100),
  description: z.string().optional(),
  frequency: z.nativeEnum(SCHEDULE_FREQUENCY),
  customCronExpression: z.string().optional()
    .refine(value => {
      if (!value) return true;
      // Simple cron expression validation
      const parts = value.trim().split(/\s+/);
      return parts.length === 5;
    }, {
      message: "Invalid cron expression. Format: minute hour day-of-month month day-of-week"
    }),
  templateId: z.number().optional(),
  isActive: z.boolean().default(true),
  configuration: z.record(z.any()).optional().default({})
});

// Main component
export function BounceAutomation() {
  const [activeTab, setActiveTab] = useState<string>('templates');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bounce Automation</h1>
          <p className="text-muted-foreground">
            Create and manage automated test schedules and templates
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab />
        </TabsContent>
        
        <TabsContent value="schedules" className="space-y-4">
          <SchedulesTab />
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <StatusTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Templates Tab
function TemplatesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BounceTestTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query templates
  const { 
    data: templates, 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['/api/admin/bounce/templates'],
    select: (data: BounceTestTemplate[]) => data.sort((a, b) => a.name.localeCompare(b.name))
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (template: z.infer<typeof templateSchema>) => 
      apiRequest('/api/admin/bounce/templates', { method: 'POST', data: template }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      toast({
        title: "Template created",
        description: "The template has been created successfully."
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create template",
        description: error.message || "An error occurred while creating the template.",
        variant: "destructive"
      });
    }
  });
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, template }: { id: number, template: z.infer<typeof templateSchema> }) => 
      apiRequest(`/api/admin/bounce/templates/${id}`, { method: 'PUT', data: template }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      toast({
        title: "Template updated",
        description: "The template has been updated successfully."
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update template",
        description: error.message || "An error occurred while updating the template.",
        variant: "destructive"
      });
    }
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/bounce/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/templates'] });
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete template",
        description: error.message || "An error occurred while deleting the template.",
        variant: "destructive"
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (template: BounceTestTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    deleteTemplateMutation.mutate(id);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Render templates table
  const renderTemplatesTable = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading templates...</div>;
    }
    
    if (error) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load templates. Please try again.
        </div>
      );
    }
    
    if (!templates || templates.length === 0) {
      return (
        <div className="text-center py-4">
          No templates found. Create a template to get started.
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>List of test templates</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map(template => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.description || 'N/A'}</TableCell>
              <TableCell>{formatDate(template.createdAt)}</TableCell>
              <TableCell>{formatDate(template.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the template "{template.name}".
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteClick(template.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Test Templates</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </Button>
      </div>
      
      {renderTemplatesTable()}
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable test template that can be applied to schedules.
            </DialogDescription>
          </DialogHeader>
          
          <TemplateForm 
            onSubmit={(data) => createTemplateMutation.mutate(data)} 
            isSubmitting={createTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <TemplateForm 
              initialValues={{
                name: selectedTemplate.name,
                description: selectedTemplate.description || '',
                configuration: selectedTemplate.configuration || {}
              }}
              onSubmit={(data) => updateTemplateMutation.mutate({ 
                id: selectedTemplate.id, 
                template: data 
              })} 
              isSubmitting={updateTemplateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Form
interface TemplateFormProps {
  initialValues?: {
    name: string;
    description: string;
    configuration: Record<string, any>;
  };
  onSubmit: (data: z.infer<typeof templateSchema>) => void;
  isSubmitting: boolean;
}

function TemplateForm({ initialValues, onSubmit, isSubmitting }: TemplateFormProps) {
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialValues || {
      name: '',
      description: '',
      configuration: {
        pages: ['home', 'login', 'dashboard'],
        actions: ['click', 'navigate', 'input'],
        checkElements: true,
        checkPerformance: false,
        timeoutMs: 30000
      }
    }
  });
  
  const [configJson, setConfigJson] = useState<string>('');
  
  // Initialize config JSON
  useEffect(() => {
    if (form.getValues('configuration')) {
      setConfigJson(JSON.stringify(form.getValues('configuration'), null, 2));
    }
  }, [form]);
  
  // Update configuration when JSON changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigJson(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      form.setValue('configuration', parsed);
    } catch (err) {
      // Invalid JSON, don't update the form value
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Template name" {...field} />
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
                  placeholder="Describe what this template tests"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Configuration (JSON)</FormLabel>
          <Textarea
            value={configJson}
            onChange={handleConfigChange}
            placeholder="{ }"
            className="font-mono text-sm"
            rows={10}
          />
          <FormDescription>
            Define the test configuration in JSON format.
          </FormDescription>
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {initialValues ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Schedules Tab
function SchedulesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<BounceSchedule | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query schedules
  const { 
    data: schedules, 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['/api/admin/bounce/schedules'],
    select: (data: BounceSchedule[]) => data.sort((a, b) => a.name.localeCompare(b.name))
  });
  
  // Query templates for select dropdown
  const { data: templates } = useQuery({ 
    queryKey: ['/api/admin/bounce/templates'],
    select: (data: BounceTestTemplate[]) => data.sort((a, b) => a.name.localeCompare(b.name))
  });
  
  // Query schedule details
  const { 
    data: scheduleDetail, 
    isLoading: isDetailLoading
  } = useQuery({ 
    queryKey: ['/api/admin/bounce/schedules', selectedScheduleId],
    queryFn: () => apiRequest(`/api/admin/bounce/schedules/${selectedScheduleId}`),
    enabled: !!selectedScheduleId
  });
  
  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (schedule: z.infer<typeof scheduleSchema>) => 
      apiRequest('/api/admin/bounce/schedules', { method: 'POST', data: schedule }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: "Schedule created",
        description: "The schedule has been created successfully."
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create schedule",
        description: error.message || "An error occurred while creating the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, schedule }: { id: number, schedule: z.infer<typeof scheduleSchema> }) => 
      apiRequest(`/api/admin/bounce/schedules/${id}`, { method: 'PUT', data: schedule }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully."
      });
      setIsEditDialogOpen(false);
      setSelectedSchedule(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update schedule",
        description: error.message || "An error occurred while updating the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/bounce/schedules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete schedule",
        description: error.message || "An error occurred while deleting the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Trigger schedule now mutation
  const triggerScheduleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/bounce/schedules/${id}/trigger`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/automation/status'] });
      toast({
        title: "Schedule triggered",
        description: "The schedule has been triggered successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to trigger schedule",
        description: error.message || "An error occurred while triggering the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Pause schedule mutation
  const pauseScheduleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/bounce/schedules/${id}/pause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: "Schedule paused",
        description: "The schedule has been paused successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to pause schedule",
        description: error.message || "An error occurred while pausing the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Resume schedule mutation
  const resumeScheduleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/bounce/schedules/${id}/resume`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/schedules'] });
      toast({
        title: "Schedule resumed",
        description: "The schedule has been resumed successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resume schedule",
        description: error.message || "An error occurred while resuming the schedule.",
        variant: "destructive"
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (schedule: BounceSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditDialogOpen(true);
  };
  
  // Handle detail button click
  const handleDetailClick = (id: number) => {
    setSelectedScheduleId(id);
    setIsDetailDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    deleteScheduleMutation.mutate(id);
  };
  
  // Handle trigger button click
  const handleTriggerClick = (id: number) => {
    triggerScheduleMutation.mutate(id);
  };
  
  // Handle pause/resume button click
  const handlePauseResumeClick = (schedule: BounceSchedule) => {
    if (schedule.isActive) {
      pauseScheduleMutation.mutate(schedule.id);
    } else {
      resumeScheduleMutation.mutate(schedule.id);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format relative date
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format frequency
  const formatFrequency = (frequency: SCHEDULE_FREQUENCY, customCron?: string) => {
    if (frequency === SCHEDULE_FREQUENCY.CUSTOM && customCron) {
      return `Custom (${customCron})`;
    }
    
    return frequency.toLowerCase().replace('_', ' ');
  };
  
  // Render schedules table
  const renderSchedulesTable = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading schedules...</div>;
    }
    
    if (error) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load schedules. Please try again.
        </div>
      );
    }
    
    if (!schedules || schedules.length === 0) {
      return (
        <div className="text-center py-4">
          No schedules found. Create a schedule to get started.
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>List of test schedules</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map(schedule => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium"
                  onClick={() => handleDetailClick(schedule.id)}
                >
                  {schedule.name}
                </Button>
              </TableCell>
              <TableCell>{schedule.templateName || 'None'}</TableCell>
              <TableCell>{formatFrequency(schedule.frequency, schedule.customCronExpression)}</TableCell>
              <TableCell>
                {schedule.nextRunTime 
                  ? formatRelativeDate(schedule.nextRunTime) 
                  : 'Not scheduled'}
              </TableCell>
              <TableCell>
                {schedule.isActive ? (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline">Paused</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTriggerClick(schedule.id)}
                    disabled={!schedule.isActive}
                    title={schedule.isActive ? "Run now" : "Schedule is paused"}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={schedule.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePauseResumeClick(schedule)}
                  >
                    {schedule.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the schedule "{schedule.name}".
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteClick(schedule.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Test Schedules</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Schedule
        </Button>
      </div>
      
      {renderSchedulesTable()}
      
      {/* Create Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Create a schedule for automated test runs.
            </DialogDescription>
          </DialogHeader>
          
          <ScheduleForm 
            onSubmit={(data) => createScheduleMutation.mutate(data)} 
            isSubmitting={createScheduleMutation.isPending}
            templates={templates || []}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSchedule && (
            <ScheduleForm 
              initialValues={{
                name: selectedSchedule.name,
                description: selectedSchedule.description || '',
                frequency: selectedSchedule.frequency,
                customCronExpression: selectedSchedule.customCronExpression || '',
                templateId: selectedSchedule.templateId,
                isActive: selectedSchedule.isActive,
                configuration: selectedSchedule.configuration || {}
              }}
              onSubmit={(data) => updateScheduleMutation.mutate({ 
                id: selectedSchedule.id, 
                schedule: data 
              })}
              isSubmitting={updateScheduleMutation.isPending}
              templates={templates || []}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Schedule Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Schedule Details</DialogTitle>
            <DialogDescription>
              View detailed information about this schedule.
            </DialogDescription>
          </DialogHeader>
          
          {isDetailLoading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : scheduleDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Schedule Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {scheduleDetail.name}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {scheduleDetail.description || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {formatFrequency(scheduleDetail.frequency, scheduleDetail.customCronExpression)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      {scheduleDetail.isActive ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Template:</span> {scheduleDetail.templateName || 'None'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Execution Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Last Run:</span> {formatDate(scheduleDetail.lastRunTime)}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span> {formatDate(scheduleDetail.nextRunTime)}
                    </div>
                    {scheduleDetail.lastError && (
                      <div>
                        <span className="font-medium">Last Error:</span>{' '}
                        <span className="text-red-500">{scheduleDetail.lastError}</span>
                        {scheduleDetail.lastErrorTime && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({formatRelativeDate(scheduleDetail.lastErrorTime)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Recent Test Runs</h3>
                {scheduleDetail.recentRuns && scheduleDetail.recentRuns.length > 0 ? (
                  <ScrollArea className="h-48">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleDetail.recentRuns.map(run => (
                          <TableRow key={run.id}>
                            <TableCell>{run.id}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  run.status === 'COMPLETED' ? 'default' :
                                  run.status === 'FAILED' ? 'destructive' :
                                  run.status === 'RUNNING' ? 'outline' : 'secondary'
                                }
                              >
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(run.startedAt)}</TableCell>
                            <TableCell>{run.completedAt ? formatDate(run.completedAt) : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent test runs for this schedule.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (scheduleDetail) {
                      handleEditClick(scheduleDetail);
                      setIsDetailDialogOpen(false);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Schedule
                </Button>
                <Button
                  onClick={() => {
                    if (scheduleDetail) {
                      handleTriggerClick(scheduleDetail.id);
                    }
                  }}
                  disabled={!scheduleDetail.isActive}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-red-500">
              Failed to load schedule details. Please try again.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Schedule Form
interface ScheduleFormProps {
  initialValues?: {
    name: string;
    description: string;
    frequency: SCHEDULE_FREQUENCY;
    customCronExpression: string;
    templateId?: number;
    isActive: boolean;
    configuration: Record<string, any>;
  };
  onSubmit: (data: z.infer<typeof scheduleSchema>) => void;
  isSubmitting: boolean;
  templates: BounceTestTemplate[];
}

function ScheduleForm({ initialValues, onSubmit, isSubmitting, templates }: ScheduleFormProps) {
  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: initialValues || {
      name: '',
      description: '',
      frequency: SCHEDULE_FREQUENCY.DAILY,
      customCronExpression: '',
      templateId: undefined,
      isActive: true,
      configuration: {}
    }
  });
  
  const frequency = form.watch('frequency');
  const showCustomCron = frequency === SCHEDULE_FREQUENCY.CUSTOM;
  
  const [configJson, setConfigJson] = useState<string>('');
  
  // Initialize config JSON
  useEffect(() => {
    if (form.getValues('configuration')) {
      setConfigJson(JSON.stringify(form.getValues('configuration'), null, 2));
    }
  }, [form]);
  
  // Update configuration when JSON changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigJson(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      form.setValue('configuration', parsed);
    } catch (err) {
      // Invalid JSON, don't update the form value
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Schedule name" {...field} />
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
                  placeholder="Describe this schedule's purpose"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SCHEDULE_FREQUENCY.HOURLY}>Hourly</SelectItem>
                  <SelectItem value={SCHEDULE_FREQUENCY.DAILY}>Daily</SelectItem>
                  <SelectItem value={SCHEDULE_FREQUENCY.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={SCHEDULE_FREQUENCY.MONTHLY}>Monthly</SelectItem>
                  <SelectItem value={SCHEDULE_FREQUENCY.QUARTERLY}>Quarterly</SelectItem>
                  <SelectItem value={SCHEDULE_FREQUENCY.CUSTOM}>Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often the tests should run
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showCustomCron && (
          <FormField
            control={form.control}
            name="customCronExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Cron Expression</FormLabel>
                <FormControl>
                  <Input placeholder="0 0 * * *" {...field} />
                </FormControl>
                <FormDescription>
                  Format: minute hour day-of-month month day-of-week (e.g., "0 0 * * *" for daily at midnight)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                defaultValue={field.value?.toString()}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional template to use for this schedule
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
                  Whether this schedule should run automatically
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
        
        <div className="space-y-2">
          <FormLabel>Configuration Override (JSON)</FormLabel>
          <Textarea
            value={configJson}
            onChange={handleConfigChange}
            placeholder="{ }"
            className="font-mono text-sm"
            rows={5}
          />
          <FormDescription>
            Optional: Override template configuration with custom settings
          </FormDescription>
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {initialValues ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Status Tab
function StatusTab() {
  const { toast } = useToast();
  
  // Query automation status
  const { 
    data: status, 
    isLoading, 
    error,
    refetch
  } = useQuery({ 
    queryKey: ['/api/admin/bounce/automation/status'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format relative date
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Failed to load automation status</h3>
        <p className="text-muted-foreground mb-4">An error occurred while loading the status information.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }
  
  if (!status) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No status information available</h3>
        <p className="text-muted-foreground mb-4">Status information could not be loaded.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Status</h2>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.activeSchedules}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.scheduledTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.recentRuns.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Runs
            </CardTitle>
            <CardDescription>
              Next scheduled test runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status.nextRuns && status.nextRuns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Next Run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status.nextRuns.map(run => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.name}</TableCell>
                      <TableCell>
                        {run.nextRunTime 
                          ? formatRelativeDate(run.nextRunTime)
                          : 'Not scheduled'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming test runs scheduled.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Test Runs
            </CardTitle>
            <CardDescription>
              Recent automated test executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status.recentRuns && status.recentRuns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status.recentRuns.map(run => (
                    <TableRow key={run.id}>
                      <TableCell>{run.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.status === 'COMPLETED' ? 'default' :
                            run.status === 'FAILED' ? 'destructive' :
                            run.status === 'RUNNING' ? 'outline' : 'secondary'
                          }
                        >
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatRelativeDate(run.startedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent test runs found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}