/**
 * UX Gap Solutions Component
 * Addresses critical user journey gaps identified in the platform
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Users,
  Calendar,
  Trophy,
  Bell,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';

interface UXGap {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'identified' | 'in-progress' | 'solution-ready';
  action: string;
  path: string;
  icon: React.ReactNode;
}

export function UXGapSolutions() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const identifiedGaps: UXGap[] = [
    {
      id: 'notifications-missing',
      title: language === 'zh-CN' ? '缺失通知系统' : 'Missing Notifications System',
      description: language === 'zh-CN' ? '用户无法接收重要更新和提醒' : 'Users cannot receive important updates and alerts',
      severity: 'high',
      status: 'solution-ready',
      action: language === 'zh-CN' ? '查看功能状态' : 'View Feature Status',
      path: '/features',
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: 'player-discovery',
      title: language === 'zh-CN' ? '球员发现断层' : 'Player Discovery Gap',
      description: language === 'zh-CN' ? '记录比赛后无法轻松找到对手' : 'No easy way to find opponents after recording matches',
      severity: 'high',
      status: 'solution-ready',
      action: language === 'zh-CN' ? '浏览社区' : 'Browse Communities',
      path: '/communities',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'tournament-isolation',
      title: language === 'zh-CN' ? '比赛功能孤立' : 'Tournament Feature Isolation',
      description: language === 'zh-CN' ? '比赛功能与比赛记录系统分离' : 'Tournament features disconnected from match recording',
      severity: 'medium',
      status: 'identified',
      action: language === 'zh-CN' ? '查看即将推出' : 'View Coming Soon',
      path: '/features',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'coaching-booking-gap',
      title: language === 'zh-CN' ? '教练预约缺口' : 'Coach Booking Gap',
      description: language === 'zh-CN' ? '可以申请成为教练但缺少完整的预约系统' : 'Can apply to become coach but missing complete booking system',
      severity: 'medium',
      status: 'in-progress',
      action: language === 'zh-CN' ? '查看教练功能' : 'View Coach Features',
      path: '/profile',
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solution-ready': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'identified': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleGapAction = (gap: UXGap) => {
    navigate(gap.path);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          {language === 'zh-CN' ? 'UX优化机会' : 'UX Improvement Opportunities'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {language === 'zh-CN' 
            ? '已识别的用户体验改进点和解决方案' 
            : 'Identified user experience gaps and available solutions'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {identifiedGaps.map((gap, index) => (
          <motion.div
            key={gap.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                  {gap.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{gap.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                </div>
              </div>
              {getStatusIcon(gap.status)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className={getSeverityColor(gap.severity)}>
                  {language === 'zh-CN' ? 
                    (gap.severity === 'high' ? '高优先级' : 
                     gap.severity === 'medium' ? '中优先级' : '低优先级') :
                    gap.severity.charAt(0).toUpperCase() + gap.severity.slice(1)
                  }
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {language === 'zh-CN' ? 
                    (gap.status === 'solution-ready' ? '解决方案就绪' :
                     gap.status === 'in-progress' ? '进行中' : '已识别') :
                    gap.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  }
                </Badge>
              </div>

              <Button
                size="sm"
                onClick={() => handleGapAction(gap)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {gap.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </motion.div>
        ))}

        {/* Summary Stats */}
        <div className="pt-4 border-t border-orange-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">
                {identifiedGaps.filter(g => g.severity === 'high').length}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'zh-CN' ? '高优先级' : 'High Priority'}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {identifiedGaps.filter(g => g.status === 'solution-ready').length}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'zh-CN' ? '解决方案就绪' : 'Solutions Ready'}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {identifiedGaps.length}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'zh-CN' ? '总改进点' : 'Total Gaps'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}