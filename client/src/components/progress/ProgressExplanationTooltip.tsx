import { useState } from "react";
import { Info, TrendingUp, Target, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressExplanationTooltipProps {
  rating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  currentLevel?: string;
  nextLevel?: string;
  progressToNext?: number;
  className?: string;
}

interface RatingBreakdown {
  category: string;
  score: number;
  description: string;
  improvement: string;
}

export default function ProgressExplanationTooltip({
  rating,
  ratingType,
  currentLevel,
  nextLevel,
  progressToNext = 0,
  className = ""
}: ProgressExplanationTooltipProps) {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { t, language } = useLanguage();

  // Calculate rating context based on type
  const getRatingContext = () => {
    switch (ratingType) {
      case 'pcp':
        return {
          title: language === 'zh-CN' ? 'PCP 评级解释' : 'PCP Rating Explained',
          description: language === 'zh-CN' 
            ? 'PCP评级基于技术、战术、体能和心理四个维度的综合评估'
            : 'PCP rating is a comprehensive assessment across Technical, Tactical, Physical, and Mental dimensions',
          maxRating: 5.0,
          benchmarks: [
            { level: '1.0-2.0', description: language === 'zh-CN' ? '新手球员' : 'Beginner Player' },
            { level: '2.0-3.0', description: language === 'zh-CN' ? '休闲球员' : 'Recreational Player' },
            { level: '3.0-4.0', description: language === 'zh-CN' ? '中级球员' : 'Intermediate Player' },
            { level: '4.0-5.0', description: language === 'zh-CN' ? '高级球员' : 'Advanced Player' }
          ]
        };
      case 'dupr':
        return {
          title: language === 'zh-CN' ? 'DUPR 评级解释' : 'DUPR Rating Explained',
          description: language === 'zh-CN'
            ? 'DUPR是基于比赛结果的动态评级系统，考虑对手实力和比赛结果'
            : 'DUPR is a dynamic rating system based on match results, considering opponent strength and outcomes',
          maxRating: 8.0,
          benchmarks: [
            { level: '1.0-3.0', description: language === 'zh-CN' ? '新手到休闲' : 'Beginner to Recreational' },
            { level: '3.0-4.5', description: language === 'zh-CN' ? '中级球员' : 'Intermediate Player' },
            { level: '4.5-6.0', description: language === 'zh-CN' ? '高级球员' : 'Advanced Player' },
            { level: '6.0+', description: language === 'zh-CN' ? '专业球员' : 'Professional Player' }
          ]
        };
      case 'pickle_points':
        return {
          title: language === 'zh-CN' ? '泡菜积分解释' : 'Pickle Points Explained',
          description: language === 'zh-CN'
            ? '泡菜积分通过比赛胜利、训练参与和社区活动获得'
            : 'Pickle Points earned through match wins, training participation, and community activities',
          maxRating: 1000,
          benchmarks: [
            { level: '0-100', description: language === 'zh-CN' ? '新手' : 'Newcomer' },
            { level: '100-300', description: language === 'zh-CN' ? '活跃球员' : 'Active Player' },
            { level: '300-600', description: language === 'zh-CN' ? '经验丰富' : 'Experienced Player' },
            { level: '600+', description: language === 'zh-CN' ? '资深球员' : 'Veteran Player' }
          ]
        };
      default:
        return null;
    }
  };

  const context = getRatingContext();
  if (!context) return null;

  // Calculate PCP breakdown for detailed view
  const getPCPBreakdown = (): RatingBreakdown[] => {
    if (ratingType !== 'pcp') return [];
    
    // Simulate breakdown based on current rating (in real app, this would come from API)
    const baseScore = rating;
    return [
      {
        category: language === 'zh-CN' ? '技术能力' : 'Technical Skills',
        score: Math.min(5.0, baseScore * 1.1),
        description: language === 'zh-CN' ? '击球技术、发球、网前技巧' : 'Shot technique, serves, net play',
        improvement: language === 'zh-CN' ? '练习反手击球精度' : 'Practice backhand accuracy'
      },
      {
        category: language === 'zh-CN' ? '战术意识' : 'Tactical Awareness',
        score: Math.min(5.0, baseScore * 0.9),
        description: language === 'zh-CN' ? '比赛策略、定位、决策' : 'Game strategy, positioning, decision making',
        improvement: language === 'zh-CN' ? '学习第三拍攻击' : 'Learn third shot attack patterns'
      },
      {
        category: language === 'zh-CN' ? '体能状态' : 'Physical Fitness',
        score: Math.min(5.0, baseScore * 1.05),
        description: language === 'zh-CN' ? '移动、敏捷性、耐力' : 'Movement, agility, endurance',
        improvement: language === 'zh-CN' ? '提高场上移动速度' : 'Improve court movement speed'
      },
      {
        category: language === 'zh-CN' ? '心理素质' : 'Mental Game',
        score: Math.min(5.0, baseScore * 0.95),
        description: language === 'zh-CN' ? '专注力、压力处理、韧性' : 'Focus, pressure handling, resilience',
        improvement: language === 'zh-CN' ? '练习关键分处理' : 'Practice pressure point management'
      }
    ];
  };

  const breakdown = getPCPBreakdown();

  // Get current level description
  const getCurrentLevelDescription = () => {
    const benchmark = context.benchmarks.find(b => {
      const [min, max] = b.level.split('-').map(v => parseFloat(v.replace('+', '')));
      return rating >= min && (max ? rating <= max : true);
    });
    return benchmark?.description || (language === 'zh-CN' ? '评估中' : 'Evaluating');
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (ratingType === 'pickle_points') {
      // For points, calculate based on next tier
      const currentTier = Math.floor(rating / 100) * 100;
      const nextTier = currentTier + 100;
      return ((rating - currentTier) / 100) * 100;
    } else {
      // For ratings, calculate based on next 0.5 increment
      const currentIncrement = Math.floor(rating * 2) / 2;
      const nextIncrement = currentIncrement + 0.5;
      return ((rating - currentIncrement) / 0.5) * 100;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-6 w-6 hover:bg-blue-50 ${className}`}
          >
            <Info className="h-3 w-3 text-blue-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="text-sm font-medium">{context.title}</div>
            <div className="text-xs text-muted-foreground">{context.description}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getCurrentLevelDescription()}
              </Badge>
              <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                    {language === 'zh-CN' ? '详细信息' : 'Details'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {context.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Current Rating Overview */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          {language === 'zh-CN' ? '当前水平' : 'Current Level'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{rating.toFixed(1)}</div>
                            <div className="text-sm text-muted-foreground">{getCurrentLevelDescription()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              {language === 'zh-CN' ? '进度到下一级' : 'Progress to Next Level'}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {getProgressPercentage().toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PCP Breakdown (only for PCP ratings) */}
                    {ratingType === 'pcp' && breakdown.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {language === 'zh-CN' ? '技能分解' : 'Skill Breakdown'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {breakdown.map((item, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{item.category}</span>
                                  <Badge variant="outline">{item.score.toFixed(1)}/5.0</Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${(item.score / 5.0) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                                <div className="text-xs text-blue-600 font-medium">
                                  💡 {item.improvement}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Level Benchmarks */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          {language === 'zh-CN' ? '水平对照' : 'Level Benchmarks'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {context.benchmarks.map((benchmark, index) => (
                            <div 
                              key={index} 
                              className={`flex justify-between items-center p-3 rounded-lg border ${
                                getCurrentLevelDescription() === benchmark.description 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div>
                                <div className="font-medium text-sm">{benchmark.level}</div>
                                <div className="text-xs text-muted-foreground">{benchmark.description}</div>
                              </div>
                              {getCurrentLevelDescription() === benchmark.description && (
                                <Badge className="bg-blue-600">
                                  {language === 'zh-CN' ? '当前' : 'Current'}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}