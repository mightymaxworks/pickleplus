/**
 * Feature Showcase Page - What Users Can Do with Pickle+
 * 
 * A comprehensive overview page that demonstrates all platform capabilities
 * organized by user type and use case to help users discover and understand
 * the full potential of the Pickle+ ecosystem.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @created 2025-06-27
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  BookOpen,
  Target,
  BarChart3,
  MapPin,
  Heart,
  MessageCircle,
  Camera,
  Share2,
  Clock,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Play,
  CheckCircle,
  ArrowRight,
  Building2,
  GraduationCap,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  path: string;
  status: 'live' | 'beta' | 'coming-soon';
}

interface UserTypeFeatures {
  title: string;
  description: string;
  color: string;
  features: FeatureCard[];
}

export default function FeatureShowcase() {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState('players');

  // Feature definitions by user type
  const userTypes: Record<string, UserTypeFeatures> = {
    players: {
      title: language === 'zh-CN' ? '球员功能' : 'Player Features',
      description: language === 'zh-CN' ? '提升您的匹克球技能和比赛体验' : 'Elevate your pickleball skills and match experience',
      color: 'from-blue-500 to-cyan-500',
      features: [
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: language === 'zh-CN' ? 'PCP 4维度评级系统' : 'PCP 4-Dimensional Rating System',
          description: language === 'zh-CN' ? '获得技术、战术、体能、心理四个维度的专业评估' : 'Get professional assessment across Technical, Tactical, Physical, and Mental dimensions',
          benefits: [
            language === 'zh-CN' ? '详细技能分析' : 'Detailed skill analysis',
            language === 'zh-CN' ? '个性化改进建议' : 'Personalized improvement recommendations',
            language === 'zh-CN' ? '进步追踪' : 'Progress tracking'
          ],
          cta: language === 'zh-CN' ? '查看我的评级' : 'View My Rating',
          path: '/profile',
          status: 'live'
        },
        {
          icon: <BookOpen className="w-6 h-6" />,
          title: language === 'zh-CN' ? 'PickleJourney™ 成长日志' : 'PickleJourney™ Growth Journal',
          description: language === 'zh-CN' ? '记录训练心得，追踪情绪和能量水平变化' : 'Record training insights and track emotional and energy level changes',
          benefits: [
            language === 'zh-CN' ? 'AI情感分析' : 'AI sentiment analysis',
            language === 'zh-CN' ? '多角色日志' : 'Multi-role journaling',
            language === 'zh-CN' ? '成就解锁' : 'Achievement unlocks'
          ],
          cta: language === 'zh-CN' ? '开始记录' : 'Start Journaling',
          path: '/picklejourney',
          status: 'live'
        },
        {
          icon: <Trophy className="w-6 h-6" />,
          title: language === 'zh-CN' ? '比赛记录与统计' : 'Match Recording & Statistics',
          description: language === 'zh-CN' ? '详细记录比赛数据，分析表现趋势' : 'Detailed match data recording and performance trend analysis',
          benefits: [
            language === 'zh-CN' ? '实时比分追踪' : 'Real-time score tracking',
            language === 'zh-CN' ? '详细统计分析' : 'Detailed statistical analysis',
            language === 'zh-CN' ? '排名积分系统' : 'Ranking points system'
          ],
          cta: language === 'zh-CN' ? '记录比赛' : 'Record Match',
          path: '/matches',
          status: 'live'
        },
        {
          icon: <Building2 className="w-6 h-6" />,
          title: language === 'zh-CN' ? '训练中心预订' : 'Training Center Booking',
          description: language === 'zh-CN' ? '预订专业训练课程，参与团体训练' : 'Book professional training sessions and join group classes',
          benefits: [
            language === 'zh-CN' ? '专业教练指导' : 'Professional coach guidance',
            language === 'zh-CN' ? '设施预订' : 'Facility booking',
            language === 'zh-CN' ? '课程管理' : 'Class management'
          ],
          cta: language === 'zh-CN' ? '查看课程' : 'Browse Classes',
          path: '/player-development-hub',
          status: 'live'
        }
      ]
    },
    coaches: {
      title: language === 'zh-CN' ? '教练功能' : 'Coach Features',
      description: language === 'zh-CN' ? '管理学员，提升教学效果' : 'Manage students and enhance teaching effectiveness',
      color: 'from-green-500 to-emerald-500',
      features: [
        {
          icon: <GraduationCap className="w-6 h-6" />,
          title: language === 'zh-CN' ? 'PCP 认证计划' : 'PCP Certification Programme',
          description: language === 'zh-CN' ? '获得5级专业认证，提升教练资质' : 'Earn 5-level professional certification and enhance coaching credentials',
          benefits: [
            language === 'zh-CN' ? '在线学习模块' : 'Online learning modules',
            language === 'zh-CN' ? '实践评估' : 'Practical assessments',
            language === 'zh-CN' ? '专业认证' : 'Professional certification'
          ],
          cta: language === 'zh-CN' ? '开始认证' : 'Start Certification',
          path: '/pcp-certification',
          status: 'live'
        },
        {
          icon: <UserCheck className="w-6 h-6" />,
          title: language === 'zh-CN' ? '教练申请系统' : 'Coach Application System',
          description: language === 'zh-CN' ? '5步申请流程，展示专业资质' : '5-step application process to showcase professional qualifications',
          benefits: [
            language === 'zh-CN' ? '资质验证' : 'Credential verification',
            language === 'zh-CN' ? '费率设置' : 'Rate setting',
            language === 'zh-CN' ? '专业档案' : 'Professional profile'
          ],
          cta: language === 'zh-CN' ? '申请成为教练' : 'Apply as Coach',
          path: '/coach-application',
          status: 'live'
        },
        {
          icon: <Calendar className="w-6 h-6" />,
          title: language === 'zh-CN' ? '课程管理' : 'Class Management',
          description: language === 'zh-CN' ? '创建课程，管理学员，追踪进度' : 'Create classes, manage students, track progress',
          benefits: [
            language === 'zh-CN' ? '课程创建' : 'Class creation',
            language === 'zh-CN' ? '学员管理' : 'Student management',
            language === 'zh-CN' ? '进度追踪' : 'Progress tracking'
          ],
          cta: language === 'zh-CN' ? '管理课程' : 'Manage Classes',
          path: '/coach-dashboard',
          status: 'beta'
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: language === 'zh-CN' ? '学员评估工具' : 'Student Assessment Tools',
          description: language === 'zh-CN' ? '使用PCP系统评估学员技能水平' : 'Use PCP system to assess student skill levels',
          benefits: [
            language === 'zh-CN' ? '4维度评估' : '4-dimensional assessment',
            language === 'zh-CN' ? '个性化建议' : 'Personalized recommendations',
            language === 'zh-CN' ? '进步报告' : 'Progress reports'
          ],
          cta: language === 'zh-CN' ? '评估学员' : 'Assess Students',
          path: '/coach-tools',
          status: 'beta'
        }
      ]
    },
    community: {
      title: language === 'zh-CN' ? '社区功能' : 'Community Features',
      description: language === 'zh-CN' ? '连接球友，参与社区活动' : 'Connect with players and participate in community activities',
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: <Users className="w-6 h-6" />,
          title: language === 'zh-CN' ? '球友社区' : 'Player Communities',
          description: language === 'zh-CN' ? '加入本地社区，寻找训练伙伴' : 'Join local communities and find training partners',
          benefits: [
            language === 'zh-CN' ? '社区发现' : 'Community discovery',
            language === 'zh-CN' ? '活动参与' : 'Event participation',
            language === 'zh-CN' ? '球友连接' : 'Player connections'
          ],
          cta: language === 'zh-CN' ? '探索社区' : 'Explore Communities',
          path: '/communities',
          status: 'live'
        },
        {
          icon: <Trophy className="w-6 h-6" />,
          title: language === 'zh-CN' ? '锦标赛系统' : 'Tournament System',
          description: language === 'zh-CN' ? '参加比赛，争夺排名积分' : 'Participate in tournaments and compete for ranking points',
          benefits: [
            language === 'zh-CN' ? '比赛报名' : 'Tournament registration',
            language === 'zh-CN' ? '对阵安排' : 'Bracket management',
            language === 'zh-CN' ? '积分奖励' : 'Points rewards'
          ],
          cta: language === 'zh-CN' ? '查看比赛' : 'View Tournaments',
          path: '/tournaments',
          status: 'beta'
        },
        {
          icon: <MessageCircle className="w-6 h-6" />,
          title: language === 'zh-CN' ? '社交互动' : 'Social Interactions',
          description: language === 'zh-CN' ? '分享动态，互动交流' : 'Share updates and interact with others',
          benefits: [
            language === 'zh-CN' ? '动态分享' : 'Status sharing',
            language === 'zh-CN' ? '评论互动' : 'Comment interactions',
            language === 'zh-CN' ? '成就展示' : 'Achievement showcase'
          ],
          cta: language === 'zh-CN' ? '开始互动' : 'Start Interacting',
          path: '/social',
          status: 'coming-soon'
        },
        {
          icon: <Star className="w-6 h-6" />,
          title: language === 'zh-CN' ? '排行榜系统' : 'Leaderboard System',
          description: language === 'zh-CN' ? '查看全球排名，追踪进步' : 'View global rankings and track progress',
          benefits: [
            language === 'zh-CN' ? '全球排名' : 'Global rankings',
            language === 'zh-CN' ? '地区排行' : 'Regional leaderboards',
            language === 'zh-CN' ? '成就对比' : 'Achievement comparison'
          ],
          cta: language === 'zh-CN' ? '查看排行榜' : 'View Leaderboards',
          path: '/leaderboards',
          status: 'coming-soon'
        }
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      live: { label: language === 'zh-CN' ? '已上线' : 'Live', variant: 'default' as const },
      beta: { label: language === 'zh-CN' ? '测试版' : 'Beta', variant: 'secondary' as const },
      'coming-soon': { label: language === 'zh-CN' ? '即将推出' : 'Coming Soon', variant: 'outline' as const }
    };
    
    return badges[status as keyof typeof badges] || badges.live;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10" />
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-6">
              {language === 'zh-CN' ? '发现 Pickle+ 的无限可能' : 'Discover What\'s Possible with Pickle+'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {language === 'zh-CN' 
                ? '从初学者到专业选手，从个人训练到团队协作，Pickle+ 为每一位匹克球爱好者提供完整的成长生态系统'
                : 'From beginner to pro, from individual training to team collaboration, Pickle+ provides a complete growth ecosystem for every pickleball enthusiast'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => navigate('/dashboard')}
              >
                <Play className="w-5 h-5 mr-2" />
                {language === 'zh-CN' ? '开始体验' : 'Start Exploring'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                {language === 'zh-CN' ? '免费注册' : 'Sign Up Free'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Categories */}
      <div className="container mx-auto px-4 py-16">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {language === 'zh-CN' ? '球员' : 'Players'}
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {language === 'zh-CN' ? '教练' : 'Coaches'}
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'zh-CN' ? '社区' : 'Community'}
            </TabsTrigger>
          </TabsList>

          {Object.entries(userTypes).map(([key, userType]) => (
            <TabsContent key={key} value={key}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Section Header */}
                <div className={`text-center mb-12 p-8 rounded-2xl bg-gradient-to-r ${userType.color} text-white`}>
                  <h2 className="text-3xl font-bold mb-4">{userType.title}</h2>
                  <p className="text-xl opacity-90">{userType.description}</p>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                  {userType.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${userType.color} text-white`}>
                              {feature.icon}
                            </div>
                            <Badge {...getStatusBadge(feature.status)} />
                          </div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-6">
                            {feature.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full group"
                            onClick={() => navigate(feature.path)}
                            disabled={feature.status === 'coming-soon'}
                          >
                            {feature.cta}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'zh-CN' ? 'Pickle+ 生态系统' : 'The Pickle+ Ecosystem'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'zh-CN' ? '全球球员的成长数据' : 'Growth metrics from players worldwide'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10,000+', label: language === 'zh-CN' ? '活跃用户' : 'Active Users' },
              { number: '50,000+', label: language === 'zh-CN' ? '比赛记录' : 'Matches Recorded' },
              { number: '200+', label: language === 'zh-CN' ? '认证教练' : 'Certified Coaches' },
              { number: '15+', label: language === 'zh-CN' ? '训练中心' : 'Training Centers' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-orange-500 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {language === 'zh-CN' ? '准备好开始您的匹克球之旅了吗？' : 'Ready to Start Your Pickleball Journey?'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {language === 'zh-CN' 
                ? '加入 Pickle+ 社区，解锁您的运动潜能'
                : 'Join the Pickle+ community and unlock your athletic potential'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => navigate('/auth')}
              >
                <Smartphone className="w-5 h-5 mr-2" />
                {language === 'zh-CN' ? '立即开始' : 'Get Started Now'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                {language === 'zh-CN' ? '联系我们' : 'Contact Us'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}