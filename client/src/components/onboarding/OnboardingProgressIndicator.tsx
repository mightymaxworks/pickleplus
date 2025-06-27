/**
 * Onboarding Progress Indicator
 * 
 * Subtle progress indicator that appears in the dashboard header
 * showing new users their setup progress without being intrusive.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingProgressIndicatorProps {
  onShowFullOnboarding?: () => void;
}

export function OnboardingProgressIndicator({ onShowFullOnboarding }: OnboardingProgressIndicatorProps) {
  const { user } = useAuth();
  const { language } = useLanguage();

  if (!user) return null;

  // Check if user is new (created within last 14 days)
  const userCreatedAt = new Date(user.createdAt || Date.now());
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const isNewUser = userCreatedAt > twoWeeksAgo;

  // Check if onboarding was dismissed
  const onboardingDismissed = localStorage.getItem(`onboarding-dismissed-${user.id}`);
  
  if (!isNewUser || onboardingDismissed) return null;

  // Quick completion checks
  const hasBasicProfile = !!(user?.firstName && user?.lastName && user?.location);
  const hasSkillRating = !!(user?.skillLevel || user?.duprRating);
  const hasAvatar = !!(user?.avatarUrl);

  const completedSteps = [hasBasicProfile, hasSkillRating, hasAvatar].filter(Boolean).length;
  const totalSteps = 3;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Don't show if all essential steps completed
  if (completedSteps === totalSteps) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {completedSteps}/{totalSteps}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {language === 'zh-CN' ? '完善您的资料' : 'Complete Your Setup'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'zh-CN' 
                      ? `还有 ${totalSteps - completedSteps} 个步骤完成设置` 
                      : `${totalSteps - completedSteps} steps remaining`
                    }
                  </p>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="hidden sm:flex items-center gap-2 ml-4">
                {[hasBasicProfile, hasSkillRating, hasAvatar].map((completed, index) => (
                  <div key={index} className="flex items-center">
                    {completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                    {index < 2 && <ChevronRight className="w-3 h-3 text-gray-300 mx-1" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {Math.round(progressPercentage)}%
              </Badge>
              <Button 
                size="sm" 
                onClick={onShowFullOnboarding}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {language === 'zh-CN' ? '继续设置' : 'Continue Setup'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}