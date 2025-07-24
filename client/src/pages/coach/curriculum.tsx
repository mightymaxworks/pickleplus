import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Plus, Filter, BookOpen, Target, Calendar, ChevronDown, ChevronRight, Users, Clock, MapPin, Play, Video, ExternalLink, Edit, Trash2, Save, X, UserPlus, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Drill {
  id: number;
  name: string;
  category: string;
  skillLevel: string;
  minPcpRating: string;
  maxPcpRating: string;
  objective: string;
  setup: string;
  instructions: string;
  keyFocus: string;
  equipmentNeeded: string;
  youtubeUrl?: string;
  xiaohongshuUrl?: string;
  playersRequired?: number;
  estimatedDuration?: number;
  originalNumber: number;
  isActive: boolean;
  createdAt: string;
}

interface CurriculumTemplate {
  id: number;
  name: string;
  skillLevel: string;
  description: string;
  objectives: string;
  durationMinutes: number;
  templateStructure: string;
  createdBy: number;
  isPublic: boolean;
  createdAt: string;
}

export default function CoachCurriculumPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [expandedDrills, setExpandedDrills] = useState<Set<number>>(new Set());
  const [selectedDrillsForSession, setSelectedDrillsForSession] = useState<Set<number>>(new Set());
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSessionPlanDialog, setShowSessionPlanDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch drills
  const { data: drills, isLoading: drillsLoading } = useQuery<Drill[]>({
    queryKey: ['/api/curriculum/drills'],
    queryFn: async () => {
      const response = await fetch('/api/curriculum/drills');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery<CurriculumTemplate[]>({
    queryKey: ['/api/curriculum/templates'],
    queryFn: async () => {
      const response = await fetch('/api/curriculum/templates');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/curriculum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/curriculum/categories');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Update drill mutation
  const updateDrillMutation = useMutation({
    mutationFn: async ({ id, ...drillData }: any) => {
      const response = await apiRequest('PUT', `/api/curriculum/drills/${id}`, drillData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Drill Updated Successfully!",
        description: "The drill has been updated in your curriculum library",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/drills'] });
      setShowEditDialog(false);
      setEditingDrill(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update drill",
        variant: "destructive",
      });
    }
  });

  // Delete drill mutation
  const deleteDrillMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/curriculum/drills/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Drill Deleted",
        description: "The drill has been removed from your curriculum library",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/drills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive",
      });
    }
  });

  // Filter drills based on search and filters
  const filteredDrills = useMemo(() => {
    if (!drills) return [];

    return drills.filter(drill => {
      const matchesSearch = !searchQuery || 
        drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.keyFocus.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || drill.category === selectedCategory;
      const matchesSkillLevel = !selectedSkillLevel || selectedSkillLevel === 'all' || drill.skillLevel === selectedSkillLevel;
      
      return matchesSearch && matchesCategory && matchesSkillLevel && drill.isActive;
    });
  }, [drills, searchQuery, selectedCategory, selectedSkillLevel]);

  // Get unique categories and skill levels for filters
  const uniqueCategories = useMemo(() => {
    if (!drills) return [];
    return [...new Set(drills.map(drill => drill.category))];
  }, [drills]);

  const uniqueSkillLevels = useMemo(() => {
    if (!drills) return [];
    return [...new Set(drills.map(drill => drill.skillLevel))];
  }, [drills]);

  const toggleDrillExpansion = (drillId: number) => {
    setExpandedDrills(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(drillId)) {
        newSet.delete(drillId);
      } else {
        newSet.add(drillId);
      }
      return newSet;
    });
  };

  const toggleDrillSelection = (drillId: number) => {
    setSelectedDrillsForSession(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(drillId)) {
        newSet.delete(drillId);
      } else {
        newSet.add(drillId);
      }
      return newSet;
    });
  };

  const handleEditDrill = (drill: Drill) => {
    setEditingDrill(drill);
    setShowEditDialog(true);
  };

  const handleDeleteDrill = (drillId: number) => {
    if (confirm('Are you sure you want to delete this drill? This action cannot be undone.')) {
      deleteDrillMutation.mutate(drillId);
    }
  };

  const handleSaveEdit = () => {
    if (!editingDrill) return;
    updateDrillMutation.mutate(editingDrill);
  };

  const createSessionPlan = () => {
    const selectedDrills = filteredDrills.filter(drill => selectedDrillsForSession.has(drill.id));
    if (selectedDrills.length === 0) {
      toast({
        title: "No Drills Selected",
        description: "Please select at least one drill for your session plan",
        variant: "destructive",
      });
      return;
    }
    setShowSessionPlanDialog(true);
  };

  if (drillsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drill Library</h1>
          <p className="text-gray-600 mt-1">Manage your coaching curriculum and plan sessions</p>
        </div>
        <div className="flex gap-2">
          {selectedDrillsForSession.size > 0 && (
            <Button 
              onClick={createSessionPlan}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Session Plan ({selectedDrillsForSession.size})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Drills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search drills by name, objective, or focus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Skill Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skill Levels</SelectItem>
                {uniqueSkillLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Found {filteredDrills.length} drills</span>
            {(selectedCategory !== 'all' || selectedSkillLevel !== 'all' || searchQuery) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSkillLevel('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drills List */}
      <div className="space-y-4">
        {filteredDrills.map((drill) => (
          <Card key={drill.id} className={`transition-all duration-200 ${
            selectedDrillsForSession.has(drill.id) ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}>
            <Collapsible 
              open={expandedDrills.has(drill.id)}
              onOpenChange={() => toggleDrillExpansion(drill.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {expandedDrills.has(drill.id) ? 
                        <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      }
                      <div>
                        <CardTitle className="text-lg font-semibold">{drill.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {drill.objective}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{drill.category}</Badge>
                      <Badge variant="secondary">{drill.skillLevel}</Badge>
                      <Badge variant="outline">PCP {drill.minPcpRating}-{drill.maxPcpRating}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Drill Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Setup & Instructions</h4>
                        <p className="text-gray-700 mb-3">{drill.setup}</p>
                        <p className="text-gray-700">{drill.instructions}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Focus</h4>
                        <p className="text-gray-700">{drill.keyFocus}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Players:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{drill.playersRequired || 'Variable'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{drill.estimatedDuration || 'Variable'} min</span>
                          </div>
                        </div>
                      </div>

                      {drill.equipmentNeeded && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Equipment Needed</h4>
                          <p className="text-gray-700">{drill.equipmentNeeded}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Video Content */}
                    <div className="space-y-4">
                      {drill.youtubeUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Video Tutorial</h4>
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={drill.youtubeUrl.replace('watch?v=', 'embed/')}
                              title={`${drill.name} Tutorial`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      )}

                      {drill.xiaohongshuUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">小红书 Demo</h4>
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{drill.name} 演示</p>
                                <p className="text-sm text-gray-600">专业教练技术示范</p>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <a href={drill.xiaohongshuUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  观看
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedDrillsForSession.has(drill.id) ? "default" : "outline"}
                        onClick={() => toggleDrillSelection(drill.id)}
                      >
                        {selectedDrillsForSession.has(drill.id) ? (
                          <>Selected for Session</>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add to Session
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditDrill(drill)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDrill(drill.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Edit Drill Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Drill</DialogTitle>
            <DialogDescription>
              Update the drill information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingDrill && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Drill Name</Label>
                <Input
                  id="name"
                  value={editingDrill.name}
                  onChange={(e) => setEditingDrill({ ...editingDrill, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Textarea
                  id="objective"
                  value={editingDrill.objective}
                  onChange={(e) => setEditingDrill({ ...editingDrill, objective: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={editingDrill.instructions}
                  onChange={(e) => setEditingDrill({ ...editingDrill, instructions: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="keyFocus">Key Focus</Label>
                <Textarea
                  id="keyFocus"
                  value={editingDrill.keyFocus}
                  onChange={(e) => setEditingDrill({ ...editingDrill, keyFocus: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateDrillMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateDrillMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Plan Dialog */}
      <Dialog open={showSessionPlanDialog} onOpenChange={setShowSessionPlanDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Session Plan</DialogTitle>
            <DialogDescription>
              Selected {selectedDrillsForSession.size} drills for your session plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This feature will be enhanced in Sprint 2 Phase 2 to include session scheduling,
              student assignment, and comprehensive lesson planning tools.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">Coming Soon:</p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Session scheduling and calendar integration</li>
                <li>• Student assignment and notification</li>
                <li>• Drill sequence planning and timing</li>
                <li>• Performance tracking and feedback</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSessionPlanDialog(false);
              setSelectedDrillsForSession(new Set());
              toast({
                title: "Session Plan Noted",
                description: "Your drill selections have been saved for future session planning.",
              });
            }}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}