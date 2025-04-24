/**
 * PKL-278651-SAGE-0003-JOURNAL
 * SAGE Journaling System Component
 * 
 * This component implements the journaling interface for the SAGE coaching system.
 * It allows users to create, view, and manage journal entries with intelligent reflections.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  BookText, 
  PenLine, 
  Brain, 
  Plus, 
  Trash2, 
  Edit,
  Archive,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ListFilter,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Target,
  Heart,
  Zap,
  Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Journal Entry Types
interface JournalEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood: 'excellent' | 'good' | 'neutral' | 'low' | 'poor';
  entryType: 'free_form' | 'guided' | 'reflection' | 'training_log';
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  dimensionCode?: string;
  tags?: string[];
  sessionId?: number;
  matchId?: number;
  reflections?: JournalReflection[];
}

interface JournalReflection {
  id: number;
  entryId: number;
  content: string;
  insightType: string;
  isRead: boolean;
  createdAt: string;
  userFeedback?: 'helpful' | 'not_helpful';
}

interface JournalPrompt {
  id: number;
  content: string;
  promptType: string;
  skillLevel: string;
  dimensionCode: string;
  isActive: boolean;
}

// Form data for creating an entry
interface EntryFormData {
  title: string;
  content: string;
  mood: 'excellent' | 'good' | 'neutral' | 'low' | 'poor';
  entryType: 'free_form' | 'guided' | 'reflection' | 'training_log';
  isPrivate: boolean;
  dimensionCode?: string;
  tags?: string[];
  sessionId?: number;
  matchId?: number;
}

export default function SageJournalPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryFormData, setEntryFormData] = useState<EntryFormData>({
    title: '',
    content: '',
    mood: 'neutral',
    entryType: 'free_form',
    isPrivate: false
  });
  const [filterDimension, setFilterDimension] = useState<string>("all_dimensions");
  const [filterEntryType, setFilterEntryType] = useState<string>("all_types");
  const [journalPrompt, setJournalPrompt] = useState<JournalPrompt | null>(null);
  
  // Fetch journal entries
  const { 
    data: entries = [], 
    isLoading: isLoadingEntries,
    refetch: refetchEntries 
  } = useQuery({
    queryKey: ["/api/coach/journal/entries"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });
  
  // Fetch entry details when an entry is selected
  const { 
    data: activeEntry, 
    isLoading: isLoadingActiveEntry,
    refetch: refetchActiveEntry
  } = useQuery({
    queryKey: activeEntryId ? [`/api/coach/journal/entries/${activeEntryId}`] : ["inactive-entry"],
    queryFn: getQueryFn(),
    enabled: !!activeEntryId,
  });
  
  // Create a new journal entry
  const createEntryMutation = useMutation({
    mutationFn: async (formData: EntryFormData) => {
      const response = await apiRequest("POST", "/api/coach/journal/entries", formData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create journal entry");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Reset form and close dialog
      setEntryFormData({
        title: '',
        content: '',
        mood: 'neutral',
        entryType: 'free_form',
        isPrivate: false
      });
      setShowEntryForm(false);
      setJournalPrompt(null);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/coach/journal/entries"] });
      
      // Show success toast
      toast({
        title: "Journal Entry Created",
        description: "Your journal entry has been saved and a reflection has been generated.",
      });
      
      // Set the new entry as active
      setActiveEntryId(data.id);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating journal entry",
        description: error.message,
      });
    }
  });
  
  // Update an existing journal entry
  const updateEntryMutation = useMutation({
    mutationFn: async ({ entryId, formData }: { entryId: number, formData: Partial<EntryFormData> }) => {
      const response = await apiRequest("PUT", `/api/coach/journal/entries/${entryId}`, formData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update journal entry");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Reset form and close dialog
      setEntryFormData({
        title: '',
        content: '',
        mood: 'neutral',
        entryType: 'free_form',
        isPrivate: false
      });
      setShowEntryForm(false);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/coach/journal/entries"] });
      queryClient.invalidateQueries({ queryKey: [`/api/coach/journal/entries/${data.id}`] });
      
      // Show success toast
      toast({
        title: "Journal Entry Updated",
        description: "Your journal entry has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating journal entry",
        description: error.message,
      });
    }
  });
  
  // Delete a journal entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest("DELETE", `/api/coach/journal/entries/${entryId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete journal entry");
      }
      
      return { success: true, entryId };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/coach/journal/entries"] });
      
      // Reset active entry if the deleted one was active
      if (activeEntryId === data.entryId) {
        setActiveEntryId(null);
      }
      
      // Show success toast
      toast({
        title: "Journal Entry Deleted",
        description: "Your journal entry has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error deleting journal entry",
        description: error.message,
      });
    }
  });
  
  // Save reflection feedback
  const saveReflectionFeedbackMutation = useMutation({
    mutationFn: async ({ reflectionId, feedback }: { reflectionId: number, feedback: 'helpful' | 'not_helpful' }) => {
      const response = await apiRequest("POST", `/api/coach/journal/reflections/${reflectionId}/feedback`, { feedback });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save feedback");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh the active entry to get updated reflection data
      if (activeEntryId) {
        queryClient.invalidateQueries({ queryKey: [`/api/coach/journal/entries/${activeEntryId}`] });
        refetchActiveEntry();
      }
      
      // Show success toast
      toast({
        title: "Feedback Saved",
        description: "Thank you for your feedback on this reflection.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error saving feedback",
        description: error.message,
      });
    }
  });
  
  // Get a random journal prompt
  const getRandomPromptMutation = useMutation({
    mutationFn: async (filters: { dimension?: string, type?: string, level?: string }) => {
      let url = "/api/coach/journal/prompts/random";
      const queryParams = new URLSearchParams();
      
      if (filters.dimension) {
        queryParams.append("dimension", filters.dimension);
      }
      
      if (filters.type) {
        queryParams.append("type", filters.type);
      }
      
      if (filters.level) {
        queryParams.append("level", filters.level);
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await apiRequest("GET", url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get random prompt");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set the prompt and update form entry type
      setJournalPrompt(data);
      setEntryFormData(prev => ({
        ...prev,
        entryType: 'guided',
        dimensionCode: data.dimensionCode
      }));
      
      // Show success toast
      toast({
        title: "Journal Prompt Generated",
        description: "A new journal prompt has been generated for your reflection.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error getting prompt",
        description: error.message,
      });
    }
  });
  
  // Handle form submission
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryFormData.title.trim() || !entryFormData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please provide both a title and content for your journal entry.",
      });
      return;
    }
    
    // If we're editing an existing entry
    if (activeEntryId && showEntryForm) {
      updateEntryMutation.mutate({ entryId: activeEntryId, formData: entryFormData });
    } else {
      // We're creating a new entry
      createEntryMutation.mutate(entryFormData);
    }
  };
  
  // Handle edit button click
  const handleEditEntry = (entry: JournalEntry) => {
    setEntryFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood as any,
      entryType: entry.entryType as any,
      isPrivate: entry.isPrivate,
      dimensionCode: entry.dimensionCode,
      tags: entry.tags,
      sessionId: entry.sessionId,
      matchId: entry.matchId
    });
    setActiveEntryId(entry.id);
    setShowEntryForm(true);
  };
  
  // Filter entries based on selected filters
  // Ensure entries is always treated as an array even if it's undefined
  const filteredEntries = Array.isArray(entries) ? entries.filter((entry: JournalEntry) => {
    if (filterDimension && filterDimension !== "all_dimensions" && entry.dimensionCode !== filterDimension) {
      return false;
    }
    
    if (filterEntryType && filterEntryType !== "all_types" && entry.entryType !== filterEntryType) {
      return false;
    }
    
    return true;
  }) : [];
  
  // Function to get dimension icon
  const getDimensionIcon = (code?: string) => {
    switch (code) {
      case 'TECH':
        return <Target className="h-4 w-4" />;
      case 'TACT':
        return <Brain className="h-4 w-4" />;
      case 'PHYS':
        return <Dumbbell className="h-4 w-4" />;
      case 'MENT':
        return <Zap className="h-4 w-4" />;
      case 'CONS':
        return <Repeat className="h-4 w-4" />;
      default:
        return <PenLine className="h-4 w-4" />;
    }
  };
  
  // Function to get mood description
  const getMoodDescription = (mood: string) => {
    switch (mood) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'neutral':
        return 'Neutral';
      case 'low':
        return 'Low';
      case 'poor':
        return 'Poor';
      default:
        return 'Unknown';
    }
  };
  
  // Function to get entry type label
  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'free_form':
        return 'Free-form Entry';
      case 'guided':
        return 'Guided Reflection';
      case 'reflection':
        return 'Post-Match Reflection';
      case 'training_log':
        return 'Training Log';
      default:
        return 'Journal Entry';
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Entry List */}
      <div className="md:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Journal Entries</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => {
                        setActiveEntryId(null);
                        setEntryFormData({
                          title: '',
                          content: '',
                          mood: 'neutral',
                          entryType: 'free_form',
                          isPrivate: false
                        });
                        setShowEntryForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create New Entry</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col space-y-2 mt-2">
              <div className="flex space-x-2">
                <Select value={filterDimension} onValueChange={setFilterDimension}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_dimensions">All Dimensions</SelectItem>
                    <SelectItem value="TECH">Technical Skills</SelectItem>
                    <SelectItem value="TACT">Tactical Awareness</SelectItem>
                    <SelectItem value="PHYS">Physical Fitness</SelectItem>
                    <SelectItem value="MENT">Mental Toughness</SelectItem>
                    <SelectItem value="CONS">Consistency</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterEntryType} onValueChange={setFilterEntryType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    <SelectItem value="free_form">Free-form</SelectItem>
                    <SelectItem value="guided">Guided</SelectItem>
                    <SelectItem value="reflection">Reflection</SelectItem>
                    <SelectItem value="training_log">Training Log</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(70vh-12rem)]">
              {isLoadingEntries ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center p-6">
                  <BookText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium">No journal entries found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {filterDimension || filterEntryType 
                      ? "Try adjusting your filters or create a new entry."
                      : "Start your journaling practice by creating your first entry."}
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        setActiveEntryId(null);
                        setEntryFormData({
                          title: '',
                          content: '',
                          mood: 'neutral',
                          entryType: 'free_form',
                          isPrivate: false
                        });
                        setShowEntryForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Journal Entry
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEntries.map((entry: JournalEntry) => (
                    <Card 
                      key={entry.id} 
                      className={`cursor-pointer hover:bg-accent/50 ${activeEntryId === entry.id ? 'border-primary bg-accent/50' : ''}`}
                      onClick={() => setActiveEntryId(entry.id)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm flex items-center space-x-2 mb-1">
                              {getDimensionIcon(entry.dimensionCode)}
                              <span>{entry.title}</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                          
                          <Badge 
                            variant={entry.entryType === 'guided' ? 'outline' : 'secondary'}
                            className="text-xs"
                          >
                            {entry.entryType === 'free_form' && 'Free'}
                            {entry.entryType === 'guided' && 'Guided'}
                            {entry.entryType === 'reflection' && 'Reflect'}
                            {entry.entryType === 'training_log' && 'Training'}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Entry Detail or Entry Form */}
      <div className="md:col-span-2">
        {showEntryForm ? (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                {activeEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}
              </CardTitle>
              <div className="flex justify-between">
                <CardDescription>
                  {journalPrompt ? 'Guided Reflection' : 'Express your thoughts, reflections and progress'}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => getRandomPromptMutation.mutate({
                    dimension: filterDimension === "all_dimensions" ? undefined : filterDimension
                  })}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Get Prompt
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-auto">
              <form onSubmit={handleSubmitEntry} className="space-y-4">
                {journalPrompt && (
                  <Card className="bg-primary/5 mb-4">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm">Journal Prompt</CardTitle>
                        <Badge variant="outline">{journalPrompt.dimensionCode}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm">{journalPrompt.content}</p>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Entry title"
                    value={entryFormData.title}
                    onChange={(e) => setEntryFormData({ ...entryFormData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Journal Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Write your journal entry here..."
                    value={entryFormData.content}
                    onChange={(e) => setEntryFormData({ ...entryFormData, content: e.target.value })}
                    rows={10}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="mood" className="text-sm font-medium">
                      Current Mood
                    </label>
                    <Select 
                      value={entryFormData.mood} 
                      onValueChange={(value: any) => setEntryFormData({ ...entryFormData, mood: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="dimensionCode" className="text-sm font-medium">
                      Dimension Focus (Optional)
                    </label>
                    <Select 
                      value={entryFormData.dimensionCode || "none"} 
                      onValueChange={(value) => setEntryFormData({ ...entryFormData, dimensionCode: value === "none" ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dimension" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="TECH">Technical Skills</SelectItem>
                        <SelectItem value="TACT">Tactical Awareness</SelectItem>
                        <SelectItem value="PHYS">Physical Fitness</SelectItem>
                        <SelectItem value="MENT">Mental Toughness</SelectItem>
                        <SelectItem value="CONS">Consistency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="entryType" className="text-sm font-medium">
                      Entry Type
                    </label>
                    <Select 
                      value={entryFormData.entryType} 
                      onValueChange={(value: any) => setEntryFormData({ ...entryFormData, entryType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free_form">Free-form Entry</SelectItem>
                        <SelectItem value="guided">Guided Reflection</SelectItem>
                        <SelectItem value="reflection">Post-Match Reflection</SelectItem>
                        <SelectItem value="training_log">Training Log</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Privacy</label>
                    <Select 
                      value={entryFormData.isPrivate ? "private" : "public"} 
                      onValueChange={(value) => setEntryFormData({ ...entryFormData, isPrivate: value === "private" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private (Only You)</SelectItem>
                        <SelectItem value="public">Public (Coach Can View)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEntryForm(false);
                  setJournalPrompt(null);
                }}
              >
                Cancel
              </Button>
              <div className="flex space-x-2">
                {activeEntryId && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
                        deleteEntryMutation.mutate(activeEntryId);
                        setShowEntryForm(false);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button 
                  type="submit" 
                  onClick={handleSubmitEntry}
                  disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                >
                  {(createEntryMutation.isPending || updateEntryMutation.isPending) && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {activeEntryId ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : activeEntryId && activeEntry && Object.keys(activeEntry).length > 0 ? (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    {getDimensionIcon(activeEntry.dimensionCode)}
                    <CardTitle>{activeEntry.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-1 flex items-center space-x-2">
                    <span>{format(new Date(activeEntry.createdAt), 'MMMM d, yyyy h:mm a')}</span>
                    <Badge variant="outline" className="ml-2">
                      {getEntryTypeLabel(activeEntry.entryType)}
                    </Badge>
                    <Badge variant="secondary">
                      Mood: {getMoodDescription(activeEntry.mood)}
                    </Badge>
                    {activeEntry.dimensionCode && (
                      <Badge className="bg-primary">{activeEntry.dimensionCode}</Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditEntry(activeEntry)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                {/* Format the content with proper paragraph breaks */}
                {activeEntry.content.split("\n").map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              {/* Reflections Section */}
              {activeEntry.reflections && Array.isArray(activeEntry.reflections) && activeEntry.reflections.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    SAGE Reflections
                  </h3>
                  
                  <div className="space-y-4">
                    {activeEntry.reflections.map((reflection: JournalReflection) => (
                      <Card key={reflection.id} className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm">
                              {reflection.insightType === 'strength' && 'Strength Identified'}
                              {reflection.insightType === 'opportunity' && 'Growth Opportunity'}
                              {reflection.insightType === 'reflection' && 'Reflective Insight'}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(reflection.createdAt), 'MMM d')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-2">
                          <p className="text-sm">{reflection.content}</p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-end space-x-2">
                          {!reflection.userFeedback && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => saveReflectionFeedbackMutation.mutate({ 
                                  reflectionId: reflection.id, 
                                  feedback: 'helpful' 
                                })}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => saveReflectionFeedbackMutation.mutate({ 
                                  reflectionId: reflection.id, 
                                  feedback: 'not_helpful' 
                                })}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Not Helpful
                              </Button>
                            </>
                          )}
                          {reflection.userFeedback === 'helpful' && (
                            <Badge variant="outline" className="bg-green-500/10">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Marked as Helpful
                            </Badge>
                          )}
                          {reflection.userFeedback === 'not_helpful' && (
                            <Badge variant="outline" className="bg-red-500/10">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Marked as Not Helpful
                            </Badge>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t p-4">
              <Button 
                variant="secondary" 
                onClick={() => setActiveEntryId(null)}
              >
                Back to Entries
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="h-full flex flex-col justify-center items-center p-8 text-center">
            <BookText className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your Reflection Journal</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Enhance your pickleball journey through consistent reflection. Select an entry or create a new one to start your journaling practice.
            </p>
            <Button 
              onClick={() => {
                setEntryFormData({
                  title: '',
                  content: '',
                  mood: 'neutral',
                  entryType: 'free_form',
                  isPrivate: false
                });
                setShowEntryForm(true);
              }}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Create First Entry
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}