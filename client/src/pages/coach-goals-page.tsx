/**
 * PKL-278651-COACH-GOALS-PHASE2-UI - Coach Goals Management Page
 * 
 * Frontend interface for Phase 2 coach goal management system.
 * Allows coaches to assign goals to players, track progress, and manage milestones.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Target, 
  Plus, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  User,
  Filter,
  Search,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CoachGoalAssignmentForm from "@/components/coach/CoachGoalAssignmentForm";

interface CoachGoal {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  target_date?: string;
  progress_percentage?: number;
  player: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  milestoneStats: {
    total: number;
    completed: number;
  };
  milestone_count?: string;
  completed_milestones?: string;
}

interface CoachDashboard {
  overview: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalPlayers: number;
    avgProgress: number;
    completionRate: number;
  };
  categoryBreakdown: Record<string, number>;
  recentActivity: any[];
  needsAttention: any[];
}

export default function CoachGoalsPage() {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coach's assigned goals
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/coach/goals/my-players"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/coach/goals/my-players");
      return response.json();
    }
  });

  // Fetch coach dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/coach/goals/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/coach/goals/dashboard");
      return response.json();
    }
  });

  const goals: CoachGoal[] = goalsData?.goals || [];
  const dashboard: CoachDashboard = dashboardData?.dashboard || {
    overview: {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      totalPlayers: 0,
      avgProgress: 0,
      completionRate: 0
    },
    categoryBreakdown: {},
    recentActivity: [],
    needsAttention: []
  };

  // Filter goals based on search and filters
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.player.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory;
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAssignSuccess = () => {
    setShowAssignForm(false);
    queryClient.invalidateQueries({ queryKey: ["/api/coach/goals/my-players"] });
    queryClient.invalidateQueries({ queryKey: ["/api/coach/goals/dashboard"] });
    toast({
      title: "Goal Assigned Successfully",
      description: "The goal has been assigned to the player."
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: "bg-blue-100 text-blue-800",
      competitive: "bg-red-100 text-red-800", 
      social: "bg-green-100 text-green-800",
      fitness: "bg-orange-100 text-orange-800",
      mental: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (goalsLoading || dashboardLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coach Goal Management</h1>
          <p className="text-muted-foreground mt-2">
            Assign and track goals for your players
          </p>
        </div>
        <Button onClick={() => setShowAssignForm(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Assign Goal
        </Button>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{dashboard.overview.totalGoals}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{dashboard.overview.activeGoals}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{dashboard.overview.completedGoals}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Players</p>
                <p className="text-2xl font-bold">{dashboard.overview.totalPlayers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search goals or players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="competitive">Competitive</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="mental">Mental</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Goals Found</h3>
              <p className="text-muted-foreground mb-4">
                {goals.length === 0 
                  ? "You haven't assigned any goals yet. Start by assigning your first goal to a player."
                  : "No goals match your current filters. Try adjusting your search criteria."
                }
              </p>
              {goals.length === 0 && (
                <Button onClick={() => setShowAssignForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign First Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{goal.title}</h3>
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge variant={goal.status === "active" ? "default" : "secondary"}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{goal.player.displayName}</span>
                      </div>
                      {goal.target_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due {new Date(goal.target_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>
                          {goal.milestoneStats.completed}/{goal.milestoneStats.total} milestones
                        </span>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {goal.progress_percentage || 0}% complete
                    </p>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Goal Assignment Form Modal */}
      {showAssignForm && (
        <CoachGoalAssignmentForm
          onSuccess={handleAssignSuccess}
          onCancel={() => setShowAssignForm(false)}
        />
      )}
    </div>
  );
}