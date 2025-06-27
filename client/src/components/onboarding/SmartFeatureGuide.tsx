/**
 * Smart Feature Guide Component
 * Contextual feature introduction based on user behavior and current page
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ArrowRight, 
  Target,
  Compass,
  CheckCircle
} from 'lucide-react';

interface FeatureGuide {
  id: string;
  triggerPath: string;
  title: string;
  description: string;
  action: string;
  targetPath: string;
  priority: number;
}

export function SmartFeatureGuide() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [activeGuide, setActiveGuide] = useState<FeatureGuide | null>(null);
  const [dismissedGuides, setDismissedGuides] = useState<string[]>([]);

  const featureGuides: FeatureGuide[] = [
    {
      id: 'profile-features',
      triggerPath: '/profile',
      title: language === 'zh-CN' ? '探索个人档案功能' : 'Explore Profile Features',
      description: language === 'zh-CN' ? '查看所有可用功能，包括进度追踪和教练申请' : 'See all available features including progress tracking and coach applications',
      action: language === 'zh-CN' ? '查看功能' : 'View Features',
      targetPath: '/features',
      priority: 1
    },
    {
      id: 'dashboard-discovery',
      triggerPath: '/dashboard',
      title: language === 'zh-CN' ? '发现平台功能' : 'Discover Platform Features',
      description: language === 'zh-CN' ? '了解现有功能和即将推出的新特性' : 'Learn about available features and upcoming capabilities',
      action: language === 'zh-CN' ? '探索功能' : 'Explore Features',
      targetPath: '/features',
      priority: 2
    },
    {
      id: 'community-intro',
      triggerPath: '/communities',
      title: language === 'zh-CN' ? '了解完整功能集' : 'Learn About Full Feature Set',
      description: language === 'zh-CN' ? '查看当前社区功能和其他可用特性' : 'See current community features and other available capabilities',
      action: language === 'zh-CN' ? '查看全部' : 'View All',
      targetPath: '/features',
      priority: 3
    }
  ];

  useEffect(() => {
    // Load dismissed guides from localStorage
    const dismissed = localStorage.getItem('dismissed-feature-guides');
    if (dismissed) {
      setDismissedGuides(JSON.parse(dismissed));
    }
  }, []);

  useEffect(() => {
    // Find relevant guide for current location
    const relevantGuides = featureGuides
      .filter(guide => 
        location === guide.triggerPath && 
        !dismissedGuides.includes(guide.id)
      )
      .sort((a, b) => a.priority - b.priority);

    if (relevantGuides.length > 0) {
      // Show guide after a brief delay to let page load
      const timer = setTimeout(() => {
        setActiveGuide(relevantGuides[0]);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setActiveGuide(null);
    }
  }, [location, dismissedGuides]);

  const dismissGuide = (guideId: string) => {
    const newDismissed = [...dismissedGuides, guideId];
    setDismissedGuides(newDismissed);
    localStorage.setItem('dismissed-feature-guides', JSON.stringify(newDismissed));
    setActiveGuide(null);
  };

  const handleAction = (guide: FeatureGuide) => {
    dismissGuide(guide.id);
    navigate(guide.targetPath);
  };

  if (!activeGuide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-24 right-4 z-50 w-80 max-w-[90vw]"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Compass className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-blue-700">
                  {language === 'zh-CN' ? '功能指南' : 'Feature Guide'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissGuide(activeGuide.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">
              {activeGuide.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {activeGuide.description}
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(activeGuide)}
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white flex-1"
              >
                <Target className="w-3 h-3 mr-1" />
                {activeGuide.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismissGuide(activeGuide.id)}
                className="text-gray-500"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {language === 'zh-CN' ? '知道了' : 'Got it'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}