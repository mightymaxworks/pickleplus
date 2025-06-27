/**
 * Feature Navigation Integration Component
 * Creates better integration points for the /features page throughout the app
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, 
  ArrowRight, 
  BarChart3, 
  UserCheck, 
  Sparkles
} from 'lucide-react';

interface FeatureHighlight {
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
  path: string;
  icon: React.ReactNode;
}

export function FeatureNavIntegration() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const featuredHighlights: FeatureHighlight[] = [
    {
      title: language === 'zh-CN' ? '追踪进步' : 'Track Progress',
      description: language === 'zh-CN' ? '查看详细统计和评级' : 'View detailed stats and ratings',
      status: 'available',
      path: '/profile',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      title: language === 'zh-CN' ? '成为教练' : 'Become Coach',
      description: language === 'zh-CN' ? '申请认证教练' : 'Apply for certification',
      status: 'available',
      path: '/profile',
      icon: <UserCheck className="w-4 h-4" />
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            {language === 'zh-CN' ? '探索功能' : 'Explore Features'}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/features')}
            className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {language === 'zh-CN' ? '查看全部' : 'View All'}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Access to Available Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {language === 'zh-CN' ? '现已推出' : 'Ready to Use'}
          </h4>
          {featuredHighlights.map((feature, index) => (
            <motion.button
              key={feature.title}
              onClick={() => navigate(feature.path)}
              className="flex items-center justify-between w-full p-2 rounded-lg bg-white/70 hover:bg-white border border-green-200 hover:border-green-300 transition-all text-left"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2">
                <div className="text-green-600">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">
                    {feature.title}
                  </div>
                  <div className="text-xs text-green-600">
                    {feature.description}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3 h-3 text-green-600" />
            </motion.button>
          ))}
        </div>

        {/* Coming Soon Preview */}
        <div className="pt-2 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {language === 'zh-CN' ? '即将推出' : 'Coming Soon'}
            </h4>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
              3 {language === 'zh-CN' ? '功能' : 'features'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'zh-CN' 
              ? '日志记录、球友连接和比赛功能即将推出' 
              : 'Journaling, player connections, and tournaments coming soon'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile-optimized floating action button for feature discovery
export function MobileFeatureQuickAccess() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-30 md:hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.3 }}
    >
      <Button
        onClick={() => navigate('/features')}
        className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-lg rounded-full p-3"
        size="sm"
      >
        <Compass className="w-4 h-4 mr-1" />
        {language === 'zh-CN' ? '功能' : 'Features'}
      </Button>
    </motion.div>
  );
}