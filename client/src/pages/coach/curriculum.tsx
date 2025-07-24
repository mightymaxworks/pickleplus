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
import { Search, Plus, Filter, BookOpen, Target, Calendar, ChevronDown, ChevronRight, Users, Clock, MapPin, Play, Video, ExternalLink, Edit, Trash2, Save, X, UserPlus, FileText, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    return Array.from(new Set(drills.map(drill => drill.category)));
  }, [drills]);

  const uniqueSkillLevels = useMemo(() => {
    if (!drills) return [];
    return Array.from(new Set(drills.map(drill => drill.skillLevel)));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-900/30 border border-green-200/50 dark:border-green-800/50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Drill Library</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Curate your coaching curriculum and build effective session plans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedDrillsForSession.size > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedDrillsForSession.size} drill{selectedDrillsForSession.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={createSessionPlan}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Session Plan
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/coach/session-planning'}
                        variant="outline"
                        className="px-6 py-2 rounded-2xl backdrop-blur-sm bg-white/50 border-white/20 hover:bg-white/70 hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Session Planning
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search & Filter</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search drills by name, objective, or focus..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 rounded-2xl border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full lg:w-48 h-12 rounded-2xl border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
                    <SelectTrigger className="w-full lg:w-48 h-12 rounded-2xl border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Found <span className="font-semibold text-gray-900 dark:text-white">{filteredDrills.length}</span> drills
                  </span>
                </div>
                {(selectedCategory !== 'all' || selectedSkillLevel !== 'all' || searchQuery) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSkillLevel('all');
                    }}
                    className="rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drills List */}
        <div className="grid gap-6">
          {filteredDrills.map((drill) => (
            <div key={drill.id} className={`group transition-all duration-300 ${
              selectedDrillsForSession.has(drill.id) 
                ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-transparent' 
                : ''
            }`}>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <Collapsible 
                  open={expandedDrills.has(drill.id)}
                  onOpenChange={() => toggleDrillExpansion(drill.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors rounded-3xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-800/40 dark:group-hover:to-indigo-800/40 transition-all">
                            {expandedDrills.has(drill.id) ? 
                              <ChevronDown className="h-5 w-5 text-blue-600" /> : 
                              <ChevronRight className="h-5 w-5 text-blue-600" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {drill.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                              {drill.objective}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50">
                                <Target className="h-3 w-3" />
                                {drill.category}
                              </div>
                              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50">
                                <Trophy className="h-3 w-3" />
                                {drill.skillLevel}
                              </div>
                              {drill.minPcpRating && drill.maxPcpRating && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50">
                                  <Users className="h-3 w-3" />
                                  PCP {drill.minPcpRating}-{drill.maxPcpRating}
                                </div>
                              )}
                              {drill.estimatedDuration && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                                  <Clock className="h-3 w-3" />
                                  {drill.estimatedDuration} min
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDrillSelection(drill.id);
                            }}
                            className={`p-3 rounded-2xl transition-all duration-300 ${
                              selectedDrillsForSession.has(drill.id)
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6"></div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Drill Details */}
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                              <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Play className="h-4 w-4 text-blue-600" />
                              </div>
                              Setup & Instructions
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Setup:</div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{drill.setup}</p>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Instructions:</div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{drill.instructions}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50/50 dark:bg-green-900/20 rounded-2xl p-6">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                              <div className="p-1 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Target className="h-4 w-4 text-green-600" />
                              </div>
                              Key Focus
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{drill.keyFocus}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Players</span>
                              </div>
                              <div className="text-lg font-bold text-purple-600">{drill.playersRequired || 'Variable'}</div>
                            </div>
                            <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Duration</span>
                              </div>
                              <div className="text-lg font-bold text-orange-600">{drill.estimatedDuration || 'Variable'} min</div>
                            </div>
                          </div>

                          {drill.equipmentNeeded && (
                            <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl p-6">
                              <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                                <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                  <MapPin className="h-4 w-4 text-amber-600" />
                                </div>
                                Equipment Needed
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{drill.equipmentNeeded}</p>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Video Content */}
                        <div className="space-y-6">
                          {drill.youtubeUrl && (
                            <div className="bg-red-50/50 dark:bg-red-900/20 rounded-2xl p-6">
                              <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                                <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/30">
                                  <Video className="h-4 w-4 text-red-600" />
                                </div>
                                YouTube Video Demo
                              </h4>
                              <div className="bg-black rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
                                <iframe
                                  src={`https://www.youtube.com/embed/${drill.youtubeUrl.split('v=')[1]?.split('&')[0]}`}
                                  className="w-full h-full rounded-2xl"
                                  allowFullScreen
                                ></iframe>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(drill.youtubeUrl, '_blank')}
                                  className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Watch on YouTube
                                </Button>
                              </div>
                            </div>
                          )}

                          {drill.xiaohongshuUrl && (
                            <div className="bg-pink-50/50 dark:bg-pink-900/20 rounded-2xl p-6">
                              <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                                <div className="p-1 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                  <Video className="h-4 w-4 text-pink-600" />
                                </div>
                                小红书 (XiaoHongShu) Video
                              </h4>
                              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">小</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-red-900 dark:text-red-300">小红书</div>
                                    <div className="text-sm text-red-700 dark:text-red-400">XiaoHongShu Video</div>
                                  </div>
                                </div>
                                <p className="text-red-800 dark:text-red-300 text-sm mb-4 leading-relaxed">
                                  Watch this drill demonstration on XiaoHongShu for detailed Chinese language instruction and tips.
                                </p>
                                <Button 
                                  onClick={() => window.open(drill.xiaohongshuUrl, '_blank')}
                                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  在小红书上观看
                                </Button>
                              </div>
                            </div>
                          )}

                          {!drill.youtubeUrl && !drill.xiaohongshuUrl && (
                            <div className="bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 inline-flex mb-4">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">No video demonstrations available for this drill</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex gap-3">
                          <Button
                            variant={selectedDrillsForSession.has(drill.id) ? "default" : "outline"}
                            onClick={() => toggleDrillSelection(drill.id)}
                            className={cn(
                              "rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105",
                              selectedDrillsForSession.has(drill.id) 
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/25 border-green-400/50" 
                                : "border-white/20 bg-white/50 hover:bg-white/70 hover:shadow-md"
                            )}
                          >
                            {selectedDrillsForSession.has(drill.id) ? (
                              <>
                                <Trophy className="h-4 w-4 mr-2" />
                                ✓ Selected for Session
                              </>
                            ) : (
                              <>
                                <Calendar className="h-4 w-4 mr-2" />
                                Select for Session
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDrill(drill)}
                            className="rounded-xl text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDrill(drill.id)}
                            className="rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
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
    </div>
  );
}