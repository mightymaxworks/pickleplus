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
  isOnboardingVisible?: boolean;
  setIsOnboardingVisible?: (visible: boolean) => void;
}

export function WelcomeOnboarding({ 
  onComplete, 
  onSkip, 
  forceShow = false,
  isOnboardingVisible = true,
  setIsOnboardingVisible 
}: WelcomeOnboardingProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOnboardingVisible);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Define onboarding steps with dynamic completion checks
  const steps: OnboardingStep[] = [
    {
      id: 'profile-setup',
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
      id: 'pcp-rating',
      title: language === 'zh-CN' ? '设置PCP等级' : 'Set Your PCP Rating',
      description: language === 'zh-CN' ? '获得官方PCP技能评级' : 'Get your official PCP skill rating',
      detailedDescription: language === 'zh-CN'
        ? 'PCP（Player Coaching Passport）评级是我们的官方技能评估系统。通过综合评估技术、战术、体能和心理四个维度来确定您的技能水平。'
        : 'PCP (Player Coaching Passport) rating is our official skill assessment system. It evaluates your skill level through comprehensive assessment of technical, tactical, physical, and mental dimensions.',
      action: language === 'zh-CN' ? '获得PCP评级' : 'Get PCP Rating',
      path: '/pcp-rating',
      icon: <Award className="w-5 h-5" />,
      color: 'bg-purple-500',
      benefit: language === 'zh-CN' ? '获得专业认证' : 'Get professional certification',
      isCompleted: () => !!(user?.skillLevel || user?.duprRating),
      priority: 'essential'
    },
    {
      id: 'coach-application',
      title: language === 'zh-CN' ? '申请成为教练' : 'Apply to Become a Coach',
      description: language === 'zh-CN' ? '分享您的专业知识，教授其他球员' : 'Share your expertise and teach other players',
      detailedDescription: language === 'zh-CN'
        ? '如果您有丰富的匹克球经验，可以申请成为认证教练。通过我们的5步申请流程，您可以开始教授学员并赚取收入。'
        : 'If you have extensive pickleball experience, you can apply to become a certified coach. Through our 5-step application process, you can start teaching students and earn income.',
      action: language === 'zh-CN' ? '申请教练' : 'Apply as Coach',
      path: '/coach-application',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-orange-500',
      benefit: language === 'zh-CN' ? '获得额外收入' : 'Earn additional income',
      isCompleted: () => false,
      priority: 'recommended'
    },
    {
      id: 'drills-exploration',
      title: language === 'zh-CN' ? '探索训练课程' : 'Explore Training Drills',
      description: language === 'zh-CN' ? '发现提高技能的训练方法' : 'Discover training methods to improve skills',
      detailedDescription: language === 'zh-CN'
        ? '我们的训练库包含数百个专业设计的练习，涵盖各个技能水平。从基础技术到高级战术，找到适合您的训练计划。'
        : 'Our drill library contains hundreds of professionally designed exercises covering all skill levels. From basic techniques to advanced tactics, find training programs that suit you.',
      action: language === 'zh-CN' ? '浏览训练' : 'Browse Drills',
      path: '/drills',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-green-500',
      benefit: language === 'zh-CN' ? '系统化提升' : 'Systematic improvement',
      isCompleted: () => false,
      priority: 'recommended'
    },
    {
      id: 'community-joining',
      title: language === 'zh-CN' ? '加入社区' : 'Join a Community',
      description: language === 'zh-CN' ? '与当地球员建立联系' : 'Connect with local players',
      detailedDescription: language === 'zh-CN'
        ? '社区是结识新球友，参加群组活动和本地比赛的最佳方式。加入基于位置或兴趣的社区，扩大您的匹克球社交圈。'
        : 'Communities are the best way to meet new players, join group activities, and participate in local tournaments. Join location-based or interest-based communities to expand your pickleball network.',
      action: language === 'zh-CN' ? '浏览社区' : 'Browse Communities',
      path: '/communities',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-indigo-500',
      benefit: language === 'zh-CN' ? '扩大社交圈' : 'Expand your network',
      isCompleted: () => false,
      priority: 'recommended'
    },
    {
      id: 'pcp-certification',
      title: language === 'zh-CN' ? 'PCP认证计划' : 'PCP Certification Program',
      description: language === 'zh-CN' ? '获得专业教练认证' : 'Get professional coaching certification',
      detailedDescription: language === 'zh-CN'
        ? 'PCP认证计划是业界领先的教练培训项目。通过5个级别的在线学习和实践评估，获得国际认可的教练资格证书。'
        : 'The PCP Certification Program is the industry-leading coach training program. Through 5 levels of online learning and practical assessment, earn internationally recognized coaching credentials.',
      action: language === 'zh-CN' ? '开始认证' : 'Start Certification',
      path: '/pcp-certification',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-pink-500',
      benefit: language === 'zh-CN' ? '专业资质认证' : 'Professional credential',
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
    setIsOnboardingVisible?.(false);
    onSkip?.();
  };

  const handleCompleteOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, new Date().toISOString());
    }
    setIsVisible(false);
    setIsOnboardingVisible?.(false);
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
          className="bg-white dark:bg-gray-900 rounded-lg md:rounded-2xl max-w-2xl w-full mx-2 md:mx-4 my-2 md:my-8 shadow-2xl mobile-modal-container flex flex-col h-[90vh] md:max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-3 md:p-6 border-b border-gray-200 dark:border-gray-700 relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 md:top-4 md:right-4 h-8 w-8"
              onClick={handleSkipOnboarding}
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">
                  {language === 'zh-CN' ? '欢迎来到 Pickle+' : 'Welcome to Pickle+'}
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {language === 'zh-CN' ? '让我们帮您开始匹克球之旅' : "Let's get you started on your pickleball journey"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'zh-CN' ? '设置进度' : 'Setup Progress'}
                </span>
                <span className="font-medium">{completedCount}/{totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-1 md:h-2" />
            </div>
          </div>

          {/* Current Step Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6">
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
              <Card className="mb-3">
                <CardContent className="p-2 md:p-4">
                  <p className="text-xs md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
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