/**
 * Progressive Discovery Component
 * Guides users through feature discovery based on their usage patterns
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  Lightbulb,
  Target,
  Users,
  BookOpen
} from 'lucide-react';

interface DiscoveryStep {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: React.ReactNode;
  trigger: string; // What triggers this suggestion
  priority: number;
}

export function ProgressiveDiscovery() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [currentSuggestion, setCurrentSuggestion] = useState<DiscoveryStep | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  const discoverySteps: DiscoveryStep[] = [
    {
      id: 'features-exploration',
      title: language === 'zh-CN' ? '探索所有功能' : 'Explore All Features',
      description: language === 'zh-CN' ? '查看可用功能和即将推出的新特性' : 'See what\'s available now and what\'s coming soon',
      action: language === 'zh-CN' ? '查看功能' : 'View Features',
      path: '/features',
      icon: <Lightbulb className="w-5 h-5" />,
      trigger: 'first-visit',
      priority: 1
    },
    {
      id: 'profile-setup',
      title: language === 'zh-CN' ? '完善个人档案' : 'Complete Your Profile',
      description: language === 'zh-CN' ? '设置头像和个人信息来开始您的旅程' : 'Set up your avatar and personal info to get started',
      action: language === 'zh-CN' ? '编辑档案' : 'Edit Profile',
      path: '/profile',
      icon: <Target className="w-5 h-5" />,
      trigger: 'incomplete-profile',
      priority: 2
    },
    {
      id: 'community-join',
      title: language === 'zh-CN' ? '加入社区' : 'Join Communities',
      description: language === 'zh-CN' ? '与其他球员连接并参与讨论' : 'Connect with other players and join discussions',
      action: language === 'zh-CN' ? '探索社区' : 'Explore Communities',
      path: '/communities',
      icon: <Users className="w-5 h-5" />,
      trigger: 'no-community-activity',
      priority: 3
    },
    {
      id: 'coach-application',
      title: language === 'zh-CN' ? '申请成为教练' : 'Apply to Be a Coach',
      description: language === 'zh-CN' ? '分享您的专业知识并帮助其他球员' : 'Share your expertise and help other players grow',
      action: language === 'zh-CN' ? '了解更多' : 'Learn More',
      path: '/features', // Will scroll to coach section
      icon: <BookOpen className="w-5 h-5" />,
      trigger: 'experienced-player',
      priority: 4
    }
  ];

  useEffect(() => {
    // Load dismissed suggestions from localStorage
    const dismissed = localStorage.getItem('dismissed-suggestions');
    if (dismissed) {
      setDismissedSuggestions(JSON.parse(dismissed));
    }

    // Determine which suggestion to show based on user state
    // This is a simplified version - in production, you'd check actual user data
    const availableSteps = discoverySteps
      .filter(step => !dismissedSuggestions.includes(step.id))
      .sort((a, b) => a.priority - b.priority);

    if (availableSteps.length > 0) {
      // Show the highest priority suggestion
      setCurrentSuggestion(availableSteps[0]);
    }
  }, [dismissedSuggestions]);

  const dismissSuggestion = (suggestionId: string) => {
    const newDismissed = [...dismissedSuggestions, suggestionId];
    setDismissedSuggestions(newDismissed);
    localStorage.setItem('dismissed-suggestions', JSON.stringify(newDismissed));
    setCurrentSuggestion(null);
  };

  const handleAction = (step: DiscoveryStep) => {
    dismissSuggestion(step.id);
    navigate(step.path);
  };

  if (!currentSuggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-40 w-80 max-w-[90vw]"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  {currentSuggestion.icon}
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {language === 'zh-CN' ? '提示' : 'Tip'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSuggestion(currentSuggestion.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">
              {currentSuggestion.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {currentSuggestion.description}
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(currentSuggestion)}
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white"
              >
                {currentSuggestion.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismissSuggestion(currentSuggestion.id)}
                className="text-gray-500"
              >
                {language === 'zh-CN' ? '稍后' : 'Later'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}