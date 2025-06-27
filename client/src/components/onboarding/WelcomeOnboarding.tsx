/**
 * Welcome Onboarding Component
 * 
 * Progressive onboarding system for new users that guides them through
 * initial setup and introduces core platform features.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  User,
  Award,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  X,
  Target,
  Trophy,
  Building2,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  action: string;
  path?: string;
  icon: React.ReactNode;
  color: string;
  benefit: string;
  isCompleted: () => boolean;
  priority: 'essential' | 'recommended' | 'optional';
}

interface WelcomeOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
  forceShow?: boolean;
}

export function WelcomeOnboarding({ onComplete, onSkip, forceShow = false }: WelcomeOnboardingProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Define onboarding steps with dynamic completion checks
  const steps: OnboardingStep[] = [
    {
      id: 'profile_basics',
      title: language === 'zh-CN' ? '完善个人资料' : 'Complete Your Profile',
      description: language === 'zh-CN' ? '添加您的基本信息和照片' : 'Add your basic information and photo',
      detailedDescription: language === 'zh-CN' 
        ? '完整的个人资料让其他球员更容易找到您，也有助于教练了解您的技能水平。添加一张照片，填写您的经验水平和位置信息。'
        : 'A complete profile helps other players find you and coaches understand your skill level. Add a photo, fill in your experience level, and location information.',
      action: language === 'zh-CN' ? '完善资料' : 'Complete Profile',
      path: '/profile',
      icon: <User className="w-5 h-5" />,
      color: 'bg-blue-500',
      benefit: language === 'zh-CN' ? '提高配对成功率' : 'Increase match success rate',
      isCompleted: () => !!(user?.firstName && user?.lastName && user?.location),
      priority: 'essential'
    },
    {
      id: 'skill_rating',
      title: language === 'zh-CN' ? '设置技能等级' : 'Set Your Skill Rating',
      description: language === 'zh-CN' ? '选择您的匹克球技能等级' : 'Choose your pickleball skill level',
      detailedDescription: language === 'zh-CN'
        ? '准确的技能等级有助于匹配合适的对手和训练机会。我们支持多种评级系统，包括DUPR、PPA和传统的2.0-5.0评级。'
        : 'Accurate skill ratings help match you with appropriate opponents and training opportunities. We support multiple rating systems including DUPR, PPA, and traditional 2.0-5.0 ratings.',
      action: language === 'zh-CN' ? '设置等级' : 'Set Rating',
      path: '/profile',
      icon: <Award className="w-5 h-5" />,
      color: 'bg-purple-500',
      benefit: language === 'zh-CN' ? '找到合适的对手' : 'Find suitable opponents',
      isCompleted: () => !!(user?.skillLevel || user?.duprRating),
      priority: 'essential'
    },
    {
      id: 'first_match',
      title: language === 'zh-CN' ? '记录首场比赛' : 'Record Your First Match',
      description: language === 'zh-CN' ? '开始追踪您的比赛表现' : 'Start tracking your match performance',
      detailedDescription: language === 'zh-CN'
        ? '记录比赛帮助您追踪进步并建立竞技历史。您可以记录与朋友的友谊赛，正式比赛，或训练对抗。'
        : 'Recording matches helps you track improvement and build competitive history. You can log friendly games with friends, official matches, or training sessions.',
      action: language === 'zh-CN' ? '记录比赛' : 'Record Match',
      path: '/matches',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-green-500',
      benefit: language === 'zh-CN' ? '追踪进步' : 'Track your improvement',
      isCompleted: () => false, // We'll check this via API later
      priority: 'recommended'
    },
    {
      id: 'explore_coaching',
      title: language === 'zh-CN' ? '探索教练服务' : 'Explore Coaching',
      description: language === 'zh-CN' ? '发现专业教练和训练机会' : 'Discover professional coaches and training opportunities',
      detailedDescription: language === 'zh-CN'
        ? '我们的认证教练可以帮助您提高技能。浏览教练档案，查看专业资质，并预约适合您水平的训练课程。'
        : 'Our certified coaches can help improve your skills. Browse coach profiles, view their credentials, and book training sessions suited to your level.',
      action: language === 'zh-CN' ? '查看教练' : 'Find Coaches',
      path: '/find-coaches',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-orange-500',
      benefit: language === 'zh-CN' ? '专业指导' : 'Professional guidance',
      isCompleted: () => false,
      priority: 'recommended'
    },
    {
      id: 'join_community',
      title: language === 'zh-CN' ? '加入社区' : 'Join a Community',
      description: language === 'zh-CN' ? '与当地球员建立联系' : 'Connect with local players',
      detailedDescription: language === 'zh-CN'
        ? '社区是结识新球友，参加群组活动和本地比赛的最佳方式。加入基于位置或兴趣的社区。'
        : 'Communities are the best way to meet new players, join group activities, and participate in local tournaments. Join location-based or interest-based communities.',
      action: language === 'zh-CN' ? '浏览社区' : 'Browse Communities',
      path: '/communities',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-indigo-500',
      benefit: language === 'zh-CN' ? '扩大社交圈' : 'Expand your network',
      isCompleted: () => false,
      priority: 'optional'
    }
  ];

  // Calculate progress
  const completedCount = steps.filter(step => step.isCompleted()).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  // Check if user should see onboarding
  useEffect(() => {
    if (!user) return;

    // Check if user is new (created within last 14 days)
    const userCreatedAt = new Date(user.createdAt || Date.now());
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const isNewUser = userCreatedAt > twoWeeksAgo;

    // Check if onboarding was dismissed
    const onboardingDismissed = localStorage.getItem(`onboarding-dismissed-${user.id}`);
    
    // Don't show if user has completed essential steps
    const essentialSteps = steps.filter(s => s.priority === 'essential');
    const essentialCompleted = essentialSteps.every(step => step.isCompleted());
    
    if (!forceShow && (!isNewUser || onboardingDismissed || essentialCompleted)) {
      setIsVisible(false);
    }
  }, [user, steps]);

  const handleStepAction = (step: OnboardingStep) => {
    if (step.path) {
      navigate(step.path);
    }
    // Mark step as attempted
    const attempted = localStorage.getItem(`onboarding-attempted-${user?.id}`) || '[]';
    const attemptedSteps = JSON.parse(attempted);
    if (!attemptedSteps.includes(step.id)) {
      attemptedSteps.push(step.id);
      localStorage.setItem(`onboarding-attempted-${user?.id}`, JSON.stringify(attemptedSteps));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding-dismissed-${user.id}`, 'true');
    }
    setIsVisible(false);
    onSkip?.();
  };

  const handleCompleteOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, new Date().toISOString());
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || !user) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full mx-4 my-4 md:my-8 shadow-2xl mobile-modal-container flex flex-col max-h-[95vh] md:max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleSkipOnboarding}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'zh-CN' ? '欢迎来到 Pickle+' : 'Welcome to Pickle+'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'zh-CN' ? '让我们帮您开始匹克球之旅' : "Let's get you started on your pickleball journey"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'zh-CN' ? '设置进度' : 'Setup Progress'}
                </span>
                <span className="font-medium">{completedCount}/{totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Current Step Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${currentStepData.color} flex items-center justify-center text-white flex-shrink-0`}>
                  {currentStepData.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-semibold">{currentStepData.title}</h3>
                    <Badge variant={
                      currentStepData.priority === 'essential' ? 'destructive' :
                      currentStepData.priority === 'recommended' ? 'default' : 'secondary'
                    } className="text-xs">
                      {currentStepData.priority === 'essential' ? 
                        (language === 'zh-CN' ? '必需' : 'Essential') :
                      currentStepData.priority === 'recommended' ?
                        (language === 'zh-CN' ? '推荐' : 'Recommended') :
                        (language === 'zh-CN' ? '可选' : 'Optional')
                      }
                    </Badge>
                    {currentStepData.isCompleted() && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2">
                    {currentStepData.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {currentStepData.benefit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <Card className="mb-4">
                <CardContent className="p-3 md:p-4">
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentStepData.detailedDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="mb-4">
                <Button
                  onClick={() => handleStepAction(currentStepData)}
                  className={`w-full text-sm md:text-base ${currentStepData.color.replace('bg-', 'bg-')} hover:opacity-90`}
                  size="default"
                  disabled={currentStepData.isCompleted()}
                >
                  {currentStepData.isCompleted() ? (
                    <>
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      {language === 'zh-CN' ? '已完成' : 'Completed'}
                    </>
                  ) : (
                    <>
                      {currentStepData.action}
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Step Navigator */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{language === 'zh-CN' ? '上一步' : 'Previous'}</span>
                  <span className="sm:hidden">{language === 'zh-CN' ? '上' : 'Prev'}</span>
                </Button>

                <div className="flex gap-1 md:gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-blue-500'
                          : index < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {currentStep === steps.length - 1 ? (
                  <Button 
                    onClick={handleCompleteOnboarding}
                    size="sm"
                    className="text-xs md:text-sm"
                  >
                    <span className="hidden sm:inline">{language === 'zh-CN' ? '完成设置' : 'Finish Setup'}</span>
                    <span className="sm:hidden">{language === 'zh-CN' ? '完成' : 'Finish'}</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    size="sm"
                    className="text-xs md:text-sm"
                  >
                    <span className="hidden sm:inline">{language === 'zh-CN' ? '下一步' : 'Next'}</span>
                    <span className="sm:hidden">{language === 'zh-CN' ? '下' : 'Next'}</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'zh-CN' ? 
                  '您可以随时在设置中重新访问此向导' : 
                  'You can revisit this guide anytime in settings'
                }
              </span>
              <Button variant="ghost" size="sm" onClick={handleSkipOnboarding}>
                {language === 'zh-CN' ? '跳过向导' : 'Skip Guide'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}