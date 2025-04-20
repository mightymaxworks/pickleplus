/**
 * PKL-278651-COMM-0035-EVENT
 * Enhanced Event Templates Manager
 * 
 * This component allows community administrators to create, manage and use
 * event templates for easily scheduling recurring events with consistent settings.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Copy, Edit, Plus, Save, Trash, ClipboardCopy, Check, Loader2 } from "lucide-react";

// Import types
import { CommunityEventType, CommunityEventStatus } from "@/types/community";

// API client hooks
import { communityKeys } from "@/lib/api/community/keys";
import { apiRequest } from "@/lib/queryClient";

// Template schema
const eventTemplateSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters."
  }).max(50, {
    message: "Template name must not exceed 50 characters."
  }),
  description: z.string().max(200, {
    message: "Description must not exceed 200 characters."
  }).optional(),
  eventType: z.nativeEnum(CommunityEventType, {
    errorMap: () => ({ message: "Please select an event type." })
  }),
  durationMinutes: z.number().int().min(15).max(480),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  virtualMeetingUrl: z.string().url({ message: "Please enter a valid URL." }).optional(),
  maxAttendees: z.number().int().positive().optional(),
  minSkillLevel: z.string().optional(),
  maxSkillLevel: z.string().optional(),
  recurringPattern: z.string().optional(),
  isDefault: z.boolean().default(false)
});

type EventTemplate = z.infer<typeof eventTemplateSchema>;

interface EventTemplateManagerProps {
  communityId: number;
}

export function EventTemplateManager({ communityId }: EventTemplateManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Get all templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: communityKeys.eventTemplates(communityId),
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/communities/${communityId}/event-templates`);
      return await response.json();
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: EventTemplate) => {
      const response = await apiRequest("POST", `/api/communities/${communityId}/event-templates`, template);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(communityId) });
      toast({
        title: "Template Created",
        description: "Your event template has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: EventTemplate }) => {
      const response = await apiRequest("PUT", `/api/communities/${communityId}/event-templates/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(communityId) });
      toast({
        title: "Template Updated",
        description: "Your event template has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/communities/${communityId}/event-templates/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(communityId) });
      toast({
        title: "Template Deleted",
        description: "Your event template has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form for creating new template
  const createForm = useForm<EventTemplate>({
    resolver: zodResolver(eventTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      eventType: CommunityEventType.MATCH_PLAY,
      durationMinutes: 120,
      isVirtual: false,
      maxAttendees: 16,
      minSkillLevel: "all",
      maxSkillLevel: "all",
      recurringPattern: "weekly",
      isDefault: false
    }
  });
  
  // Form for editing template
  const editForm = useForm<EventTemplate>({
    resolver: zodResolver(eventTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      eventType: CommunityEventType.MATCH_PLAY,
      durationMinutes: 120,
      isVirtual: false,
      maxAttendees: 16,
      minSkillLevel: "all",
      maxSkillLevel: "all",
      recurringPattern: "weekly",
      isDefault: false
    }
  });
  
  // Update edit form when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      editForm.reset({
        ...selectedTemplate
      });
    }
  }, [selectedTemplate, editForm]);

  // Handle form submission for new template
  const onCreateSubmit = (data: EventTemplate) => {
    createTemplateMutation.mutate(data);
  };

  // Handle form submission for editing template
  const onEditSubmit = (data: EventTemplate) => {
    if (selectedTemplate && 'id' in selectedTemplate) {
      updateTemplateMutation.mutate({ 
        id: (selectedTemplate as any).id, 
        data 
      });
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  // Handle template selection for editing
  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  // Handle copying template info to clipboard
  const handleCopyTemplate = (id: string) => {
    setCopiedTemplateId(id);
    navigator.clipboard.writeText(`Template ID: ${id}`);
    
    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopiedTemplateId(null);
    }, 2000);
    
    toast({
      title: "Template ID Copied",
      description: "Template ID has been copied to clipboard.",
    });
  };

  // Function to use template in event creation
  const useTemplate = (templateId: string) => {
    // This would typically navigate to event creation with template ID
    // For now we'll just show a toast
    toast({
      title: "Using Template",
      description: "This will soon take you to event creation with this template pre-filled.",
    });
  };
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Templates</CardTitle>
          <CardDescription>
            There was a problem loading event templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button 
            className="mt-4" 
            onClick={() => queryClient.invalidateQueries({ queryKey: communityKeys.eventTemplates(communityId) })}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Templates</CardTitle>
          <CardDescription>
            Create and manage templates for recurring events
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create templates to make scheduling recurring events easier.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: any) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.isDefault && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {template.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="text-muted-foreground">Type:</div>
                    <div>{template.eventType}</div>
                    
                    <div className="text-muted-foreground">Duration:</div>
                    <div>{template.durationMinutes} min</div>
                    
                    {template.maxAttendees && (
                      <>
                        <div className="text-muted-foreground">Capacity:</div>
                        <div>{template.maxAttendees} people</div>
                      </>
                    )}
                    
                    <div className="text-muted-foreground">Venue:</div>
                    <div>{template.isVirtual ? "Virtual" : "In-Person"}</div>
                    
                    {template.location && (
                      <>
                        <div className="text-muted-foreground">Location:</div>
                        <div className="truncate">{template.location}</div>
                      </>
                    )}
                    
                    {template.recurringPattern && (
                      <>
                        <div className="text-muted-foreground">Repeats:</div>
                        <div>{template.recurringPattern}</div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-1">
                  <div className="flex gap-1">
                    <Button 
                      onClick={() => handleEditTemplate(template)} 
                      size="sm" 
                      variant="ghost"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTemplate(template.id)} 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleCopyTemplate(template.id)}
                      size="sm"
                      variant="ghost"
                    >
                      {copiedTemplateId === template.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => useTemplate(template.id)}
                      size="sm"
                      variant="secondary"
                    >
                      Use
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Event Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for scheduling recurring events
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly Match Play" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your template a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Regular 2-hour session for all skill levels" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value as CommunityEventType)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CommunityEventType.MATCH_PLAY}>Match Play</SelectItem>
                          <SelectItem value={CommunityEventType.CLINIC}>Clinic</SelectItem>
                          <SelectItem value={CommunityEventType.TOURNAMENT}>Tournament</SelectItem>
                          <SelectItem value={CommunityEventType.SOCIAL}>Social</SelectItem>
                          <SelectItem value={CommunityEventType.WORKSHOP}>Workshop</SelectItem>
                          <SelectItem value={CommunityEventType.LEAGUE}>League</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={15} 
                          max={480} 
                          step={15} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          placeholder="Optional" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Recurrence</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "weekly"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Virtual Event</FormLabel>
                      <FormDescription>
                        Check if this event will be held online
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {createForm.watch("isVirtual") && (
                <FormField
                  control={createForm.control}
                  name="virtualMeetingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://zoom.us/j/example" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {!createForm.watch("isVirtual") && (
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Community Courts, Main St" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="minSkillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="2.0">2.0</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3.0">3.0</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4.0">4.0</SelectItem>
                          <SelectItem value="4.5">4.5</SelectItem>
                          <SelectItem value="5.0">5.0+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="maxSkillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3.0">3.0</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4.0">4.0</SelectItem>
                          <SelectItem value="4.5">4.5</SelectItem>
                          <SelectItem value="5.0">5.0+</SelectItem>
                          <SelectItem value="5.0+">5.0+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Default Template</FormLabel>
                      <FormDescription>
                        Make this your community's default event template
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
            <DialogDescription>
              Make changes to your event template
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly Match Play" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Regular 2-hour session for all skill levels" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value as CommunityEventType)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CommunityEventType.MATCH_PLAY}>Match Play</SelectItem>
                          <SelectItem value={CommunityEventType.CLINIC}>Clinic</SelectItem>
                          <SelectItem value={CommunityEventType.TOURNAMENT}>Tournament</SelectItem>
                          <SelectItem value={CommunityEventType.SOCIAL}>Social</SelectItem>
                          <SelectItem value={CommunityEventType.WORKSHOP}>Workshop</SelectItem>
                          <SelectItem value={CommunityEventType.LEAGUE}>League</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={15} 
                          max={480} 
                          step={15} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Rest of the edit form fields are identical to create form */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          placeholder="Optional" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Recurrence</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "weekly"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Virtual Event</FormLabel>
                      <FormDescription>
                        Check if this event will be held online
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {editForm.watch("isVirtual") && (
                <FormField
                  control={editForm.control}
                  name="virtualMeetingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://zoom.us/j/example" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {!editForm.watch("isVirtual") && (
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Community Courts, Main St" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="minSkillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="2.0">2.0</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3.0">3.0</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4.0">4.0</SelectItem>
                          <SelectItem value="4.5">4.5</SelectItem>
                          <SelectItem value="5.0">5.0+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="maxSkillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3.0">3.0</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4.0">4.0</SelectItem>
                          <SelectItem value="4.5">4.5</SelectItem>
                          <SelectItem value="5.0">5.0+</SelectItem>
                          <SelectItem value="5.0+">5.0+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Default Template</FormLabel>
                      <FormDescription>
                        Make this your community's default event template
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTemplateMutation.isPending}>
                  {updateTemplateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}