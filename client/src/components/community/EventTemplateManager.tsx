/**
 * PKL-278651-COMM-0035-EVENT
 * Event Template Manager
 * 
 * This component allows community administrators to create and manage event templates.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarClock,
  Clock,
  Copy,
  ListChecks,
  MoreHorizontal,
  PencilLine,
  Plus,
  Save,
  Star,
  Trash,
  Users,
} from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom hooks
import { useEventTemplates, EventTemplate, useCreateEventTemplate, useUpdateEventTemplate, useDeleteEventTemplate } from "@/lib/hooks/useEventTemplates";
import { communityKeys } from "@/lib/api/community/keys";

// Validation schema for event template form
const templateFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  eventType: z.string(),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes"),
  location: z.string().max(100, "Location must not exceed 100 characters").optional(),
  isVirtual: z.boolean().default(false),
  virtualMeetingUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  maxAttendees: z.number().positive("Must be a positive number").optional().nullable(),
  minSkillLevel: z.string().optional(),
  maxSkillLevel: z.string().optional(),
  recurringPattern: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface EventTemplateManagerProps {
  communityId: number;
}

export default function EventTemplateManager({ communityId }: EventTemplateManagerProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  
  // Fetch templates for this community
  const { data: templates, isLoading, isError } = useEventTemplates(communityId);
  
  // Mutations for managing templates
  const createTemplate = useCreateEventTemplate();
  const updateTemplate = useUpdateEventTemplate();
  const deleteTemplate = useDeleteEventTemplate();
  
  // Default form values
  const defaultValues: Partial<TemplateFormValues> = {
    name: "",
    description: "",
    eventType: "match_play",
    durationMinutes: 60,
    location: "",
    isVirtual: false,
    virtualMeetingUrl: null,
    maxAttendees: null,
    minSkillLevel: "all",
    maxSkillLevel: "all",
    recurringPattern: "",
    isDefault: false,
  };
  
  // Create form
  const createForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });
  
  // Edit form
  const editForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });
  
  // Reset forms when dialogs close
  const handleCreateDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      createForm.reset(defaultValues);
    }
    setIsCreateDialogOpen(isOpen);
  };
  
  const handleEditDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      editForm.reset(defaultValues);
    }
    setIsEditDialogOpen(isOpen);
  };
  
  // Handle create submission
  const onCreateSubmit = async (data: TemplateFormValues) => {
    try {
      await createTemplate.mutateAsync({
        communityId,
        data: {
          ...data,
          communityId,
          createdByUserId: 0, // This will be set by the server
        },
      });
      
      toast({
        title: "Template Created",
        description: "The event template was created successfully",
        variant: "default",
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit submission
  const onEditSubmit = async (data: TemplateFormValues) => {
    if (!selectedTemplate) return;
    
    try {
      await updateTemplate.mutateAsync({
        communityId,
        templateId: selectedTemplate.id.toString(),
        data: {
          ...data,
          communityId,
        },
      });
      
      toast({
        title: "Template Updated",
        description: "The event template was updated successfully",
        variant: "default",
      });
      
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle template deletion
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await deleteTemplate.mutateAsync({
        communityId,
        templateId: selectedTemplate.id.toString(),
      });
      
      toast({
        title: "Template Deleted",
        description: "The event template was deleted successfully",
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Open edit dialog with selected template data
  const handleEditTemplate = (template: EventTemplate) => {
    setSelectedTemplate(template);
    
    // Populate form with template data
    editForm.reset({
      name: template.name,
      description: template.description || "",
      eventType: template.eventType,
      durationMinutes: template.durationMinutes,
      location: template.location || "",
      isVirtual: template.isVirtual,
      virtualMeetingUrl: template.virtualMeetingUrl || null,
      maxAttendees: template.maxAttendees || null,
      minSkillLevel: template.minSkillLevel || "all",
      maxSkillLevel: template.maxSkillLevel || "all",
      recurringPattern: template.recurringPattern || "",
      isDefault: template.isDefault,
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleConfirmDelete = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load event templates. Please try again later.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
  
  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours + (hours === 1 ? " hour" : " hours") + (mins > 0 ? ` ${mins} min` : "");
  };
  
  // Helper function to format event type for display
  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Event Templates</h2>
          <p className="text-muted-foreground">
            Create reusable templates for recurring events in your community
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for recurring events in your community
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Template Name */}
                  <div className="md:col-span-2">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Weekly Match Play" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your template a clear descriptive name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Event Type */}
                  <FormField
                    control={createForm.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="match_play">Match Play</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                            <SelectItem value="tournament">Tournament</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="league">League</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Duration Minutes */}
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
                            step={15}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          How long the event will last in minutes (e.g., 60, 90, 120)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Location */}
                  <div className="md:col-span-2">
                    <FormField
                      control={createForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Courts, 123 Main St." {...field} />
                          </FormControl>
                          <FormDescription>
                            Where the event will take place (leave empty for virtual events)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Is Virtual */}
                  <FormField
                    control={createForm.control}
                    name="isVirtual"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Virtual Event</FormLabel>
                          <FormDescription>
                            Will this event be held virtually?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Max Attendees */}
                  <FormField
                    control={createForm.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Attendees</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Optional"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value, 10) : null;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of people who can attend (leave empty for no limit)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Virtual Meeting URL - Conditionally shown */}
                  {createForm.watch("isVirtual") && (
                    <div className="md:col-span-2">
                      <FormField
                        control={createForm.control}
                        name="virtualMeetingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Virtual Meeting URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., https://zoom.us/j/123456789"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Link to the virtual meeting (Zoom, Teams, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter event description..."
                              className="min-h-32"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about the event, what to bring, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Recurring Pattern */}
                  <FormField
                    control={createForm.control}
                    name="recurringPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurring Pattern</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None (One-time event)</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often this event repeats
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Is Default */}
                  <FormField
                    control={createForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Default Template</FormLabel>
                          <FormDescription>
                            Set as the default template for new events
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* List of existing templates */}
      {templates && templates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="truncate">{template.name}</CardTitle>
                    <CardDescription>
                      {formatEventType(template.eventType)}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                        <PencilLine className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleConfirmDelete(template)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {template.isDefault && (
                  <Badge className="absolute top-4 right-12" variant="default">
                    <Star className="mr-1 h-3 w-3" /> Default
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Clock className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{formatDuration(template.durationMinutes)}</span>
                  </div>
                  
                  {template.location && (
                    <div className="flex items-start">
                      <CalendarClock className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{template.location}</span>
                    </div>
                  )}
                  
                  {template.maxAttendees && (
                    <div className="flex items-start">
                      <Users className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>Max {template.maxAttendees} attendees</span>
                    </div>
                  )}
                  
                  {template.recurringPattern && (
                    <div className="flex items-start">
                      <ListChecks className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="capitalize">{template.recurringPattern}</span>
                    </div>
                  )}
                </div>
                
                {template.description && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {template.description}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-muted/40 border rounded-lg p-10 text-center">
          <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first event template to make scheduling recurring events easier.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Template
          </Button>
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
            <DialogDescription>
              Update the details of your event template
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Template Name */}
                <div className="md:col-span-2">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekly Match Play" {...field} />
                        </FormControl>
                        <FormDescription>
                          Give your template a clear descriptive name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Event Type */}
                <FormField
                  control={editForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="match_play">Match Play</SelectItem>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="league">League</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Duration Minutes */}
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
                          step={15}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormDescription>
                        How long the event will last in minutes (e.g., 60, 90, 120)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Location */}
                <div className="md:col-span-2">
                  <FormField
                    control={editForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Courts, 123 Main St." {...field} />
                        </FormControl>
                        <FormDescription>
                          Where the event will take place (leave empty for virtual events)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Is Virtual */}
                <FormField
                  control={editForm.control}
                  name="isVirtual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Virtual Event</FormLabel>
                        <FormDescription>
                          Will this event be held virtually?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Max Attendees */}
                <FormField
                  control={editForm.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Optional"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value, 10) : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of people who can attend (leave empty for no limit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Virtual Meeting URL - Conditionally shown */}
                {editForm.watch("isVirtual") && (
                  <div className="md:col-span-2">
                    <FormField
                      control={editForm.control}
                      name="virtualMeetingUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Virtual Meeting URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., https://zoom.us/j/123456789"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Link to the virtual meeting (Zoom, Teams, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Description */}
                <div className="md:col-span-2">
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter event description..."
                            className="min-h-32"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about the event, what to bring, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Recurring Pattern */}
                <FormField
                  control={editForm.control}
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring Pattern</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None (One-time event)</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often this event repeats
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Is Default */}
                <FormField
                  control={editForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Default Template</FormLabel>
                        <FormDescription>
                          Set as the default template for new events
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTemplate.isPending}>
                  {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="py-4">
              <p className="font-medium">{selectedTemplate.name}</p>
              <p className="text-sm text-muted-foreground">{formatEventType(selectedTemplate.eventType)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteTemplate} 
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? 'Deleting...' : 'Delete Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}