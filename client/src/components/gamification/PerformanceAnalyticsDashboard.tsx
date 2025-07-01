import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Clock,
  Trophy,
  Star,
  Zap,
  Award,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Activity
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  category: 'skill' | 'engagement' | 'social' | 'achievement';
  currentValue: number;
  previousValue: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  description: string;
}

interface SkillProgression {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  improvement: number;
  timeToTarget: number; // in days
  recommendations: string[];
  practiceHours: number;
  matchesNeeded: number;
}

interface GoalTracking {
  id: string;
  goal: string;
  category: string;
  progress: number;
  target: number;
  deadline: Date;
  status: 'on_track' | 'at_risk' | 'achieved' | 'overdue';
  milestones: {
    name: string;
    completed: boolean;
    date?: Date;
  }[];
}

interface ComparisonData {
  metric: string;
  userValue: number;
  peerAverage: number;
  topPercentile: number;
  userRank: number;
  totalUsers: number;
}

interface PerformanceAnalyticsDashboardProps {
  userId: number;
  onSetGoal?: () => void;
  onViewRecommendations?: (skill: string) => void;
  onClose?: () => void;
}

export default function PerformanceAnalyticsDashboard({
  userId,
  onSetGoal,
  onViewRecommendations,
  onClose
}: PerformanceAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'goals' | 'comparison'>('overview');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [skillProgression, setSkillProgression] = useState<SkillProgression[]>([]);
  const [goals, setGoals] = useState<GoalTracking[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Load real analytics data from API
        const picklePointsResponse = await fetch(`/api/pickle-points/${userId}`);
        const picklePointsData = await picklePointsResponse.json();
        const currentPicklePoints = picklePointsData?.picklePoints || 0;

        const realMetrics: PerformanceMetric[] = [
          {
            id: 'pickle_points_earned',
            name: 'Pickle Points Earned',
            category: 'engagement',
            currentValue: currentPicklePoints,
            previousValue: Math.max(0, currentPicklePoints - 50), // Estimate previous value
            unit: 'Points',
            trend: 'up',
            trendPercentage: currentPicklePoints > 50 ? 10 : 0,
            description: 'Total Pickle Points gained through activities'
          }
        ];

        setMetrics(realMetrics);
        // Show empty states for features not yet implemented with real data
        setSkillProgression([]);
        setGoals([]);
        setComparisonData([]);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Show empty states on error
        setMetrics([]);
        setSkillProgression([]);
        setGoals([]);
        setComparisonData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange, userId]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const EmptyState = ({ type, description }: { type: string; description: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>No {type} data available yet</p>
      <p className="text-sm">{description}</p>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading analytics data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {metrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-300">
                        {metric.name}
                      </h4>
                      <Badge variant="outline" className={getTrendColor(metric.trend)}>
                        {getTrendIcon(metric.trend)}
                        {metric.trendPercentage > 0 && '+'}
                        {metric.trendPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {metric.currentValue.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {metric.unit}
                      </span>
                    </div>
                    {metric.target && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to target</span>
                          <span>{metric.target} {metric.unit}</span>
                        </div>
                        <Progress 
                          value={(metric.currentValue / metric.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {metric.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState 
                type="performance metrics" 
                description="Performance tracking features are being developed" 
              />
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <EmptyState 
              type="skill progression" 
              description="Detailed skill tracking will be available soon" 
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personal Goals</h3>
              {onSetGoal && (
                <Button onClick={onSetGoal} size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              )}
            </div>
            <EmptyState 
              type="goals" 
              description="Goal tracking system will be implemented soon" 
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <EmptyState 
              type="comparison data" 
              description="Peer comparison analytics are coming soon" 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}