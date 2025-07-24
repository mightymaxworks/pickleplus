import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Plus, Save, Eye, GripVertical, Target, BookOpen, Play } from 'lucide-react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Drill {
  id: number;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  description: string;
  objectives: string[];
  equipment: string[];
  videoUrl?: string;
  pcp_technical_rating: number;
  pcp_tactical_rating: number;
  pcp_physical_rating: number;
  pcp_mental_rating: number;
}

interface SessionPlan {
  id?: number;
  title: string;
  description: string;
  duration: number;
  skill_level: string;
  objectives: string[];
  drills: SessionDrill[];
  created_at?: string;
}

interface SessionDrill {
  drill: Drill;
  allocated_minutes: number;
  order_sequence: number;
  objectives?: string;
  notes?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  skill_level: string;
  current_rating: number;
}

export default function SessionPlanningPage() {
  const [selectedDrills, setSelectedDrills] = useState<SessionDrill[]>([]);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    duration: 60,
    skill_level: 'Intermediate',
    objectives: ['']
  });
  const [showDrillLibrary, setShowDrillLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available drills
  const { data: drills = [], isLoading: drillsLoading } = useQuery({
    queryKey: ['/api/coach/curriculum/drills'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coach/curriculum/drills');
      return response.json();
    }
  });

  // Fetch session templates
  const { data: sessionTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/coach/session-plans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coach/session-plans');
      return response.json();
    }
  });

  // Fetch students for assignment
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/coach/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coach/students');
      return response.json();
    }
  });

  // Create session plan mutation
  const createSessionPlan = useMutation({
    mutationFn: async (sessionData: SessionPlan) => {
      const response = await apiRequest('POST', '/api/coach/session-plans/create', sessionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Plan Created",
        description: "Your session plan has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/session-plans'] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSessionForm({
      title: '',
      description: '',
      duration: 60,
      skill_level: 'Intermediate',
      objectives: ['']
    });
    setSelectedDrills([]);
  };

  const addDrillToSession = (drill: Drill) => {
    const newSessionDrill: SessionDrill = {
      drill,
      allocated_minutes: drill.duration || 10,
      order_sequence: selectedDrills.length + 1,
      objectives: drill.objectives?.join(', ') || '',
      notes: ''
    };
    setSelectedDrills([...selectedDrills, newSessionDrill]);
    setShowDrillLibrary(false);
    toast({
      title: "Drill Added",
      description: `${drill.title} has been added to your session plan.`,
    });
  };

  const removeDrillFromSession = (index: number) => {
    const updatedDrills = selectedDrills.filter((_, i) => i !== index);
    setSelectedDrills(updatedDrills.map((drill, i) => ({ ...drill, order_sequence: i + 1 })));
  };

  const updateDrillMinutes = (index: number, minutes: number) => {
    const updatedDrills = [...selectedDrills];
    updatedDrills[index].allocated_minutes = minutes;
    setSelectedDrills(updatedDrills);
  };

  const calculateTotalDuration = () => {
    return selectedDrills.reduce((total, drill) => total + drill.allocated_minutes, 0);
  };

  const handleSaveSessionPlan = () => {
    if (!sessionForm.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a session title.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDrills.length === 0) {
      toast({
        title: "No Drills Selected",
        description: "Please add at least one drill to your session plan.",
        variant: "destructive",
      });
      return;
    }

    const sessionPlan: SessionPlan = {
      ...sessionForm,
      drills: selectedDrills,
      objectives: sessionForm.objectives.filter(obj => obj.trim() !== '')
    };

    createSessionPlan.mutate(sessionPlan);
  };

  const filteredDrills = drills.filter((drill: Drill) => {
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(drills.map((drill: Drill) => drill.category)))];

  return (
    <StandardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full backdrop-blur-sm border border-white/20 shadow-xl mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Session Planning
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create structured lesson plans using our comprehensive drill library
            </p>
          </div>

          <Tabs defaultValue="planner" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/20 shadow-xl">
              <TabsTrigger value="planner" className="transition-all duration-200">Session Planner</TabsTrigger>
              <TabsTrigger value="templates" className="transition-all duration-200">My Templates</TabsTrigger>
              <TabsTrigger value="schedule" className="transition-all duration-200">Schedule Sessions</TabsTrigger>
            </TabsList>

            {/* Session Planner Tab */}
            <TabsContent value="planner" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Session Details Form */}
                <Card className="lg:col-span-1 backdrop-blur-sm bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Session Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Session Title</Label>
                      <Input
                        id="title"
                        value={sessionForm.title}
                        onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                        placeholder="e.g., Beginner Fundamentals - Serves & Returns"
                        className="backdrop-blur-sm bg-white/50 border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={sessionForm.description}
                        onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})}
                        placeholder="Brief description of the session focus..."
                        className="backdrop-blur-sm bg-white/50 border-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Target Duration (min)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={sessionForm.duration}
                          onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                          className="backdrop-blur-sm bg-white/50 border-white/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skill_level">Skill Level</Label>
                        <select
                          id="skill_level"
                          value={sessionForm.skill_level}
                          onChange={(e) => setSessionForm({...sessionForm, skill_level: e.target.value})}
                          className="w-full rounded-md border border-white/20 backdrop-blur-sm bg-white/50 px-3 py-2"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Session Objectives</Label>
                      {sessionForm.objectives.map((objective, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={objective}
                            onChange={(e) => {
                              const newObjectives = [...sessionForm.objectives];
                              newObjectives[index] = e.target.value;
                              setSessionForm({...sessionForm, objectives: newObjectives});
                            }}
                            placeholder="Enter session objective..."
                            className="backdrop-blur-sm bg-white/50 border-white/20"
                          />
                          {index === sessionForm.objectives.length - 1 && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setSessionForm({...sessionForm, objectives: [...sessionForm.objectives, '']})}
                              className="hover:scale-105 transition-transform duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Total Duration:</span>
                        <Badge variant={calculateTotalDuration() > sessionForm.duration ? "destructive" : "default"}>
                          {calculateTotalDuration()} / {sessionForm.duration} min
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveSessionPlan}
                          disabled={createSessionPlan.isPending}
                          className="flex-1 hover:scale-105 transition-transform duration-200"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Plan
                        </Button>
                        <Button variant="outline" onClick={resetForm} className="hover:scale-105 transition-transform duration-200">
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Drill Selection and Session Structure */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Add Drills Section */}
                  <Card className="backdrop-blur-sm bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-white/20 shadow-xl">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-500" />
                          Session Structure
                        </CardTitle>
                        <Button 
                          onClick={() => setShowDrillLibrary(true)}
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Drill
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedDrills.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                          <p className="text-lg font-medium">No drills added yet</p>
                          <p>Click "Add Drill" to start building your session</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedDrills.map((sessionDrill, index) => (
                            <Card key={index} className="backdrop-blur-sm bg-white/50 border border-white/20 hover:shadow-md transition-all duration-200">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                    <span className="text-sm font-medium">{index + 1}</span>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{sessionDrill.drill.title}</h4>
                                        <p className="text-sm text-muted-foreground">{sessionDrill.drill.description}</p>
                                        <div className="flex gap-2 mt-2">
                                          <Badge variant="outline">{sessionDrill.drill.category}</Badge>
                                          <Badge variant="outline">{sessionDrill.drill.difficulty}</Badge>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          <Label className="text-xs">Minutes</Label>
                                          <Input
                                            type="number"
                                            value={sessionDrill.allocated_minutes}
                                            onChange={(e) => updateDrillMinutes(index, parseInt(e.target.value))}
                                            className="w-20 h-8 text-center backdrop-blur-sm bg-white/50 border-white/20"
                                          />
                                        </div>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeDrillFromSession(index)}
                                          className="hover:scale-105 transition-transform duration-200"
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card className="backdrop-blur-sm bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Saved Session Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  {templatesLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse backdrop-blur-sm bg-white/50 border border-white/20 rounded-lg p-4">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : sessionTemplates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No session templates yet</p>
                      <p>Create your first session plan to see it here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessionTemplates.map((template: SessionPlan) => (
                        <Card key={template.id} className="backdrop-blur-sm bg-white/50 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <div className="flex gap-2 mb-3">
                              <Badge variant="outline">{template.skill_level}</Badge>
                              <Badge variant="outline">{template.duration} min</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 hover:scale-105 transition-transform duration-200">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" className="flex-1 hover:scale-105 transition-transform duration-200">
                                Use Template
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <Card className="backdrop-blur-sm bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Schedule Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Session Scheduling</p>
                    <p>Coming soon - assign your session plans to students</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Drill Library Modal */}
        <Dialog open={showDrillLibrary} onOpenChange={setShowDrillLibrary}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 border border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Drill Library</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <Input
                  placeholder="Search drills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 backdrop-blur-sm bg-white/50 border-white/20"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-white/20 backdrop-blur-sm bg-white/50 px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drill Grid */}
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDrills.map((drill: Drill) => (
                    <Card key={drill.id} className="backdrop-blur-sm bg-white/50 border border-white/20 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{drill.title}</h4>
                          <Badge variant="outline">{drill.duration}min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline">{drill.category}</Badge>
                          <Badge variant="outline">{drill.difficulty}</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addDrillToSession(drill)}
                          className="w-full hover:scale-105 transition-transform duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Session
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StandardLayout>
  );
}