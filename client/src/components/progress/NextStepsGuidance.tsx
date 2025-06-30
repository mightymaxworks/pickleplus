import { ArrowRight, BookOpen, Users, Trophy, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

interface NextStepsGuidanceProps {
  currentRating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  userLevel: string;
  completedActions: string[];
  className?: string;
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  icon: typeof BookOpen;
  estimatedTime: string;
}

export default function NextStepsGuidance({
  currentRating,
  ratingType,
  userLevel,
  completedActions = [],
  className = ""
}: NextStepsGuidanceProps) {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  // Generate personalized next steps based on rating and level
  const getNextSteps = (): NextStep[] => {
    const isBeginnerLevel = currentRating < 2.5;
    const isIntermediateLevel = currentRating >= 2.5 && currentRating < 4.0;
    const isAdvancedLevel = currentRating >= 4.0;

    const baseSteps: NextStep[] = [];

    // Beginner-focused recommendations
    if (isBeginnerLevel) {
      baseSteps.push({
        id: 'record_first_match',
        title: language === 'zh-CN' ? '记录你的第一场比赛' : 'Record Your First Match',
        description: language === 'zh-CN' 
          ? '开始跟踪你的比赛表现，了解自己的优势和需要改进的地方'
          : 'Start tracking your match performance to understand your strengths and areas for improvement',
        actionText: language === 'zh-CN' ? '记录比赛' : 'Record Match',
        route: '/match/record',
        priority: 'high',
        impact: language === 'zh-CN' ? '+0.1 PCP 评级' : '+0.1 PCP Rating',
        icon: Trophy,
        estimatedTime: language === 'zh-CN' ? '5分钟' : '5 minutes'
      });

      baseSteps.push({
        id: 'join_training_center',
        title: language === 'zh-CN' ? '参加训练课程' : 'Join a Training Class',
        description: language === 'zh-CN'
          ? '通过专业指导快速提升基础技能和比赛策略'
          : 'Improve fundamental skills and game strategy through professional guidance',
        actionText: language === 'zh-CN' ? '浏览课程' : 'Browse Classes',
        route: '/training-center',
        priority: 'high',
        impact: language === 'zh-CN' ? '技能提升' : 'Skill Boost',
        icon: BookOpen,
        estimatedTime: language === 'zh-CN' ? '2小时' : '2 hours'
      });
    }

    // Intermediate-focused recommendations
    if (isIntermediateLevel) {
      baseSteps.push({
        id: 'find_practice_partner',
        title: language === 'zh-CN' ? '寻找练习伙伴' : 'Find Practice Partners',
        description: language === 'zh-CN'
          ? '与相似水平的球员定期练习，提高比赛经验'
          : 'Regular practice with similar-level players to gain match experience',
        actionText: language === 'zh-CN' ? '搜索球员' : 'Find Players',
        route: '/community',
        priority: 'high',
        impact: language === 'zh-CN' ? '比赛经验' : 'Match Experience',
        icon: Users,
        estimatedTime: language === 'zh-CN' ? '10分钟' : '10 minutes'
      });

      baseSteps.push({
        id: 'analyze_weaknesses',
        title: language === 'zh-CN' ? '分析技能弱点' : 'Analyze Skill Weaknesses',
        description: language === 'zh-CN'
          ? '深入了解你的PCP评级细分，专注改进最弱的技能领域'
          : 'Deep dive into your PCP rating breakdown and focus on improving weakest skill areas',
        actionText: language === 'zh-CN' ? '查看分析' : 'View Analysis',
        route: '/dashboard',
        priority: 'medium',
        impact: language === 'zh-CN' ? '定向提升' : 'Targeted Improvement',
        icon: Zap,
        estimatedTime: language === 'zh-CN' ? '15分钟' : '15 minutes'
      });
    }

    // Advanced-focused recommendations
    if (isAdvancedLevel) {
      baseSteps.push({
        id: 'become_coach',
        title: language === 'zh-CN' ? '申请成为教练' : 'Apply to Become a Coach',
        description: language === 'zh-CN'
          ? '分享你的经验，帮助新手球员同时提升自己的教学技能'
          : 'Share your expertise while developing teaching skills and earning income',
        actionText: language === 'zh-CN' ? '申请教练' : 'Apply as Coach',
        route: '/coach/apply',
        priority: 'medium',
        impact: language === 'zh-CN' ? '收入+声誉' : 'Income + Reputation',
        icon: BookOpen,
        estimatedTime: language === 'zh-CN' ? '20分钟' : '20 minutes'
      });

      baseSteps.push({
        id: 'tournament_competition',
        title: language === 'zh-CN' ? '参加锦标赛' : 'Enter Tournament Competition',
        description: language === 'zh-CN'
          ? '在正式比赛中测试你的技能，获得官方排名认证'
          : 'Test your skills in formal competition and earn official ranking recognition',
        actionText: language === 'zh-CN' ? '查看锦标赛' : 'View Tournaments',
        route: '/tournaments',
        priority: 'high',
        impact: language === 'zh-CN' ? 'DUPR认证' : 'DUPR Recognition',
        icon: Trophy,
        estimatedTime: language === 'zh-CN' ? '半天' : 'Half Day'
      });
    }

    // Universal recommendations for all levels
    baseSteps.push({
      id: 'join_community',
      title: language === 'zh-CN' ? '加入本地社区' : 'Join Local Community',
      description: language === 'zh-CN'
        ? '与附近的球员建立联系，参与社区活动和非正式比赛'
        : 'Connect with nearby players and participate in community events and casual matches',
      actionText: language === 'zh-CN' ? '探索社区' : 'Explore Communities',
      route: '/communities',
      priority: 'medium',
      impact: language === 'zh-CN' ? '社交网络' : 'Social Network',
      icon: Users,
      estimatedTime: language === 'zh-CN' ? '10分钟' : '10 minutes'
    });

    // Filter out already completed actions
    return baseSteps.filter(step => !completedActions.includes(step.id));
  };

  const nextSteps = getNextSteps();
  const highPrioritySteps = nextSteps.filter(step => step.priority === 'high');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStepClick = (route: string) => {
    navigate(route);
  };

  if (nextSteps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Trophy className="h-12 w-12 text-gold-500 mx-auto" />
            <h3 className="text-lg font-semibold">
              {language === 'zh-CN' ? '恭喜！' : 'Congratulations!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'zh-CN' 
                ? '你已经完成了所有推荐的下一步行动。继续保持出色的表现！'
                : 'You\'ve completed all recommended next steps. Keep up the excellent progress!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-blue-600" />
          {language === 'zh-CN' ? '建议的下一步' : 'Recommended Next Steps'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'zh-CN' 
            ? `基于你的${userLevel}水平定制的个性化建议`
            : `Personalized recommendations based on your ${userLevel} level`
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* High Priority Section */}
          {highPrioritySteps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600">
                  {language === 'zh-CN' ? '高优先级' : 'High Priority'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {language === 'zh-CN' ? '最大影响的行动' : 'Highest impact actions'}
                </span>
              </div>
              {highPrioritySteps.map((step) => (
                <div 
                  key={step.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleStepClick(step.route)}
                >
                  <div className="flex items-start gap-3">
                    <step.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(step.priority)}>
                          {step.estimatedTime}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">
                          {language === 'zh-CN' ? '预期影响' : 'Expected Impact'}: {step.impact}
                        </span>
                        <Button size="sm" variant="outline">
                          {step.actionText}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Priority Steps */}
          {nextSteps.filter(step => step.priority !== 'high').length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {language === 'zh-CN' ? '其他建议' : 'Other Suggestions'}
                </Badge>
              </div>
              <div className="grid gap-3">
                {nextSteps.filter(step => step.priority !== 'high').map((step) => (
                  <div 
                    key={step.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleStepClick(step.route)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm">{step.title}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs h-6">
                        {step.actionText}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}