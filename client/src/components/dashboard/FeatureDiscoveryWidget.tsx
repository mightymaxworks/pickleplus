/**
 * Feature Discovery Widget
 * Prominent widget to help users discover available features vs coming soon
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  UserCheck, 
  BookOpen, 
  Users, 
  Trophy, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  status: 'available' | 'coming-soon';
  path: string;
}

export function FeatureDiscoveryWidget() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const features: Feature[] = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: language === 'zh-CN' ? '追踪进步' : 'Track Progress',
      status: 'available',
      path: '/profile'
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: language === 'zh-CN' ? '成为教练' : 'Become Coach',
      status: 'available',
      path: '/profile'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: language === 'zh-CN' ? '记录历程' : 'Journal Journey',
      status: 'coming-soon',
      path: '#'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: language === 'zh-CN' ? '连接球友' : 'Connect Players',
      status: 'coming-soon',
      path: '#'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: language === 'zh-CN' ? '参加比赛' : 'Join Tournaments',
      status: 'coming-soon',
      path: '#'
    }
  ];

  const availableFeatures = features.filter(f => f.status === 'available');
  const comingSoonFeatures = features.filter(f => f.status === 'coming-soon');

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-blue-50 border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            {language === 'zh-CN' ? '发现功能' : 'Discover Features'}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/features')}
            className="text-xs"
          >
            {language === 'zh-CN' ? '查看全部' : 'View All'}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Features */}
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {language === 'zh-CN' ? '现已推出' : 'Available Now'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableFeatures.map((feature, index) => (
              <motion.button
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/60 hover:bg-white border border-green-200 hover:border-green-300 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-green-600">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium text-green-700">
                  {feature.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            {language === 'zh-CN' ? '即将推出' : 'Coming Soon'}
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {comingSoonFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="text-gray-400">
                  {feature.icon}
                </div>
                <span className="text-xs text-gray-500 text-center">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}