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
  title: string;
  description: string;
  category: 'technical' | 'tactical' | 'social' | 'consistency';
  progress: number;
  target: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
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
      // Mock data for demonstration
      const mockMetrics: PerformanceMetric[] = [
        {
          id: 'xp_earned',
          name: 'XP Earned',
          category: 'engagement',
          currentValue: 2450,
          previousValue: 2100,
          unit: 'XP',
          trend: 'up',
          trendPercentage: 16.7,
          description: 'Total experience points gained through activities'
        },
        {
          id: 'win_rate',
          name: 'Win Rate',
          category: 'skill',
          currentValue: 73,
          previousValue: 68,
          target: 80,
          unit: '%',
          trend: 'up',
          trendPercentage: 7.4,
          description: 'Percentage of matches won in competitive play'
        },
        {
          id: 'achievements',
          name: 'Achievements Unlocked',
          category: 'achievement',
          currentValue: 28,
          previousValue: 24,
          unit: 'badges',
          trend: 'up',
          trendPercentage: 16.7,
          description: 'Total achievements earned across all categories'
        },
        {
          id: 'social_connections',
          name: 'Social Connections',
          category: 'social',
          currentValue: 15,
          previousValue: 12,
          unit: 'friends',
          trend: 'up',
          trendPercentage: 25.0,
          description: 'Active friendships and mentorship connections'
        },
        {
          id: 'practice_time',
          name: 'Practice Time',
          category: 'engagement',
          currentValue: 180,
          previousValue: 195,
          target: 200,
          unit: 'minutes',
          trend: 'down',
          trendPercentage: -7.7,
          description: 'Weekly time spent in practice and training'
        }
      ];

      const mockSkillProgression: SkillProgression[] = [
        {
          skill: 'Serve Accuracy',
          currentLevel: 7.5,
          targetLevel: 9.0,
          improvement: 0.8,
          timeToTarget: 45,
          practiceHours: 20,
          matchesNeeded: 15,
          recommendations: [
            'Focus on serve placement drills',
            'Practice power serves with accuracy',
            'Work on serve consistency under pressure'
          ]
        },
        {
          skill: 'Court Positioning',
          currentLevel: 6.2,
          targetLevel: 8.0,
          improvement: 1.2,
          timeToTarget: 60,
          practiceHours: 25,
          matchesNeeded: 20,
          recommendations: [
            'Study positioning strategies',
            'Practice movement patterns',
            'Analyze pro player positioning'
          ]
        },
        {
          skill: 'Shot Selection',
          currentLevel: 8.1,
          targetLevel: 9.0,
          improvement: 0.3,
          timeToTarget: 30,
          practiceHours: 15,
          matchesNeeded: 12,
          recommendations: [
            'Develop shot variety',
            'Practice situational awareness',
            'Work on risk assessment'
          ]
        }
      ];

      const mockGoals: GoalTracking[] = [
        {
          id: 'consistency_goal',
          title: 'Weekly Consistency Master',
          description: 'Play at least 5 matches per week for 4 consecutive weeks',
          category: 'consistency',
          progress: 15,
          target: 20,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          priority: 'high',
          milestones: [
            { name: 'Week 1 Complete', completed: true, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
            { name: 'Week 2 Complete', completed: true, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { name: 'Week 3 Complete', completed: true },
            { name: 'Week 4 Complete', completed: false }
          ]
        },
        {
          id: 'skill_goal',
          title: 'Advanced Serve Mastery',
          description: 'Achieve 85% serve accuracy in competitive matches',
          category: 'technical',
          progress: 73,
          target: 85,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          milestones: [
            { name: 'Basic Technique', completed: true },
            { name: '70% Accuracy', completed: true },
            { name: '80% Accuracy', completed: false },
            { name: '85% Accuracy', completed: false }
          ]
        }
      ];

      const mockComparisonData: ComparisonData[] = [
        {
          metric: 'Win Rate',
          userValue: 73,
          peerAverage: 65,
          topPercentile: 85,
          userRank: 156,
          totalUsers: 1247
        },
        {
          metric: 'Matches Per Week',
          userValue: 6,
          peerAverage: 4.2,
          topPercentile: 8.5,
          userRank: 89,
          totalUsers: 1247
        },
        {
          metric: 'Achievement Rate',
          userValue: 28,
          peerAverage: 18,
          topPercentile: 45,
          userRank: 234,
          totalUsers: 1247
        }
      ];

      setMetrics(mockMetrics);
      setSkillProgression(mockSkillProgression);
      setGoals(mockGoals);
      setComparisonData(mockComparisonData);
      setIsLoading(false);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <Target className="w-4 h-4 text-blue-500" />;
      case 'engagement': return <Activity className="w-4 h-4 text-green-500" />;
      case 'social': return <Users className="w-4 h-4 text-purple-500" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} days left`;
    return 'Due soon';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Performance Analytics Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg">
              {['week', 'month', 'quarter'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                  className="capitalize"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      <h4 className="font-semibold text-sm">{metric.name}</h4>
                    </div>
                    <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{metric.currentValue.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    
                    {metric.target && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Target: {metric.target}{metric.unit}</span>
                          <span>{Math.round((metric.currentValue / metric.target) * 100)}%</span>
                        </div>
                        <Progress value={(metric.currentValue / metric.target) * 100} className="h-2" />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-800">Strong Improvement Trend</h5>
                      <p className="text-sm text-blue-700">
                        Your win rate has improved by 7.4% this month. Continue practicing serve accuracy to maintain momentum.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-orange-800">Practice Time Alert</h5>
                      <p className="text-sm text-orange-700">
                        Your practice time decreased by 7.7%. Consider scheduling more training sessions to reach your goals.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-4">
              {skillProgression.map((skill, index) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{skill.skill}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Current: {skill.currentLevel}/10</span>
                        <span>Target: {skill.targetLevel}/10</span>
                        <span>Improvement: +{skill.improvement}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewRecommendations?.(skill.skill)}
                    >
                      View Plan
                    </Button>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress to Target</span>
                      <span>{Math.round((skill.currentLevel / skill.targetLevel) * 100)}%</span>
                    </div>
                    <Progress value={(skill.currentLevel / skill.targetLevel) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{skill.timeToTarget}</div>
                      <div className="text-xs text-muted-foreground">Days to Target</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{skill.practiceHours}h</div>
                      <div className="text-xs text-muted-foreground">Practice Needed</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{skill.matchesNeeded}</div>
                      <div className="text-xs text-muted-foreground">Matches Needed</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Recommendations:</h5>
                    <ul className="space-y-1">
                      {skill.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Star className="w-3 h-3 mt-0.5 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Goals</h3>
              <Button onClick={onSetGoal} className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Set New Goal
              </Button>
            </div>

            <div className="space-y-4">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-l-4 p-4 border rounded-lg ${getPriorityColor(goal.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {goal.title}
                        <Badge variant="outline" className="text-xs">
                          {goal.category}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{Math.round((goal.progress / goal.target) * 100)}%</div>
                      <div className="text-muted-foreground">{formatTimeRemaining(goal.deadline)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}/{goal.target}</span>
                    </div>
                    <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Milestones:</h5>
                    <div className="flex flex-wrap gap-2">
                      {goal.milestones.map((milestone, i) => (
                        <Badge
                          key={i}
                          variant={milestone.completed ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {milestone.completed ? '✓' : '○'} {milestone.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="space-y-4">
              {comparisonData.map((data, index) => (
                <motion.div
                  key={data.metric}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{data.metric}</h4>
                    <Badge variant="outline">
                      Rank #{data.userRank} of {data.totalUsers.toLocaleString()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{data.userValue}</div>
                      <div className="text-xs text-muted-foreground">Your Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">{data.peerAverage}</div>
                      <div className="text-xs text-muted-foreground">Peer Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{data.topPercentile}</div>
                      <div className="text-xs text-muted-foreground">Top 10%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>vs Peer Average</span>
                      <span className={data.userValue > data.peerAverage ? 'text-green-600' : 'text-red-600'}>
                        {data.userValue > data.peerAverage ? '+' : ''}
                        {Math.round(((data.userValue - data.peerAverage) / data.peerAverage) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, (data.userValue / data.topPercentile) * 100)} 
                      className="h-2" 
                    />
                    <div className="text-xs text-muted-foreground">
                      Progress to top 10%: {Math.round((data.userValue / data.topPercentile) * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}