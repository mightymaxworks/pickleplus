/**
 * First Time User Guide Component
 * Progressive onboarding system for new users to discover key features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  ArrowRight,
  User,
  BarChart3,
  Users,
  Trophy,
  X,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: React.ReactNode;
  completed?: boolean;
}

export function FirstTimeUserGuide() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'complete-profile',
      title: language === 'zh-CN' ? '完善个人资料' : 'Complete Your Profile',
      description: language === 'zh-CN' ? '添加照片和个人信息，让其他球友了解你' : 'Add your photo and info so other players can get to know you',
      action: language === 'zh-CN' ? '编辑资料' : 'Edit Profile',
      path: '/profile',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'record-first-match',
      title: language === 'zh-CN' ? '记录第一场比赛' : 'Record Your First Match',
      description: language === 'zh-CN' ? '开始追踪你的比赛表现和进步' : 'Start tracking your match performance and progress',
      action: language === 'zh-CN' ? '记录比赛' : 'Record Match',
      path: '/matches',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'explore-features',
      title: language === 'zh-CN' ? '探索平台功能' : 'Explore Platform Features',
      description: language === 'zh-CN' ? '了解可用功能和即将推出的新特性' : 'Learn about available features and upcoming capabilities',
      action: language === 'zh-CN' ? '查看功能' : 'View Features',
      path: '/features',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'join-community',
      title: language === 'zh-CN' ? '加入社区' : 'Join a Community',
      description: language === 'zh-CN' ? '与其他匹克球爱好者联系和交流' : 'Connect with other pickleball enthusiasts',
      action: language === 'zh-CN' ? '浏览社区' : 'Browse Communities',
      path: '/communities',
      icon: <Users className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    if (!user) return;

    // Check if user is new (created within last 7 days)
    const userCreatedAt = new Date(user.createdAt || Date.now());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isNewUser = userCreatedAt > sevenDaysAgo;

    // Check if onboarding was already dismissed
    const onboardingDismissed = localStorage.getItem(`onboarding-dismissed-${user.id}`);
    
    if (isNewUser && !onboardingDismissed) {
      // Show onboarding after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    // Load completed steps from localStorage
    if (user?.id) {
      const completed = localStorage.getItem(`onboarding-completed-${user.id}`);
      if (completed) {
        setCompletedSteps(JSON.parse(completed));
      }
    }
  }, [user?.id]);

  const markStepCompleted = (stepId: string) => {
    const newCompleted = [...completedSteps, stepId];
    setCompletedSteps(newCompleted);
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, JSON.stringify(newCompleted));
    }
  };

  const dismissOnboarding = () => {
    setIsVisible(false);
    if (user?.id) {
      localStorage.setItem(`onboarding-dismissed-${user.id}`, 'true');
    }
  };

  const handleStepAction = (step: OnboardingStep) => {
    markStepCompleted(step.id);
    navigate(step.path);
    
    // Move to next step if not at the end
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismissOnboarding();
    }
  };

  const skipStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismissOnboarding();
    }
  };

  if (!isVisible || !user) return null;

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-blue-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full text-white">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'zh-CN' ? '欢迎来到 Pickle+' : 'Welcome to Pickle+'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'zh-CN' ? `步骤 ${currentStep + 1} / ${onboardingSteps.length}` : `Step ${currentStep + 1} of ${onboardingSteps.length}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissOnboarding}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Progress value={progress} className="mb-4" />

            <h4 className="font-semibold text-gray-900 mb-2">
              {step.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {step.description}
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => handleStepAction(step)}
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white flex-1"
              >
                {step.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={skipStep}
                className="text-gray-500 border-gray-200"
              >
                {language === 'zh-CN' ? '跳过' : 'Skip'}
              </Button>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-orange-500' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}