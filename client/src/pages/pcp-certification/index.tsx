/**
 * PCP Coaching Certification Programme - Revolutionary Five Levels
 * The gold standard pathway transforming passionate players into world-class coaches
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  PlayCircle,
  Target,
  Star,
  Trophy,
  GraduationCap,
  Calendar,
  FileText,
  Video,
  UserCheck,
  Briefcase,
  Globe,
  Building,
  Heart,
  Zap,
  TrendingUp,
  Shield,
  Crown
} from 'lucide-react';
import { Link } from 'wouter';

interface CertificationLevel {
  id: number;
  levelName: string;
  levelCode: string;
  description: string;
  prerequisites: any;
  requirements: any;
  benefits: any;
  duration: number;
  cost: number;
  isActive: boolean;
}

interface UserCertificationStatus {
  currentLevel?: string;
  completedLevels: string[];
  inProgress?: {
    levelId: number;
    applicationId: number;
    progress: number;
    status: string;
  };
  availableLevels: number[];
}

export default function PCPCertificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch certification levels
  const { data: levelsResponse, isLoading: levelsLoading } = useQuery({
    queryKey: ['/api/pcp-certification/levels'],
    queryFn: () => apiRequest('GET', '/api/pcp-certification/levels').then(res => res.json())
  });

  // Fetch user's certification status
  const { data: userStatusResponse, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/pcp-certification/my-status'],
    queryFn: () => apiRequest('GET', '/api/pcp-certification/my-status').then(res => res.json()),
    enabled: !!user
  });

  // Revolutionary Five Levels of PCP Certification
  const revolutionaryLevels = [
    {
      id: 1,
      levelName: 'Clear Communication',
      subtitle: 'Entry Coach',
      emoji: '🌱',
      badge: '🟢 Certified Starter Coach',
      color: 'bg-green-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      description: 'Your First Step to Coaching Excellence',
      tagline: 'PCP Level 1 Coaches learn to communicate with clarity, simplicity, and intention. They begin coaching at FPF facilities under supervision, running basic sessions and earning an income while gaining confidence and experience.',
      realWorldRole: 'Entry-level assistant coach at FPF or affiliate venues.',
      icon: Heart,
      features: [
        'Master clear, intentional communication',
        'Start earning income while learning',
        'Supervised coaching at premier facilities',
        'Build confidence with real students'
      ]
    },
    {
      id: 2,
      levelName: 'Listen and Observe',
      subtitle: 'Technical Coach',
      emoji: '🔧',
      badge: '🔵 Certified Technical Coach',
      color: 'bg-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      description: 'Mastering the Art of Technique',
      tagline: 'Level 2 coaches refine their ability to listen to players and observe movement patterns, correcting technique using the CLEAR model. They are recognized as independent technical coaches at PCP and FPF facilities.',
      realWorldRole: 'Full-fledged technical coach with personal clients.',
      icon: Target,
      features: [
        'Advanced movement pattern analysis',
        'Independent coaching authorization',
        'CLEAR model technique correction',
        'Build personal client base'
      ]
    },
    {
      id: 3,
      levelName: 'Educate and Demonstrate',
      subtitle: 'Community Builder',
      emoji: '🌟',
      badge: '🟣 Community Leader Coach',
      color: 'bg-purple-500',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
      description: 'Beyond the Court: Leading With Impact',
      tagline: 'Coaches at Level 3 are empowered to run community programs, lead group clinics, and mentor younger coaches. They focus on building local pickleball ecosystems and uplifting players through education and demonstration.',
      realWorldRole: 'Lead community events, develop club culture, represent PCP in outreach.',
      icon: Users,
      features: [
        'Lead community programs and clinics',
        'Mentor emerging coaches',
        'Build thriving pickleball ecosystems',
        'Represent PCP in community outreach'
      ]
    },
    {
      id: 4,
      levelName: 'Apply Techniques',
      subtitle: 'Facility Manager',
      emoji: '🏢',
      badge: '🟠 Facility Operations Coach',
      color: 'bg-orange-500',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      description: 'Operational Leadership Through Coaching',
      tagline: 'At Level 4, coaching is applied to systems, not just individuals. Coaches are now qualified to manage venues, oversee staff, run leagues, and ensure operational excellence in line with PCP values.',
      realWorldRole: 'Manage a PCP or FPF venue; lead leagues and program scheduling.',
      icon: Building,
      features: [
        'Manage entire venues and facilities',
        'Oversee coaching staff and operations',
        'Run leagues and tournament programs',
        'Ensure systematic operational excellence'
      ]
    },
    {
      id: 5,
      levelName: 'Reinforce',
      subtitle: 'Senior Management & National Coach Track',
      emoji: '👑',
      badge: '⚫️ Master Coach & Executive Track',
      color: 'bg-gray-800',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
      description: 'Visionary Coaching for the Future of the Sport',
      tagline: 'PCP Level 5 Coaches are leaders, mentors, and decision-makers. They influence policy, coach national-level players, lead international certification, and represent PCP globally.',
      realWorldRole: 'High-performance director, senior coach, certification examiner, executive track.',
      icon: Crown,
      features: [
        'Influence sport policy and direction',
        'Coach national and international players',
        'Lead global certification programs',
        'Executive leadership opportunities'
      ]
    }
  ];

  const levels = levelsResponse?.data || revolutionaryLevels;
  const userStatus: UserCertificationStatus = userStatusResponse?.data || {
    completedLevels: [],
    availableLevels: revolutionaryLevels.map(l => l.id)
  };

  const getLevelIcon = (levelCode: string) => {
    switch (levelCode) {
      case 'PCP-L1': return <GraduationCap className="w-6 h-6" />;
      case 'PCP-L2': return <BookOpen className="w-6 h-6" />;
      case 'PCP-L3': return <Users className="w-6 h-6" />;
      case 'PCP-L4': return <Target className="w-6 h-6" />;
      case 'PCP-L5': return <Trophy className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getLevelColor = (levelCode: string) => {
    switch (levelCode) {
      case 'PCP-L1': return 'bg-green-100 text-green-800 border-green-200';
      case 'PCP-L2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PCP-L3': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PCP-L4': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PCP-L5': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const RevolutionaryOverview = () => (
    <div className="space-y-12">
      {/* Revolutionary Hero Section */}
      <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-12 rounded-3xl">
        <div className="flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl">
            <Crown className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">🌱 The Five Levels of PCP Certification</h1>
          <p className="text-2xl font-light max-w-4xl mx-auto leading-relaxed">
            The Revolutionary Pathway That Transforms Passionate Players Into World-Class Coaches
          </p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            From your first step as an Entry Coach to leading the future of pickleball as a Master Coach, 
            each level builds your expertise, earning potential, and impact on the sport.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Badge className="bg-white/20 text-white text-sm px-4 py-2">💰 Earn While You Learn</Badge>
          <Badge className="bg-white/20 text-white text-sm px-4 py-2">🏆 Industry Recognition</Badge>
          <Badge className="bg-white/20 text-white text-sm px-4 py-2">🌍 Global Opportunities</Badge>
        </div>
      </div>

      {/* Revolutionary Five Levels Showcase */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Revolutionary Journey Awaits</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Each level unlocks new opportunities, income potential, and leadership roles in the rapidly growing pickleball industry.
          </p>
        </div>

        <div className="grid gap-8">
          {revolutionaryLevels.map((level, index) => {
            const IconComponent = level.icon;
            const isCompleted = userStatus.completedLevels.includes(`PCP-L${level.id}`);
            const isAvailable = userStatus.availableLevels.includes(level.id);
            
            return (
              <Card key={level.id} className={`${level.borderColor} ${level.bgColor} border-2 overflow-hidden`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`${level.color} text-white p-4 rounded-2xl`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{level.emoji}</span>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Level {level.id}: {level.levelName}
                          </h3>
                        </div>
                        <p className="text-lg font-semibold text-gray-700">{level.subtitle}</p>
                        <Badge className={`${level.color} text-white mt-2`}>{level.badge}</Badge>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{level.description}</h4>
                    <p className="text-gray-700 leading-relaxed">{level.tagline}</p>
                  </div>
                  
                  <div className="bg-white/80 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Real-World Impact
                    </h5>
                    <p className="text-gray-700 italic">{level.realWorldRole}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      What You'll Master
                    </h5>
                    <div className="grid md:grid-cols-2 gap-2">
                      {level.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Investment</p>
                        <p className="font-bold text-lg">Starting at $299</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>
                        <p className="font-bold text-lg">2-6 weeks</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isCompleted ? (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Trophy className="w-4 h-4 mr-2" />
                          Certified
                        </Button>
                      ) : isAvailable ? (
                        <Button className={`${level.color} hover:opacity-90`}>
                          <Zap className="w-4 h-4 mr-2" />
                          Start Level {level.id}
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Shield className="w-4 h-4 mr-2" />
                          Requires Level {level.id - 1}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Revolutionary Call to Action */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white p-12 rounded-3xl text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold">Ready to Transform Your Coaching Career?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join thousands of certified PCP coaches who have turned their passion into a thriving career. 
            Start your journey today and become part of the pickleball coaching revolution.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">150% Income Increase</h3>
            <p className="text-sm opacity-90">Average certified coach earnings vs non-certified</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <Globe className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Global Recognition</h3>
            <p className="text-sm opacity-90">Recognized at 500+ facilities worldwide</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <Users className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Elite Community</h3>
            <p className="text-sm opacity-90">Network with top coaches and industry leaders</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-bold px-8 py-3">
            <Zap className="w-5 h-5 mr-2" />
            Start Level 1 Now
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 py-3">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Info Session
          </Button>
        </div>
      </div>
    </div>
  );

  const CertificationLevels = () => (
    <div className="grid gap-6">
      {levels.map((level: CertificationLevel) => (
        <Card key={level.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getLevelColor(level.levelCode)}`}>
                  {getLevelIcon(level.levelCode)}
                </div>
                <div>
                  <CardTitle>{level.levelName}</CardTitle>
                  <CardDescription>{level.levelCode}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${(level.cost / 100).toFixed(0)}</div>
                <div className="text-sm text-gray-500">
                  {level.duration <= 7 ? `${level.duration} day${level.duration > 1 ? 's' : ''}` : 
                   level.duration === 180 ? '6 months' : `${level.duration} days`}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{level.description}</p>
            
            {level.requirements && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {level.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {level.benefits && (
              <div>
                <h4 className="font-semibold mb-2">What You'll Gain</h4>
                <ul className="space-y-1">
                  {level.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Link href={`/pcp-certification/apply/${level.id}`}>
                <Button className="flex-1">Apply for {level.levelName}</Button>
              </Link>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const MyProgress = () => {
    if (!user) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to view your certification progress</p>
            <Link href="/auth">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {userStatus.inProgress ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-500" />
                Current Certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Level {userStatus.inProgress.levelId}</h3>
                  <Badge>{userStatus.inProgress.status}</Badge>
                </div>
                <Progress value={userStatus.inProgress.progress} />
                <p className="text-sm text-gray-600">
                  {userStatus.inProgress.progress}% complete
                </p>
                <Link href={`/pcp-certification/level/${userStatus.inProgress.levelId}`}>
                  <Button>Continue Learning</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Start Your Journey?</h3>
              <p className="text-gray-600 mb-4">
                Begin with Level 1 certification and build your coaching expertise
              </p>
              <Button>Start Level 1 Application</Button>
            </CardContent>
          </Card>
        )}

        {userStatus.completedLevels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {userStatus.completedLevels.map((levelCode, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{levelCode} Certified</span>
                    </div>
                    <Button variant="outline" size="sm">View Certificate</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (levelsLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading certification information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 mt-[28px] mb-[28px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">🌱 Revolutionary Levels</TabsTrigger>
            <TabsTrigger value="levels">Traditional View</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <RevolutionaryOverview />
          </TabsContent>

          <TabsContent value="levels">
            <CertificationLevels />
          </TabsContent>

          <TabsContent value="progress">
            <MyProgress />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}