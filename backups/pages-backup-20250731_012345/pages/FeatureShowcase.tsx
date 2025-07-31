/**
 * Feature Showcase Page - User Journeys in Pickle+
 * 
 * A simplified overview of what users can actually do in the current app,
 * focusing on real user journeys and implemented features only.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @created 2025-06-27
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  BarChart3,
  BookOpen,
  UserCheck,
  ArrowRight,
  Play
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserJourney {
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
  cta: string;
  path: string;
  status: 'available' | 'coming-soon';
}

export default function FeatureShowcase() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  // User journeys with availability status
  const userJourneys: UserJourney[] = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: language === 'zh-CN' ? '追踪你的进步' : 'Track Your Progress',
      description: language === 'zh-CN' ? '查看详细的比赛统计和PCP评级' : 'View detailed match statistics and PCP ratings',
      steps: [
        language === 'zh-CN' ? '记录比赛结果' : 'Record match results',
        language === 'zh-CN' ? '查看4维度评级' : 'View 4-dimensional ratings',
        language === 'zh-CN' ? '追踪技能进步' : 'Track skill progression'
      ],
      cta: language === 'zh-CN' ? '查看我的数据' : 'View My Stats',
      path: '/profile',
      status: 'available'
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: language === 'zh-CN' ? '成为教练' : 'Become a Coach',
      description: language === 'zh-CN' ? '申请成为认证教练并提供指导服务' : 'Apply to become a certified coach and offer guidance services',
      steps: [
        language === 'zh-CN' ? '完成教练申请' : 'Complete coach application',
        language === 'zh-CN' ? '设置教练档案' : 'Set up coaching profile',
        language === 'zh-CN' ? '接受学员预订' : 'Accept student bookings'
      ],
      cta: language === 'zh-CN' ? '申请教练' : 'Apply as Coach',
      path: '/profile',
      status: 'available'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: language === 'zh-CN' ? '记录成长历程' : 'Journal Your Journey',
      description: language === 'zh-CN' ? '用PickleJourney记录训练心得和情绪变化' : 'Use PickleJourney to record training insights and emotional changes',
      steps: [
        language === 'zh-CN' ? '创建日志条目' : 'Create journal entries',
        language === 'zh-CN' ? '记录情绪和能量' : 'Track mood and energy',
        language === 'zh-CN' ? '获得AI分析' : 'Get AI insights'
      ],
      cta: language === 'zh-CN' ? '即将推出' : 'Coming Soon',
      path: '#',
      status: 'coming-soon'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: language === 'zh-CN' ? '连接球友' : 'Connect with Players',
      description: language === 'zh-CN' ? '在社区中找到球友和参与讨论' : 'Find players and join discussions in the community',
      steps: [
        language === 'zh-CN' ? '浏览社区' : 'Browse communities',
        language === 'zh-CN' ? '发布内容' : 'Create posts',
        language === 'zh-CN' ? '参与讨论' : 'Join discussions'
      ],
      cta: language === 'zh-CN' ? '即将推出' : 'Coming Soon',
      path: '#',
      status: 'coming-soon'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: language === 'zh-CN' ? '参加比赛' : 'Join Tournaments',
      description: language === 'zh-CN' ? '参加各种级别的锦标赛比赛' : 'Participate in tournaments of various skill levels',
      steps: [
        language === 'zh-CN' ? '查看可用比赛' : 'Browse available tournaments',
        language === 'zh-CN' ? '报名参加' : 'Register to participate',
        language === 'zh-CN' ? '查看比赛结果' : 'View match results'
      ],
      cta: language === 'zh-CN' ? '即将推出' : 'Coming Soon',
      path: '#',
      status: 'coming-soon'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-orange-500 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            {/* Navigation Back to Dashboard */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                ← {language === 'zh-CN' ? '返回仪表板' : 'Back to Dashboard'}
              </Button>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {language === 'zh-CN' ? '用户旅程' : 'User Journeys'}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {language === 'zh-CN' 
                ? '探索Pickle+平台上现有功能和即将推出的新特性' 
                : 'Explore current features and upcoming capabilities on the Pickle+ platform'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Status Legend */}
      <section className="py-8 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-blue-600"></div>
              <span className="font-medium">
                {language === 'zh-CN' ? '现已推出' : 'Available Now'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="font-medium">
                {language === 'zh-CN' ? '即将推出' : 'Coming Soon'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* User Journeys Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userJourneys.map((journey, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow duration-300 border-0 backdrop-blur-sm ${
                  journey.status === 'available' ? 'bg-white/80' : 'bg-gray-50/80'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <div className={`mx-auto mb-4 p-3 rounded-xl text-white ${
                        journey.status === 'available' 
                          ? 'bg-gradient-to-r from-orange-500 to-blue-600' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        {journey.icon}
                      </div>
                      {journey.status === 'coming-soon' && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-2 -right-2 bg-orange-100 text-orange-700 border-orange-200"
                        >
                          {language === 'zh-CN' ? '即将推出' : 'Coming Soon'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className={`text-xl mb-2 ${
                      journey.status === 'coming-soon' ? 'text-gray-600' : ''
                    }`}>
                      {journey.title}
                    </CardTitle>
                    <p className={`text-sm ${
                      journey.status === 'coming-soon' ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {journey.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-6">
                      {journey.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className={`flex items-center text-sm ${
                          journey.status === 'coming-soon' ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                            journey.status === 'available' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {stepIndex + 1}
                          </div>
                          {step}
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => journey.status === 'available' ? navigate(journey.path) : null}
                      disabled={journey.status === 'coming-soon'}
                      className={`w-full ${
                        journey.status === 'available'
                          ? 'bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {journey.cta}
                      {journey.status === 'available' && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              {language === 'zh-CN' ? '准备开始了吗？' : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {language === 'zh-CN' 
                ? '加入Pickle+社区，开始您的匹克球之旅' 
                : 'Join the Pickle+ community and start your pickleball journey'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                {language === 'zh-CN' ? '返回仪表板' : 'Go to Dashboard'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-white text-white hover:bg-white/10 px-8 py-4"
              >
                {language === 'zh-CN' ? '立即注册' : 'Sign Up Now'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}